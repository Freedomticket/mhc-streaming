FROM node:18-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY services/moderation-service/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY services/moderation-service/src ./src

EXPOSE 3006

CMD ["npm", "run", "dev"]
