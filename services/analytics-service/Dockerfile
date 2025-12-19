FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace package.json files
COPY packages/database/package*.json ./packages/database/
COPY packages/common/package*.json ./packages/common/
COPY services/analytics-service/package*.json ./services/analytics-service/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages ./packages
COPY services/analytics-service ./services/analytics-service

# Build shared packages
RUN npm run build --workspace=@mhc/database --if-present
RUN npm run build --workspace=@mhc/common --if-present

WORKDIR /app/services/analytics-service

EXPOSE 3005

CMD ["npm", "run", "dev"]
