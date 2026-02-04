import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { initData } = await req.json();

        // In a real app, you MUST validate the initData using your BOT_TOKEN
        // For now, we will parse the user and create/update them in DB
        const params = new URLSearchParams(initData);
        const userStr = params.get('user');

        if (!userStr) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const tgUser = JSON.parse(userStr);

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
