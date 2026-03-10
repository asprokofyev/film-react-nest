FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/dist ./dist

COPY ./test /app/test

RUN mkdir -p /app/public/content

EXPOSE 3000

CMD ["node", "dist/main.js"]
