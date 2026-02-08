import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';

console.log('🚀 Starting bot process...');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.trycloudflare.com';

if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}

console.log(`✅ Token loaded: ${token.substring(0, 4)}...${token.substring(token.length - 4)}`);
console.log(`🌐 WebApp URL: ${webAppUrl}`);

console.log('📦 Initializing Telegraf...');
const bot = new Telegraf(token);

console.log('⚙️ Setting up bot commands...');

// Middleware for logging
bot.use(async (ctx, next) => {
    const start = Date.now();
    try {
        // Log the update
        const updateType = ctx.updateType;
        const userId = ctx.from?.id;
        const username = ctx.from?.username;
        console.log(`📩 [${new Date().toISOString()}] Update from ${userId} (@${username}): ${updateType}`, JSON.stringify(ctx.update, null, 2));

        await next();

        const ms = Date.now() - start;
        console.log(`✅ [${new Date().toISOString()}] Processed ${updateType} in ${ms}ms`);
    } catch (err) {
        console.error(`❌ [${new Date().toISOString()}] Error processing update:`, err);
        // You might want to reply to user if possible
    }
});

bot.start(async (ctx) => {
    const startPayload = ctx.payload; // Capture the code after /start
    const appUrlWithParam = startPayload ? `${webAppUrl}?startapp=${startPayload}` : webAppUrl;

    // Force update Menu Button for this specific chat to ensure correct text and URL
    try {
        await ctx.setChatMenuButton({
            type: 'web_app',
            text: 'Открыть кейсы',
            web_app: { url: webAppUrl }
        });
    } catch (e) {
        console.error('Failed to set menu button:', e);
    }

    ctx.reply(
        `Привет, ${ctx.from.first_name}! 🎮\n\nДобро пожаловать в back-loot.ru — верни свою удачу! 🍀\n\nЗаходи в приложение прямо сейчас и получи бесплатный прокрут кейса! 🎁`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('Открыть Mini App', appUrlWithParam)],
            [Markup.button.url('Подписаться на канал', 'https://t.me/+kZEYfYqhbSk3M2Ey')]
        ])
    );
});

console.log('🚀 Calling bot.launch()...');
bot.launch().then(() => {
    console.log('🤖 Бот запущен и готов к работе!');
}).catch((err) => {
    console.error('❌ Ошибка запуска бота:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
