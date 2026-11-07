FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY vendor ./vendor

RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]
