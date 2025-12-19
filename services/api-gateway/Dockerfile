FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace package.json files
COPY packages/common/package*.json ./packages/common/
COPY services/api-gateway/package*.json ./services/api-gateway/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages/common ./packages/common
COPY services/api-gateway ./services/api-gateway

# Build shared packages
RUN npm run build --workspace=@mhc/common --if-present

WORKDIR /app/services/api-gateway

EXPOSE 3000

CMD ["npm", "run", "dev"]
