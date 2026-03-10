FROM node:20 as build
WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --omit=optional

COPY . .

# Принудительно устанавливаем проблемный пакет rollup
RUN npm install @rollup/rollup-linux-x64-gnu --no-save || true

RUN npm run build
