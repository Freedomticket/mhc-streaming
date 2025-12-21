FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY packages ./packages
COPY services/royalty-service ./services/royalty-service

# Install dependencies
RUN npm install

# Build
RUN npm run build --workspace=@mhc/royalty-service

WORKDIR /app/services/royalty-service

EXPOSE 3007

CMD ["npm", "start"]
