#!/usr/bin/env bash
SERVICE=$1

if [ -z "$SERVICE" ]; then
  echo "Usage: ./scripts/reload.sh [api|web|worker]"
  exit 1
fi

echo "🔄 Reloading $SERVICE..."

# Determine command
CMD="serve"
ARGS=""
if [ "$SERVICE" == "web" ]; then
  CMD="dev"
  ARGS="--port 4200"
fi

# Kill existing
pkill -f "nx $CMD $SERVICE" || true

# Start again in background
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
nohup pnpm nx $CMD $SERVICE $ARGS > "/tmp/motiva-$SERVICE.log" 2>&1 &

echo "✅ $SERVICE restarted. Logs: tail -f /tmp/motiva-$SERVICE.log"
