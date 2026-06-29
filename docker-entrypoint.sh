#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_PROVIDER" != "none" ]; then
  echo "[entrypoint] Running database migrations..."
  node migrate.js
fi

echo "[entrypoint] Starting server..."
exec node server-standalone.js
