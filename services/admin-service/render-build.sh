#!/usr/bin/env bash
set -e

echo "Installing @types packages at root..."
cd /opt/render/project/src
npm install --save-dev @types/express @types/cors @types/node @types/jsonwebtoken

echo "Building admin-service..."
cd services/admin-service
npm run build

echo "Build completed successfully"
