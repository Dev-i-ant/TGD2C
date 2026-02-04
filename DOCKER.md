# Docker Deployment Guide

## Быстрый старт

### 1. Запуск всего стека (Next.js + Bot + Tunnel)
```bash
docker-compose up -d
```

### 2. Только бот
```bash
docker-compose up -d bot
```

### 3. Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только бот
docker-compose logs -f bot

# Только туннель (для получения URL)
docker-compose logs tunnel
```

### 4. Остановка
```bash
docker-compose down
```

## Структура

- **web** - Next.js приложение (порт 3000)
- **bot** - Telegram бот
- **tunnel** - Cloudflare туннель (опционально)

## Переменные окружения

Убедитесь, что `.env` файл содержит:
```env
DATABASE_URL="file:///app/dev.db"
TELEGRAM_BOT_TOKEN="your_token"
NEXT_PUBLIC_APP_URL="https://your-tunnel-url.trycloudflare.com"
NEXT_PUBLIC_BOT_USERNAME="YourBot"
```

## Production

Для production рекомендуется:
1. Использовать именованный Cloudflare туннель
2. Настроить PostgreSQL вместо SQLite
3. Добавить health checks
4. Настроить логирование

## Обновление

```bash
# Пересобрать образы
docker-compose build

# Перезапустить с новыми образами
docker-compose up -d --force-recreate
```
