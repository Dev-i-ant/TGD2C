#!/bin/bash
# Скрипт для быстрой заливки обновлений на сервер

echo "🚀 Синхронизация файлов..."
rsync -avz -e "ssh -i ~/.ssh/reg_ru" \
    --exclude "node_modules" \
    --exclude ".next" \
    --exclude ".git" \
    --exclude ".env*" \
    ./ root@89.111.175.31:/root/mini_app_prod/

scp -i ~/.ssh/reg_ru .env.prod root@89.111.175.31:/root/mini_app_prod/.env

echo "🛠️ Пересборка и запуск на сервере..."
ssh -i ~/.ssh/reg_ru root@89.111.175.31 << EOF
cd /root/mini_app_prod
mkdir -p /etc/nginx/ssl
docker compose -f docker-compose.vps.yml build
docker compose -f docker-compose.vps.yml up -d
EOF

echo "🔒 Синхронизация SSL сертификатов..."
scp -i ~/.ssh/reg_ru ./ssl/back-loot.online.crt root@89.111.175.31:/etc/nginx/ssl/
scp -i ~/.ssh/reg_ru ./ssl/back-loot.online.key root@89.111.175.31:/etc/nginx/ssl/
scp -i ~/.ssh/reg_ru ./ssl/back-loot.ru.crt root@89.111.175.31:/etc/nginx/ssl/
scp -i ~/.ssh/reg_ru ./ssl/back-loot.ru.key root@89.111.175.31:/etc/nginx/ssl/

echo "📢 Обновление конфигурации Nginx..."
ssh -i ~/.ssh/reg_ru root@89.111.175.31 << EOF
cp /root/mini_app_prod/nginx.conf /etc/nginx/sites-available/default
nginx -t && systemctl reload nginx
EOF

echo "✅ Готово! Проект обновлен."
