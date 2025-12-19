FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace package.json files
COPY packages/database/package*.json ./packages/database/
COPY packages/common/package*.json ./packages/common/
COPY services/stream-service/package*.json ./services/stream-service/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages ./packages
COPY services/stream-service ./services/stream-service

# Build shared packages
RUN npm run build --workspace=@mhc/database --if-present
RUN npm run build --workspace=@mhc/common --if-present

WORKDIR /app/services/stream-service

EXPOSE 3003 1935

CMD ["npm", "run", "dev"]
