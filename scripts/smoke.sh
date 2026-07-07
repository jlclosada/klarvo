#!/usr/bin/env bash
# Smoke test rápido de rutas clave del dev server.
set -u
BASE="http://localhost:3000"
for r in "/" "/reservar/estudio-martina" "/cita/demo" "/api/health" "/app" "/precios" "/verifactu"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$r")
  printf "%-32s %s\n" "$r" "$code"
done
