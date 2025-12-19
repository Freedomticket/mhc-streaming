FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace package.json files
COPY packages/database/package*.json ./packages/database/
COPY packages/common/package*.json ./packages/common/
COPY services/payment-service/package*.json ./services/payment-service/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages ./packages
COPY services/payment-service ./services/payment-service

# Build shared packages
RUN npm run build --workspace=@mhc/database --if-present
RUN npm run build --workspace=@mhc/common --if-present

WORKDIR /app/services/payment-service

EXPOSE 3004

CMD ["npm", "run", "dev"]
