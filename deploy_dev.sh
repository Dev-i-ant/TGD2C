#!/bin/bash

# Configuration
SERVER_IP="89.111.175.31"
REMOTE_DIR="/root/mini_app"
SSH_KEY="~/.ssh/reg_ru"

echo "🚀 Синхронизация файлов для DEV..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude 'dev.db' --exclude 'dev_stg.db' -e "ssh -i $SSH_KEY" ./ root@$SERVER_IP:$REMOTE_DIR/

echo "🛠️ Пересборка и запуск DEV на сервере..."
ssh -i $SSH_KEY root@$SERVER_IP << 'EOF'
    cd /root/mini_app
    # Ensure dev_stg.db exists if not present
    touch dev_stg.db
    docker compose -f docker-compose.dev.yml build
    docker compose -f docker-compose.dev.yml up -d
    # Update nginx config as well
    cp nginx.conf /etc/nginx/sites-available/default
    nginx -t && systemctl reload nginx
EOF

echo "✅ DEV окружение обновлено: https://back-loot.online"
