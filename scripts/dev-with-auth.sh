#!/usr/bin/env bash
# Start mock OAuth server + dev apps together.
# Usage: ./scripts/dev-with-auth.sh
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

export AUTH_MOCK=true
export GOOGLE_CLIENT_ID=mock-client-id
export GOOGLE_CLIENT_SECRET=mock-client-secret
export GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
export MOCK_OAUTH_URL=http://localhost:9090
export JWT_SECRET=dev-secret

echo "Starting mock OAuth server on :9090..."
npx tsx scripts/mock-oauth-server.ts &
MOCK_PID=$!

cleanup() {
  echo "Shutting down mock OAuth server (PID $MOCK_PID)..."
  kill "$MOCK_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Wait for mock server to be ready
sleep 2

echo "Starting dev apps..."
pnpm dev

wait
