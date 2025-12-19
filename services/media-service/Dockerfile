FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace package.json files
COPY packages/database/package*.json ./packages/database/
COPY packages/common/package*.json ./packages/common/
COPY services/media-service/package*.json ./services/media-service/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages ./packages
COPY services/media-service ./services/media-service

# Build shared packages
RUN npm run build --workspace=@mhc/database --if-present
RUN npm run build --workspace=@mhc/common --if-present

WORKDIR /app/services/media-service

EXPOSE 3002

CMD ["npm", "run", "dev"]
