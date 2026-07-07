# Guía de funcionamiento de Klarvo

> SaaS de reservas + clientes + facturación para profesionales de belleza y bienestar.
> Next.js 15 (App Router) + Supabase (Postgres + Auth + RLS) + Stripe + Resend.
> Preparado para VeriFactu (facturación encadenada con huella SHA-256 y QR).

Esta guía explica **cómo está construida la aplicación**, **qué hace cada ruta** y
**cómo fluyen los datos** de principio a fin. Sirve como mapa para desarrollar,
depurar y hacer onboarding de nuevas personas al proyecto.

---

## 1. Arquitectura en una frase

Todo corre dentro de **Next.js**: las páginas son **Server Components** que leen
datos con la sesión del usuario (RLS de Supabase decide qué ve cada negocio), y
las mutaciones son **Server Actions** validadas con **zod**. Hay tres clientes de
Supabase según el contexto (navegador, servidor con sesión, y admin sin sesión)
y una serie de **rutas API** para webhooks de Stripe y tareas programadas (cron).

Principio transversal: **degradación elegante**. Si no hay variables de entorno
de Supabase/Stripe, la app arranca en **modo demo** con datos de ejemplo
(`src/lib/mock.ts`) en lugar de romperse. Esto lo deciden los helpers de
[env.ts](../src/lib/env.ts): `hasSupabase()`, `hasSupabaseAdmin()`, `hasStripe()`.

---

## 2. Modelo mental de capas

```
┌──────────────────────────────────────────────────────────────┐
│  Rutas (src/app/**)  →  Páginas RSC + Route Handlers          │
│     · leen datos con las funciones de src/lib/db/**           │
│     · renderizan componentes de src/components/**             │
├──────────────────────────────────────────────────────────────┤
│  Server Actions (src/lib/**/actions.ts)  →  mutaciones        │
│     · 'use server' + validación zod + revalidatePath          │
├──────────────────────────────────────────────────────────────┤
│  Capa de datos (src/lib/db/**)  →  consultas de lectura       │
│     · panel.ts (autenticado, RLS) · reservas-publicas.ts      │
│       (público, admin) · cita-gestion.ts (por token)          │
├──────────────────────────────────────────────────────────────┤
│  Dominio (src/lib/**)  →  lógica pura y reglas                │
│     · reservas/disponibilidad.ts · facturacion/hash.ts        │
├──────────────────────────────────────────────────────────────┤
│  Infraestructura                                              │
│     · supabase/{client,server,admin}.ts · stripe/server.ts    │
│     · email/resend.ts · notificaciones/programar.ts           │
└──────────────────────────────────────────────────────────────┘
```

### Los tres clientes de Supabase

| Cliente   | Archivo                                    | Sesión             | RLS               | Se usa en                       |
| --------- | ------------------------------------------ | ------------------ | ----------------- | ------------------------------- |
| Navegador | [client.ts](../src/lib/supabase/client.ts) | cookie             | Sí                | componentes cliente (login)     |
| Servidor  | [server.ts](../src/lib/supabase/server.ts) | cookie del usuario | **Sí**            | páginas del panel y sus actions |
| Admin     | [admin.ts](../src/lib/supabase/admin.ts)   | service-role       | **No (la salta)** | reserva pública, webhook, cron  |

> El cliente **admin** solo se usa en flujos sin usuario autenticado y que ya
> validan el `negocio_id` por otra vía (slug, token, o metadata firmada de Stripe).

---

## 3. Multi-tenant y seguridad (RLS)

- Cada tabla lleva `negocio_id`. La pertenencia se comprueba con la función SQL
  `es_miembro(negocio_id)` (mira la tabla `miembros` del usuario en sesión).
- Migraciones en `supabase/migrations/`:
  - `0001_schema.sql` — tablas, tipos enum, índices.
  - `0002_rls.sql` — políticas RLS por tabla (`facturas` es _append-only_: solo
    `select`/`insert`, nunca `update`/`delete`).
  - `0003_functions.sql` — `siguiente_numero_factura` (numeración correlativa con
    advisory lock), `handle_new_user` (crea negocio + miembro al registrarse),
    `expirar_reservas_pendientes`.
  - `0004_grants.sql` — **imprescindible**: concede privilegios a los roles de la
    Data API. Sin esto, PostgREST devuelve _"permission denied"_ aunque el RLS
    esté bien. Aplícalo también en producción.
- El [middleware.ts](../src/middleware.ts) refresca la cookie de sesión y protege
  `/app/**` (redirige a `/login` sin sesión) y bloquea `/login` y `/registro` si
  ya hay sesión.

---

## 4. Recorrido por las rutas

### 4.1 Público (marketing)

| Ruta                                       | Qué hace                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `/`                                        | Landing modular (hero, verticales, features, VeriFactu, precios, FAQ, CTA). |
| `/precios`                                 | Planes con toggle mensual/anual (datos en `src/lib/config.ts`).             |
| `/caracteristicas`                         | Detalle de funcionalidades.                                                 |
| `/verifactu`                               | Explicación del cumplimiento VeriFactu.                                     |
| `/legal/{privacidad,terminos,cookies,dpa}` | Textos legales (RGPD/LOPDGDD).                                              |
| `/login`, `/registro`                      | Autenticación con Supabase (ver §5).                                        |

### 4.2 Reserva pública (sin login)

| Ruta                  | Qué hace                                             |
| --------------------- | ---------------------------------------------------- |
| `/reservar/[negocio]` | Página de reserva del negocio resuelto por **slug**. |
| `/cita/[token]`       | Gestión de una cita por **token** (ver o cancelar).  |

Flujo en [reservar/[negocio]/page.tsx](../src/app/reservar/%5Bnegocio%5D/page.tsx):

1. `getNegocioPorSlug(slug)` → si no existe, `notFound()`.
2. `getServiciosPublicos(negocio.id)` y `getHuecosDisponibles(...)` para el primer servicio.
3. Renderiza `BookingFlow` (componente cliente de 4 pasos).

### 4.3 Panel autenticado (`/app/**`)

| Ruta                    | Lee                                                                                 | Acciones                                   |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `/app`                  | `getMetricas`, `getMiNegocio`, `getCitasHoy`, `getFacturas`, `getResumenOnboarding` | banner onboarding                          |
| `/app/calendario`       | `getAgendaDia`, `getServicios`, `getClientes`                                       | completar, facturar, **crear cita manual** |
| `/app/servicios`        | `getServicios`                                                                      | crear / activar-pausar servicio            |
| `/app/clientes`         | `getClientes`                                                                       | crear cliente                              |
| `/app/facturacion`      | `getFacturas`                                                                       | abrir detalle                              |
| `/app/facturacion/[id]` | `getFacturaDetalle`                                                                 | ver factura + **QR**                       |
| `/app/metricas`         | `getMetricas`                                                                       | —                                          |
| `/app/ajustes`          | `getNegocioAjustes`                                                                 | guardar datos fiscales + horario           |
| `/app/onboarding`       | `getResumenOnboarding`                                                              | wizard de 3 pasos                          |

### 4.4 Rutas API

| Ruta                             | Método | Qué hace                                 |
| -------------------------------- | ------ | ---------------------------------------- |
| `/api/health`                    | GET    | healthcheck.                             |
| `/api/stripe/webhook`            | POST   | procesa eventos de Stripe (ver §6).      |
| `/api/cron/expirar-reservas`     | GET    | libera citas `PENDIENTE_PAGO` caducadas. |
| `/api/cron/enviar-recordatorios` | GET    | envía recordatorios de cita por email.   |

Los cron están protegidos con `CRON_SECRET` (o el header `x-vercel-cron`) y se
programan en [vercel.json](../vercel.json).

---

## 5. Autenticación y alta de negocio

1. En `/registro`, el formulario cliente llama a `supabase.auth.signUp`.
2. En local, la confirmación de email está desactivada → hay sesión inmediata y
   se redirige a `/app/onboarding`. En producción se muestra "confirma tu email".
3. Al crearse el usuario, el trigger SQL `handle_new_user` crea automáticamente
   el **negocio**, el **miembro** (dueño) y un **profesional**.
4. El onboarding se considera completo cuando el negocio tiene ≥1 servicio
   (`getResumenOnboarding().completo`).

---

## 6. Flujo de reserva con depósito (el más completo)

```
Cliente elige servicio + hueco
        │
        ▼
crearReserva()  ──►  ¿hay depósito?
        │                 │
        │  no             │ sí
        ▼                 ▼
 cita CONFIRMADA     cita PENDIENTE_PAGO (expira_en = +15 min)
 + email confirm.         │
 + recordatorio           ▼
                    Stripe Checkout (depósito)
                          │
              ┌───────────┴────────────┐
         pago OK                    no paga
              │                         │
              ▼                         ▼
   webhook payment_intent      cron expirar-reservas
   .succeeded                  libera el hueco (a los 15 min)
   → cita CONFIRMADA
   → email confirmación
   → programa recordatorio
```

Detalles clave en [reservas/actions.ts](../src/lib/reservas/actions.ts):

- El hueco se **bloquea** creando la cita en `PENDIENTE_PAGO` con `expira_en`.
- **Stripe Checkout** (corregido en la última revisión):
  - `expires_at` se fija a **30 min** (mínimo que exige Stripe; el bloqueo de 15
    min lo gestiona el cron aparte).
  - La comisión (`application_fee_amount` + `transfer_data`) **solo** se añade si
    el negocio tiene `stripe_account_id` (Stripe Connect). Sin cuenta conectada
    se cobra sin reparto, evitando el error de Stripe.
- El **webhook** confirma la cita de forma **idempotente**: registra `event.id`
  en `eventos_stripe` (PK única) antes de aplicar efectos; si falla, borra el
  registro para permitir el reintento de Stripe.

Cancelación en [gestion-actions.ts](../src/lib/reservas/gestion-actions.ts): si la
cancelación entra dentro de la ventana de 24 h y el depósito se pagó, se emite el
**reembolso** por Stripe; la cita pasa a `CANCELADA_CLIENTE`.

---

## 7. Facturación encadenada (VeriFactu-ready)

En [facturacion/actions.ts](../src/lib/facturacion/actions.ts) → `emitirFacturaDeCita`:

1. Valida que la cita esté **COMPLETADA** (y no ya facturada) con el cliente
   autenticado (RLS).
2. Calcula base + IVA (21% incluido) a partir del precio del servicio.
3. Pide el **número correlativo** con `siguiente_numero_factura` (advisory lock →
   sin duplicados en concurrencia).
4. Encadena: `hash_actual = SHA-256(datos_factura + hash_anterior)`
   ([hash.ts](../src/lib/facturacion/hash.ts)). La primera de la serie usa
   `HASH_GENESIS`.
5. Inserta la factura (append-only) y marca la cita como `FACTURADA`.

La página `/app/facturacion/[id]` reconstruye el **QR verificable** con
`QRCode.toString(qr, { type: 'svg' })` y muestra la cadena de hashes. La función
`verificarCadena()` permite auditar la integridad de toda la serie.

---

## 8. Recordatorios por email

- Al confirmarse una cita (reserva sin depósito, webhook de pago, o cita manual)
  se llama a `programarRecordatorioCita()`
  ([programar.ts](../src/lib/notificaciones/programar.ts)), que inserta una fila
  en `notificaciones` con `programada_en = inicio − 24 h` (solo si aún falta ≥24 h).
- El cron `/api/cron/enviar-recordatorios` (cada 5 min) lee las notificaciones
  vencidas, envía el email con `emailRecordatorioCita()` y las marca `enviada`.
  Si la cita ya no está activa, las marca `cancelada` sin enviar.
- El envío real usa **Resend** vía API REST ([resend.ts](../src/lib/email/resend.ts));
  si no hay `RESEND_API_KEY`, no falla: simplemente no envía (útil en desarrollo).

---

## 9. Estados de una cita

```
BORRADOR → PENDIENTE_PAGO → CONFIRMADA → (RECORDADA)
   → COMPLETADA → FACTURADA
   │
   └→ CANCELADA_CLIENTE | CANCELADA_NEGOCIO | NO_SHOW
```

- `completable` = no está FACTURADA/CANCELADA/NO_SHOW.
- Solo una cita **COMPLETADA** se puede facturar.

---

## 10. Cómo ejecutar en local

```bash
npm install
npm run db:start      # Supabase local (Docker): API 54321, DB 54322, Studio 54323
npm run db:reset      # aplica migraciones + seed (usuario demo)
npm run db:env        # genera .env.local con las claves locales
npm run dev           # http://localhost:3000
```

- Usuario demo del seed: `demo@klarvo.local` / `demo1234` (negocio "Estudio Martina").
- Sin `.env.local`, la app arranca igualmente en **modo demo** con datos de ejemplo.
- Comandos de calidad: `npm run build`, `npm run test` (Vitest), `npx tsc --noEmit`,
  `npx next lint`.

---

## 11. Variables de entorno

| Variable                                    | Para qué                                        |
| ------------------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` | cliente navegador + servidor (RLS).             |
| `SUPABASE_SERVICE_ROLE_KEY`                 | cliente admin (reserva pública, webhook, cron). |
| `STRIPE_SECRET_KEY`                         | pagos y reembolsos.                             |
| `STRIPE_WEBHOOK_SECRET`                     | verificación de firma del webhook.              |
| `STRIPE_APPLICATION_FEE_PERCENT`            | % de comisión sobre depósitos (Connect).        |
| `RESEND_API_KEY` / `EMAIL_FROM`             | envío de emails.                                |
| `CRON_SECRET`                               | protección de los endpoints cron.               |
| `NEXT_PUBLIC_APP_URL`                       | URLs absolutas (Checkout, emails).              |

---

## 12. Estado de calidad (última revisión)

- ✅ `npx tsc --noEmit` — sin errores de tipos.
- ✅ `npx next lint` — sin warnings ni errores.
- ✅ `npm run build` — 26 rutas.
- ✅ `npm run test` — 14 tests (hash de facturas + disponibilidad).

### Bug corregido en esta revisión

En `crearReserva` (Stripe Checkout) había **dos fallos que impedían cobrar
cualquier depósito** (ambos caían en el mismo `catch` genérico):

1. `expires_at` se fijaba a 15 min, pero Stripe exige **mínimo 30 min** → la
   creación de la sesión lanzaba excepción. Corregido a 30 min.
2. `application_fee_amount` se enviaba **siempre**, pero Stripe solo lo admite con
   una cuenta conectada. Ahora se añade **solo** si el negocio tiene
   `stripe_account_id`, con su `transfer_data.destination`.

### Limitaciones conocidas (no son errores)

- La reserva pública solo ofrece huecos de **hoy** y usa un horario fijo 9–19 h
  (aún no lee `horario_json` del negocio).
- `getMetricas().ocupacion` es un placeholder (0).
- La factura se muestra en HTML con QR; falta el **PDF descargable**.
