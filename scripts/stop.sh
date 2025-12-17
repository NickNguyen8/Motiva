#!/usr/bin/env bash
echo "🛑 Stopping Motiva services..."

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Kill Node processes by name
echo "Stopping Application Services..."
pkill -f "nx serve api" || echo "API not running"
pkill -f "nx serve worker" || echo "Worker not running"
pkill -f "nx dev web" || echo "Web not running"
pkill -f "hardhat node" || echo "Hardhat not running"

# Stop Docker Infra
echo "Stopping Infrastructure..."
docker compose -f "$ROOT_DIR/infra/docker/docker-compose.yml" down

echo "✅ All services stopped"
