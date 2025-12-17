#!/usr/bin/env bash
set -e
echo "🎭 Starting Staging Mode (Prod-like)..."

echo "🏗 Building all projects..."
pnpm nx run-many -t build --projects=api,web,worker

echo "🚀 Starting Services from Build Artifacts..."

# API
echo "▶️  API"
# Note: Adjust path if dist structure differs
nohup node dist/apps/api/main.js > /tmp/motiva-staging-api.log 2>&1 &

# Worker
echo "▶️  Worker"
nohup node dist/apps/worker/main.js > /tmp/motiva-staging-worker.log 2>&1 &

# Web
echo "▶️  Web"
# Next.js start needs to be run from the app dir or with dir arg
# Copying env or ensuring it exists is crucial for staging
cd dist/apps/web
nohup pnpm next start -p 4200 > /tmp/motiva-staging-web.log 2>&1 &

echo "✅ Staging Environment Running."
