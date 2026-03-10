FROM node:20 as build
WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --omit=optional

COPY . .

RUN npm run build

# При старте контейнера собираем продакшен-сборку во /app/dist,
# который смонтирован как volume и используется nginx
#CMD ["sh", "-c", "npm run build && tail -f /dev/null"]

# Принудительно устанавливаем проблемный пакет rollup
#RUN npm install @rollup/rollup-linux-x64-gnu --no-save || true