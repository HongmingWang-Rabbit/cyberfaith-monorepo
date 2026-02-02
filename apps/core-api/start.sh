#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit push --force 2>&1 || echo "Warning: migration failed, continuing..."

echo "Starting application..."
exec node --import tsx dist/main.js
