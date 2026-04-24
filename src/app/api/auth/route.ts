import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramInitData } from '@/lib/telegramInitData';

export async function POST(req: NextRequest) {
    try {
        const { initData } = await req.json();
        const botToken = process.env.BOT_TOKEN;

        if (!botToken) {
            return NextResponse.json({ error: 'BOT_TOKEN is not configured' }, { status: 500 });
        }

        const validation = validateTelegramInitData(initData, botToken);
        if (!validation.valid || !validation.user) {
            return NextResponse.json({ error: validation.error || 'Invalid initData' }, { status: 401 });
        }

        const tgUser = validation.user;

        const user = await prisma.user.upsert({
            where: { telegramId: tgUser.id.toString() },
            update: { username: tgUser.username || tgUser.first_name },
            create: {
                telegramId: tgUser.id.toString(),
                username: tgUser.username || tgUser.first_name,
                points: 100, // Welcome bonus
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
