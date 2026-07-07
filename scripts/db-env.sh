#!/usr/bin/env bash
# ============================================================================
# Genera .env.local a partir del estado de la instancia local de Supabase.
# Requiere que Supabase esté arrancado (npm run db:start).
# ============================================================================
set -euo pipefail

# Sitúate en la raíz del proyecto (un nivel por encima de scripts/).
cd "$(dirname "$0")/.."

# Usa el binario local de supabase (devDependency) o npx como respaldo.
if [ -x "node_modules/.bin/supabase" ]; then
  SUPABASE="node_modules/.bin/supabase"
else
  SUPABASE="npx --yes supabase"
fi

# Carga las variables que expone Supabase (API_URL, ANON_KEY, SERVICE_ROLE_KEY...).
eval "$($SUPABASE status -o env)"

if [ -z "${API_URL:-}" ] || [ -z "${ANON_KEY:-}" ]; then
  echo "No se pudo leer el estado de Supabase. ¿Ejecutaste 'npm run db:start'?" >&2
  exit 1
fi

cat > .env.local <<EOF
# Generado por scripts/db-env.sh — entorno de desarrollo LOCAL.
# NO subir a git. Regenerar con: npm run db:env

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Klarvo

# Supabase local (Postgres + Auth + Storage vía Docker)
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# Stripe / Resend / Cron quedan vacíos: la app degrada con elegancia sin ellos.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
CRON_SECRET=dev-cron-secret
EOF

echo "✓ .env.local generado."
echo "  Supabase API:    ${API_URL}"
echo "  Studio:          ${STUDIO_URL:-http://127.0.0.1:54323}"
echo "  Bandeja emails:  ${INBUCKET_URL:-http://127.0.0.1:54324}"
echo ""
echo "Usuario demo:  demo@klarvo.local / demo1234"
