import Stripe from 'stripe';

/**
 * Cliente de Stripe (servidor). Gestiona:
 *  - Depósitos y tarjetas de garantía (Payment Intents / SetupIntent)
 *  - Reparto a la cuenta del negocio (Connect) con application fee
 *  - Suscripciones de los planes (Billing)
 *
 * Se instancia de forma perezosa para no romper el build cuando falta la clave.
 */
let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY no está configurada');
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
      appInfo: { name: 'Klarvo', version: '0.1.0' },
    });
  }
  return stripeSingleton;
}

/** Porcentaje de comisión sobre depósitos (Stripe Connect application fee). */
export function applicationFeePercent(): number {
  return Number(process.env.STRIPE_APPLICATION_FEE_PERCENT ?? '1');
}
