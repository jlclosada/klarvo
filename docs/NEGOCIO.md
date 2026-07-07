# Plan de negocio — Klarvo

Sistema de reservas, gestión de clientes y facturación para profesionales de belleza,
estética y bienestar. **Listo para VeriFactu 2027.**

---

## 1. Propuesta de valor

> "Gestiona tu agenda, cobra depósitos y no pierdas ni un cliente ni una factura —
> todo en un mismo sitio, listo para 2027."

Resuelve: reservas online sin llamadas, reducción de no-shows (depósito/tarjeta de
garantía), historial de cliente, recordatorios automáticos y facturación legal.

## 2. Diferenciación (vs Fresha / Booksy / Treatwell)

1. **VeriFactu nativo** — facturación verificable integrada desde el núcleo (gancho legal).
2. **Precio plano para el profesional solo** — sin comisión sobre clientes propios.
3. **Anti no-show por defecto** — depósito o tarjeta de garantía al reservar.
4. **Propiedad del cliente** — los datos son del negocio, no de un marketplace.
5. **Onboarding < 10 min** — plantillas por vertical.
6. **Soberanía de datos UE (RGPD)** — ventaja para el vertical salud.

## 3. Público objetivo

Peluquerías y barberías (1-5 profesionales), estética y uñas, masaje/spa, fisioterapia,
entrenamiento personal, yoga/pilates, psicología y nutrición.
Mercado inicial: **España** (gancho VeriFactu). Fase 2: **LATAM**.

## 4. Funcionalidades por fase

- **MVP:** calendario, servicios, página pública de reserva, horarios, ficha de cliente,
  depósitos (Stripe), recordatorios email 24 h, política de cancelación, factura
  simplificada encadenada, métricas.
- **Fase 2:** WhatsApp/SMS, bonos/paquetes, fidelización, VeriFactu completo,
  multi-profesional, portal de cliente, Google Calendar, formularios de admisión (salud).
- **Fase 3:** marketplace interno, marca blanca, analítica predictiva de no-show,
  API pública, expansión LATAM.

## 5. Planes y precios

| Plan       | Precio                | Incluye                                               |
| ---------- | --------------------- | ----------------------------------------------------- |
| Prueba     | 0 € (14-30 d)         | Todo MVP, marca de agua                               |
| **Solo**   | 24 €/mes (19 € anual) | 1 profesional, reservas, depósitos, facturación       |
| **Equipo** | 59 €/mes              | Hasta 5 profesionales, WhatsApp, bonos                |
| **Centro** | 129 €/mes             | Multi-sede, marca blanca parcial, soporte prioritario |

Ingreso complementario: comisión 0,5-1 % sobre depósitos (Stripe Connect application fee).

## 6. Economía

- Margen bruto > 80 % en plan Solo · CAC objetivo < 60 € · LTV ~600 € (churn 4 %/mes).
- Ratio LTV/CAC > 10 · Punto de equilibrio personal ~40-60 cuentas Solo.

## 7. Arquitectura técnica

- Frontend Next.js (Vercel) · Supabase (Postgres+Auth+Storage, UE) · Stripe · Resend.
- Multi-tenant con Row Level Security. Coste de arranque 0-30 €/mes.
- Facturación append-only encadenada (hash) desde el día 1 → VeriFactu por config.
- Idempotencia de webhooks, lock de slot temporal, numeración correlativa transaccional.

## 8. Legal (checklist — no es asesoría; validar con profesional)

- RGPD/LOPDGDD: negocio = responsable, Klarvo = encargado → **DPA**. Consentimiento
  explícito no premarcado. Datos de salud = categoría especial. Hosting UE + SCC.
- T&C del SaaS + política de depósitos/cancelación visible antes de pagar.
- Pagos: PCI-DSS delegado en Stripe; KYC Stripe Connect.
- VeriFactu: 1-ene-2027 sociedades, 1-jul-2027 autónomos (fechas aplazadas, verificar).
  Integrar proveedor certificado AEAT. Ley Crea y Crece (e-factura B2B): posterior.
- Forma jurídica: autónomo → SL. IVA UE B2C digital → régimen OSS. WCAG 2.1 AA.

## 9. Validación (antes de escalar)

1. Landing `/verifactu` + lista de espera → 20-30 negocios reales.
2. 10-15 entrevistas a dueños de negocios.
3. Beta de pago con 5-10 negocios a precio reducido a cambio de feedback.

## 10. Testing

Unitario (Vitest): precios, depósitos, máquina de estados, disponibilidad, hash de facturas.
Integración: API reserva, webhooks Stripe (idempotencia), factura, RLS.
E2E (Playwright): reserva → pago → confirmación → recordatorio → factura.
Seguridad: aislamiento de tenants, OWASP Top 10. Carga (k6): concurrencia del mismo slot.

## 11. Riesgos y mitigación

| Riesgo                   | Mitigación                                           |
| ------------------------ | ---------------------------------------------------- |
| Competencia establecida  | Precio plano + gancho VeriFactu + propiedad de datos |
| Fechas VeriFactu cambian | Factura simplificada primero + proveedor certificado |
| Bajo margen en precio    | Comisión sobre depósitos + planes superiores         |
| Soporte consume tiempo   | Onboarding autoservicio + vídeos + docs              |

---

_Documento vivo. La información fiscal es orientativa y no constituye asesoría._
