#!/bin/bash

# Configuration
SERVER_IP="89.111.175.31"
REMOTE_DIR="/root/mini_app_dev"
SSH_KEY="~/.ssh/reg_ru"

echo "🚀 Синхронизация файлов для DEV..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude 'dev.db' --exclude 'dev_stg.db' --exclude '.env*' -e "ssh -i $SSH_KEY" ./ root@$SERVER_IP:$REMOTE_DIR/
scp -i $SSH_KEY .env.dev root@$SERVER_IP:$REMOTE_DIR/.env

echo "🛠️ Пересборка и запуск DEV на сервере..."
ssh -i $SSH_KEY root@$SERVER_IP << 'EOF'
    cd /root/mini_app_dev
    # Ensure prisma directory exists and is writable
    mkdir -p prisma
    
    # Clear space before build
    docker system prune -f
    
    # Build and start containers
    docker compose -f docker-compose.dev.yml build --no-cache
    docker compose -f docker-compose.dev.yml up -d
    
    # Fix permissions for SQLite (container user 1001)
    echo "🔐 Fixing permissions for SQLite..."
    chown -R 1001:1001 .
    chmod -R 777 prisma 
    find prisma -type f -exec chmod 666 {} +

    # Run database sync and seed (inside web container)
    echo "📦 Syncing database and seeding test case..."
    # Prisma 7 might need prisma.config.ts to be present. It is copied in Dockerfile.
    docker exec -u 1001 -e DATABASE_URL=file:/app/prisma/dev.db TGD2OC_web_dev npx prisma db push --accept-data-loss
    docker exec -u 1001 -e DATABASE_URL=file:/app/prisma/dev.db TGD2OC_web_dev npx tsx prisma/seed_test_case.ts
    
    docker compose -f docker-compose.dev.yml restart web-dev

    # Update nginx config as well
    cp nginx.conf /etc/nginx/sites-available/default
    nginx -t && systemctl reload nginx

    # Cleanup old images
    docker image prune -f
EOF

echo "✅ DEV окружение обновлено: https://back-loot.online"
