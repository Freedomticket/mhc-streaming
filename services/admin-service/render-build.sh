#!/bin/bash
set -e

echo "🔧 Finding repo root..."
# Navigate to repo root (two levels up from admin-service)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../" && pwd)"

echo "📦 Installing root dependencies..."
cd "$REPO_ROOT"
npm install
# Install @types at root to ensure they're available
npm install @types/jsonwebtoken @types/express @types/node @types/cors

echo "📦 Installing common package..."
cd "$REPO_ROOT/packages/common"
npm install --include=dev
# Explicit install of @types in common package node_modules
cd "$REPO_ROOT/packages/common" && npm install @types/jsonwebtoken @types/express @types/node @types/cors

echo "🔨 Building common package..."
npm run build

echo "📦 Installing database package..."
cd "$REPO_ROOT/packages/database"
npm install --include=dev

echo "🔨 Building database package..."
npm run build

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "📦 Installing admin service..."
cd "$REPO_ROOT/services/admin-service"
npm install --include=dev

echo "🔨 Building admin service..."
npm run build

echo "✅ Build complete!"
