FROM node:18-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY services/royalty-service/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY services/royalty-service/src ./src

EXPOSE 3007

CMD ["npm", "run", "dev"]
