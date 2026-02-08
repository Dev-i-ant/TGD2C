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
    
    # Update .env with API Key
    echo "MARKET_API_KEY=\"m7guIEV2RUy4s6SmxueDBSzs07Z2eHc\"" >> .env.tmp
    # Use awk to deduplicate keys, keeping the last one
    awk -F= '!a[$1]++' .env.tmp .env > .env.new && mv .env.new .env && rm .env.tmp
    docker compose -f docker-compose.dev.yml restart web-dev

    # Update nginx config as well
    cp nginx.conf /etc/nginx/sites-available/default
    nginx -t && systemctl reload nginx

    # Cleanup old images
    docker image prune -f
EOF

echo "✅ DEV окружение обновлено: https://back-loot.online"
