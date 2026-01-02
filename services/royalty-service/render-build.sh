#!/bin/bash
set -e

echo "🔧 Finding repo root..."
# Navigate to repo root (two levels up from royalty-service)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../" && pwd)"

echo "📦 Installing root dependencies..."
cd "$REPO_ROOT"
npm install

echo "📦 Installing common package..."
cd "$REPO_ROOT/packages/common"
npm install --include=dev

echo "🔨 Building common package..."
npm run build

echo "📦 Installing database package..."
cd "$REPO_ROOT/packages/database"
npm install --include=dev

echo "🔨 Building database package..."
npm run build

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "📦 Installing royalty service..."
cd "$REPO_ROOT/services/royalty-service"
npm install --include=dev

echo "🔨 Building royalty service..."
npm run build

echo "✅ Build complete!"
