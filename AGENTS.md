# AGENTS.md — Klarvo

Guía para agentes de IA que trabajen en este repositorio.

## Qué es

SaaS multi-tenant de reservas + clientes + facturación para belleza y bienestar.
Diferenciador clave: **facturación lista para VeriFactu 2027**. Mercado inicial: España.

## Stack y convenciones

- Next.js 15 (App Router), React 18, TypeScript estricto.
- Tailwind CSS + Framer Motion (animaciones suaves estilo Apple, easing `[0.16,1,0.3,1]`).
- Supabase (Postgres + Auth + Storage) con **Row Level Security** para el aislamiento entre negocios.
- Stripe para depósitos (Connect) y suscripciones (Billing).
- Import alias `@/*` → `src/*`.
- Dinero **siempre en céntimos** (enteros) para evitar errores de coma flotante.
- Textos de cara al usuario en **español**.
- Componentes de servidor por defecto; `"use client"` solo cuando haya estado/animación.

## Reglas de negocio críticas

- Máquina de estados de cita: BORRADOR → PENDIENTE_PAGO → CONFIRMADA → RECORDADA →
  COMPLETADA → FACTURADA | CANCELADA_CLIENTE | CANCELADA_NEGOCIO | NO_SHOW.
- Reserva de slot con lock temporal (`expira_en`) para evitar doble booking.
- Facturas **append-only** encadenadas por hash (nunca update/delete). Ver `lib/facturacion/hash.ts`.
- Numeración de facturas correlativa y sin huecos (advisory lock en `siguiente_numero_factura`).
- Idempotencia de webhooks Stripe vía tabla `eventos_stripe`.

## Seguridad (OWASP)

- No confiar en entradas del cliente final (reservas públicas) — validar en servidor.
- RLS activo en toda tabla con `negocio_id`. Escrituras públicas solo vía service role validada.
- Nunca almacenar datos de tarjeta (los gestiona Stripe).
- Datos de salud = categoría especial → cifrado reforzado antes de entrar a ese vertical.

## Antes de dar por terminado

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

## Legal

- Textos legales en `src/app/legal/*` son plantillas orientativas, no asesoría.
- Mencionar VeriFactu siempre con la cautela de que las fechas pueden cambiar.
