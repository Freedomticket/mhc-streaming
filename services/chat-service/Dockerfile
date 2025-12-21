FROM node:20-alpine

WORKDIR /app

COPY services/chat-service/package*.json ./
RUN npm install

COPY services/chat-service/ ./

CMD ["npm", "run", "dev"]
