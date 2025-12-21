FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY packages ./packages
COPY services/moderation-service ./services/moderation-service

# Install dependencies
RUN npm install

# Build
RUN npm run build --workspace=@mhc/moderation-service

WORKDIR /app/services/moderation-service

EXPOSE 3006

CMD ["npm", "start"]
