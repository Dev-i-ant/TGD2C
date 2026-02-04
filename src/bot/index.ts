import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.trycloudflare.com';

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}

const bot = new Telegraf(token);

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
        `Привет, ${ctx.from.first_name}! 🎮\n\nДобро пожаловать в Dota 2 Case Opening. Готов выбить свой первый Dragonclaw Hook?`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('Открыть Mini App', appUrlWithParam)],
            [Markup.button.url('Подписаться на канал', 'https://t.me/your_channel')]
        ])
    );
});

bot.launch().then(() => {
    console.log('🤖 Бот запущен и готов к работе!');
}).catch((err) => {
    console.error('Ошибка запуска бота:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
