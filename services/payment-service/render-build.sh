#!/bin/bash
set -e

echo "🔧 Finding repo root..."
# Navigate to repo root (two levels up from payment-service)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../" && pwd)"

echo "📦 Installing all workspace dependencies..."
cd "$REPO_ROOT"
npm install --include-workspace-root

echo "🔨 Building common package..."
npm run build --workspace=@mhc/common

echo "🔨 Building database package..."
npm run build --workspace=@mhc/database

echo "🔨 Generating Prisma Client..."
cd "$REPO_ROOT/packages/database"
npx prisma generate
cd "$REPO_ROOT"

echo "🔨 Building payment service..."
npm run build --workspace=@mhc/payment-service

echo "✅ Build complete!"
