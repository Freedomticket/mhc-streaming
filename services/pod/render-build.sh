#!/bin/bash
set -e

echo "🔧 Finding repo root..."
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../" && pwd)"

echo "📦 Installing root dependencies..."
cd "$REPO_ROOT"
npm install
npm install @types/jsonwebtoken @types/express @types/node @types/cors @types/bcryptjs

echo "📦 Installing common package..."
cd "$REPO_ROOT/packages/common"
npm install --include=dev
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

echo "📦 Installing POD service..."
cd "$REPO_ROOT/services/pod"
npm install --include=dev

echo "🔨 Building POD service..."
npm run build

echo "✅ Build complete!"
