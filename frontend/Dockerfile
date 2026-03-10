FROM node:20 as builder
WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

# Принудительно устанавливаем проблемный пакет rollup
RUN npm install @rollup/rollup-linux-x64-gnu --no-save || true

COPY . .

RUN npm run build

FROM scratch AS production
COPY --from=builder /app/build /build
