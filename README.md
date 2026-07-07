# Klarvo

**Reservas, gestión de clientes y facturación para profesionales de belleza, estética y bienestar.**
Tu agenda y tus facturas en un mismo sitio — listo para VeriFactu 2027.

> Diferenciación: cumplimiento fiscal español nativo (VeriFactu), precio plano para el
> profesional solo, anti no-show por defecto y propiedad total de los datos del cliente.

---

## Stack

| Capa         | Tecnología                                                             |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router) · React 18 · TypeScript                        |
| UI           | Tailwind CSS · Framer Motion (animaciones estilo Apple) · lucide-react |
| Backend      | Route Handlers / Server Actions · Supabase (Postgres + Auth + Storage) |
| Multi-tenant | Row Level Security (aislamiento por negocio)                           |
| Pagos        | Stripe (Checkout, Payment Intents, Connect, Billing)                   |
| Email        | Resend                                                                 |
| Tests        | Vitest (unitarios) · Playwright (E2E, pendiente)                       |

## Arranque

```bash
npm install
cp .env.example .env.local   # rellena las claves de Supabase y Stripe
npm run dev                  # http://localhost:3000
```

Sin claves de Supabase la web pública y el panel (con datos de demo) funcionan igual;
el registro/login se activan al configurar `.env.local`.

## Desarrollo local con Supabase (Docker)

Para probar la app con un backend real (auth, base de datos y storage) sin depender
de la nube, se usa la CLI de Supabase, que levanta todo el stack en Docker.

**Requisitos:** Docker Desktop en marcha.

```bash
npm install            # instala también la CLI de Supabase (devDependency)
npm run setup:local    # arranca Supabase en Docker y genera .env.local
npm run dev            # http://localhost:3000
```

`npm run setup:local` equivale a `supabase start` + `scripts/db-env.sh`, que
escribe `.env.local` con la URL y las claves locales. Al arrancar se aplican las
migraciones de `supabase/migrations/` y se carga `supabase/seed.sql`, que crea un
negocio de demostración ("Estudio Martina") con servicios, clientes y las citas de
hoy, además de un usuario de acceso:

```
email:    demo@klarvo.local
password: demo1234
```

Servicios locales útiles:

| Servicio          | URL                    |
| ----------------- | ---------------------- |
| App               | http://localhost:3000  |
| Supabase Studio   | http://127.0.0.1:54323 |
| Bandeja de correo | http://127.0.0.1:54324 |
| API / Postgres    | 54321 / 54322          |

### Scripts de base de datos

```bash
npm run db:start    # arranca Supabase local (Docker)
npm run db:stop     # detiene los contenedores
npm run db:reset    # recrea la BD: migraciones + seed desde cero
npm run db:status   # muestra URLs y claves locales
npm run db:env      # regenera .env.local desde el estado actual
```

## Scripts

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run typecheck   # comprobación de tipos
npm run test        # tests unitarios (Vitest)
npm run lint        # ESLint
```

## Estructura

```
src/
  app/                 rutas (App Router)
    page.tsx           landing
    precios/ caracteristicas/ verifactu/
    login/ registro/   auth
    legal/             privacidad, términos, cookies, DPA
    reservar/[negocio] reserva pública (sin login)
    app/               panel (dashboard, calendario, servicios, clientes,
                       facturación, métricas, ajustes)
    api/               health, stripe/webhook
  components/          landing, layout, app, auth, reservar, motion, ui, legal
  lib/
    config.ts          planes, verticales, navegación
    utils.ts           helpers (dinero, fechas, slug)
    supabase/          clientes browser/server
    stripe/            cliente servidor
    facturacion/hash   encadenado append-only (VeriFactu-ready)
    reservas/          disponibilidad, depósitos, cancelación
    mock.ts            datos de demostración del panel
  middleware.ts        refresco de sesión + protección de /app
supabase/migrations/   esquema SQL + RLS + funciones
```

## Facturación lista para VeriFactu

Las facturas se diseñan **append-only** y se encadenan con una huella SHA-256
(`hash_anterior` → `hash_actual`), de forma que el salto a VeriFactu sea de
configuración y no de reescritura. Ver `src/lib/facturacion/hash.ts` y
`supabase/migrations/`.

> La información sobre VeriFactu es orientativa y no constituye asesoría fiscal.

## Seguridad

- Aislamiento multi-tenant con RLS en Postgres.
- Cabeceras de seguridad (`next.config.mjs`).
- Idempotencia de webhooks de Stripe (`eventos_stripe`).
- Numeración de facturas a prueba de concurrencia (advisory lock).
- PCI-DSS delegado en Stripe (nunca se almacenan tarjetas).

## Despliegue con Docker

La app se compila con salida **standalone** de Next.js, lo que produce una
imagen mínima y autocontenida que corre en cualquier equipo con Docker.

```bash
# Construir y arrancar (http://localhost:3000)
docker compose up --build

# En segundo plano
docker compose up -d

# Detener
docker compose down
```

También se puede construir la imagen directamente:

```bash
docker build -t klarvo:local .
docker run --rm -p 3000:3000 --env-file .env.local klarvo:local
```

La imagen expone un `HEALTHCHECK` contra `/api/health`. Las variables
`NEXT_PUBLIC_*` se inyectan en tiempo de build (`--build-arg`); las de servidor
(Supabase service role, Stripe, Resend, cron) se pasan en tiempo de ejecución
mediante `--env-file` o `environment` en el compose.

## CI/CD (GitHub Actions)

- **CI** (`.github/workflows/ci.yml`): en cada push y pull request a `main`
  ejecuta lint, typecheck, tests (Vitest) y build de producción.
- **CD** (`.github/workflows/cd.yml`): al integrar en `main` o publicar un tag
  `vX.Y.Z`, construye la imagen Docker y la publica en **GHCR**
  (`ghcr.io/<owner>/klarvo`) usando el `GITHUB_TOKEN` integrado.
- **Despliegue por SSH** (opcional): si se definen las variables/secretos
  `DEPLOY_ENABLED=true`, `DEPLOY_HOST`, `DEPLOY_USER` y `DEPLOY_SSH_KEY`, el
  workflow hace `docker pull` de la imagen y reinicia el contenedor en el
  servidor destino.

## Licencia

Propietario. © Klarvo.
