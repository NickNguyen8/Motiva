#!/usr/bin/env bash
set -e

echo "🚀 Starting Motiva Dev Environment..."

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INFRA_COMPOSE="$ROOT_DIR/infra/docker/docker-compose.yml"

# ---------------------------
# UTIL FUNCTIONS
# ---------------------------

is_port_open() {
  lsof -i :"$1" >/dev/null 2>&1
}

run_bg() {
  local name=$1
  shift
  echo "▶️  $name"
  nohup "$@" > "/tmp/motiva-$name.log" 2>&1 &
}

# ---------------------------
# CHECK TOOLS
# ---------------------------

echo "🔍 Checking tools..."
command -v node >/dev/null || { echo "❌ node missing"; exit 1; }
command -v pnpm >/dev/null || { echo "❌ pnpm missing"; exit 1; }
command -v docker >/dev/null || { echo "❌ docker missing"; exit 1; }

# ---------------------------
# INFRA (POSTGRES + REDIS)
# ---------------------------

echo "🛢 Checking infrastructure..."

if ! docker ps | grep -q postgres; then
  echo "▶️  Starting infra containers..."
  docker compose -f "$INFRA_COMPOSE" up -d
else
  echo "✅ Infra already running"
fi

# ---------------------------
# BLOCKCHAIN (HARDHAT)
# ---------------------------

echo "⛓ Checking blockchain..."

if ! is_port_open 8545; then
  echo "▶️  Starting Hardhat node..."
  run_bg "hardhat" sh -c "cd packages/blockchain && pnpm exec hardhat node"
  
  # Wait for Hardhat to be ready
  echo "⏳ Waiting for blockchain..."
  sleep 5
  echo "📜 Deploying Contracts..."
  (cd "$ROOT_DIR/packages/blockchain" && pnpm exec hardhat run scripts/deploy.ts --network localhost) || echo "⚠️  Contract deploy failed (check logs)"
else
  echo "✅ Blockchain already running (Assuming contracts deployed)"
fi

# ---------------------------
# BACKEND API
# ---------------------------

echo "🧠 Checking API..."

if ! is_port_open 3001; then
  # API usually uses swc by default in recent Nx
  run_bg "api" pnpm nx serve api --maxParallel=1
else
  echo "✅ API already running"
fi

# ---------------------------
# WORKER
# ---------------------------

echo "⚙️ Checking worker..."

if ! pgrep -f "nx serve worker" >/dev/null; then
  run_bg "worker" pnpm nx serve worker --maxParallel=1
else
  echo "✅ Worker already running"
fi

# ---------------------------
# FRONTEND
# ---------------------------

echo "🖥 Checking web..."

if ! is_port_open 4200; then
  # Optimization: Use Turbopack
  run_bg "web" pnpm nx dev web --maxParallel=1 --turbo --port 4200
else
  echo "✅ Web already running"
fi

# ---------------------------
# FINAL STATUS
# ---------------------------

echo ""
echo "✅ Motiva dev environment is ready!"
echo ""
echo "🌐 Web:        http://localhost:4200"
echo "🧠 API:        http://localhost:3001"
echo "⛓ Blockchain: http://localhost:8545"
echo ""
echo "📄 Logs:"
echo "  tail -f /tmp/motiva-api.log"
echo "  tail -f /tmp/motiva-worker.log"
echo "  tail -f /tmp/motiva-web.log"
echo "  tail -f /tmp/motiva-hardhat.log"
