#!/bin/bash
# Скрипт для быстрой заливки обновлений на сервер

echo "🚀 Синхронизация файлов..."
rsync -avz -e "ssh -i ~/.ssh/reg_ru" \
    --exclude "node_modules" \
    --exclude ".next" \
    --exclude ".git" \
    --exclude ".env" \
    ./ root@89.111.175.31:/root/mini_app/

echo "🛠️ Пересборка и запуск на сервере..."
ssh -i ~/.ssh/reg_ru root@89.111.175.31 << EOF
cd /root/mini_app
docker compose -f docker-compose.vps.yml build
docker compose -f docker-compose.vps.yml up -d
# Update nginx config
cp nginx.conf /etc/nginx/sites-available/default
nginx -t && systemctl reload nginx
EOF

echo "✅ Готово! Проект обновлен."
