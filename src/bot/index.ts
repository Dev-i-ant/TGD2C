import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-tunnel-url.ngrok-free.app';

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}

const bot = new Telegraf(token);

bot.start(async (ctx) => {
    // Set the Menu Button (the one next to the paperclip/keyboard)
    try {
        await ctx.setChatMenuButton({
            type: 'web_app',
            text: 'Играть в Dota 2',
            web_app: { url: webAppUrl }
        });
    } catch (e) {
        console.error('Failed to set menu button:', e);
    }

    ctx.reply(
        `Привет, ${ctx.from.first_name}! 🎮\n\nДобро пожаловать в Dota 2 Case Opening. Готов выбить свой первый Dragonclaw Hook?`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('Открыть Mini App', webAppUrl)],
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
