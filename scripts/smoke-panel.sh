#!/usr/bin/env bash
# Smoke test del panel autenticado y endpoints internos.
set -u
BASE="http://localhost:3000"
for r in "/app/servicios" "/app/clientes" "/app/facturacion" "/app/metricas" "/api/cron/expirar-reservas"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$r")
  printf "%-32s %s\n" "$r" "$code"
done
