## Film! — деплой через Docker и Docker Compose

В репозитории два приложения:

- `frontend` — React/Vite-приложение
- `backend` — Nest.js API (MongoDB через mongoose)

Для продакшен-запуска используется связка Docker + Docker Compose:

- отдельные контейнеры для фронтенда, бэкенда, MongoDB и mongo-express
- `nginx` раздаёт собранный фронтенд и проксирует запросы на бэкенд

### Требования

- Docker
- Docker Compose v2

### Структура Docker-файлов

- `frontend/Dockerfile` — сборка продакшен-версии фронтенда (`npm run build`), результат складывается в volume `frontend_dist`
- `backend/Dockerfile` — сборка NestJS в `dist` и запуск продакшен-кода (`node dist/main.js`)
- `nginx/Dockerfile` и `nginx/nginx.conf` — nginx-сервер, раздаёт статику и проксирует `/api/afisha` и `/content/afisha` в бэкенд
- `docker-compose.yml` — оркестрация контейнеров

В `docker-compose.yml` указаны имена образов в реестре `ghcr.io`:

- `ghcr.io/your-org/film-frontend:latest`
- `ghcr.io/your-org/film-backend:latest`
- `ghcr.io/your-org/film-nginx:latest`

При желании вы можете переименовать их под свой GitHub-аккаунт и использовать `docker compose build` + `docker push` для деплоя в GitHub Container Registry.

### Переменные окружения

Бэкенд читает настройки БД из `.env` (или переменных окружения контейнера):

- `DB_DRIVER` — драйвер базы, по умолчанию `mongodb`
- `DB_URL` — строка подключения к MongoDB (в docker-compose задаётся как `mongodb://mongo:27017/film-afisha`)

Во фронтенде по умолчанию используются:

- `VITE_API_URL=/api/afisha`
- `VITE_CDN_URL=/content/afisha`

Благодаря nginx все запросы к `/api/afisha` и `/content/afisha` проксируются в бэкенд.

### Запуск через Docker Compose

Из корня репозитория:

```bash
docker compose up -d --build
```

Compose поднимет следующие сервисы:

- `frontend` — сборка фронтенда в volume `frontend_dist`
- `backend` — NestJS API, подключён к MongoDB
- `mongo` — MongoDB с базой `film-afisha`
- `mongo-express` — web-интерфейс для MongoDB (порт `8080`)
- `nginx` — веб-сервер (порт `80`), раздаёт SPA и проксирует API

После запуска будут доступны:

- само приложение: `http://localhost`
- админка базы (mongo-express): `http://localhost:8080`

Остановить и удалить контейнеры:

```bash
docker compose down
```

Том `mongo_data` в `docker-compose.yml` сохраняет данные между перезапусками.

