FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    DATABASE_PATH=/app/data/togi.sqlite \
    AUTH_DIR=/app/data/auth

WORKDIR /app

COPY package*.json ./
COPY vendor ./vendor

RUN npm install --omit=dev --no-audit --no-fund

COPY . .

RUN mkdir -p /app/data

CMD ["npm", "start"]
