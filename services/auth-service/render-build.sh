#!/bin/bash
set -e

echo "🔧 Installing root dependencies..."
cd ../..
npm install

echo "🔧 Building common package..."
cd packages/common
npm install
npm run build

echo "🔧 Building database package..."
cd ../database
npm install
npm run build
npx prisma generate

echo "🔧 Building auth service..."
cd ../../services/auth-service
npm install
npm run build

echo "✅ Build complete!"
