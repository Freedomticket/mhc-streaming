#!/bin/bash
set -e

echo "🔧 Building from monorepo root..."
cd ../..

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing common package..."
cd packages/common
npm install

echo "🔨 Building common package..."
npm run build

echo "📦 Installing database package..."
cd ../database
npm install

echo "🔨 Building database package..."
npm run build

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "📦 Installing auth service..."
cd ../../services/auth-service
npm install

echo "🔨 Building auth service..."
npm run build

echo "✅ Build complete!"
