#!/bin/sh
# Prepara a pasta persistente (montada do servidor) e inicia a aplicação
# sem privilégios de root.
set -e

STORAGE_DIR="${STORAGE_DIR:-/app/storage}"
START='node_modules/.bin/prisma migrate deploy && exec node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-3000}"'

if [ "$(id -u)" = "0" ]; then
  # A pasta montada do servidor nasce como root; entrega ao usuário da aplicação.
  mkdir -p "$STORAGE_DIR"
  chown app:app "$STORAGE_DIR" 2>/dev/null || echo "aviso: não foi possível ajustar o dono de $STORAGE_DIR"
  exec setpriv --reuid=app --regid=app --init-groups sh -c "$START"
fi

exec sh -c "$START"
