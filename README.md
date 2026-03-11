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

- `ghcr.io/asprokofyev/film-react-nest-frontend:latest`
- `ghcr.io/asprokofyev/film-react-nest-backend:latest`
- `ghcr.io/asprokofyev/film-react-nest-nginx:latest`

При желании вы можете переименовать их под свой GitHub-аккаунт и использовать `docker compose build` + `docker push` для деплоя в GitHub Container Registry.

### Переменные окружения

Бэкенд читает настройки БД из `.env` (или переменных окружения контейнера):

- `DATABASE_DRIVER` — драйвер базы, по умолчанию `postgres`
- `DATABASE_HOST` — хост, по умолчанию `localhost`
- `DATABASE_PORT` — порт, по умолчанию `5432`

### Запуск через Docker Compose

Из корня репозитория:

```bash
docker compose up -d --build
```

Compose поднимет следующие сервисы:

- `frontend` — сборка фронтенда в volume `frontend_build:/build`
- `backend` — NestJS API, подключён к PostgresDB
- `postgres` — PostgresDB с базой `practicum`
- `pgadmin` — web-интерфейс для PostgresDB (порт `8080`)
- `db-init` — загрузка в БД тестовых данных из sql-файлов
- `nginx` — веб-сервер (порт `80`), раздаёт SPA и проксирует API

После запуска будут доступны:

- само приложение: `http://localhost`
- админка базы (mongo-express): `http://localhost:8080`

Остановить и удалить контейнеры:

```bash
docker compose down
```

# Приложение размещено по адресу: 

http://asprokofyev.student.nomorepartiessite.ru/
