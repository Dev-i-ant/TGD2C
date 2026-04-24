import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openCaseAction } from '@/app/actions/user';
import { validateTelegramInitData } from '@/lib/telegramInitData';

export async function GET() {
    const cases = await prisma.case.findMany({
        include: { rewards: true }
    });
    return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
    try {
        const { caseId, count = 1, initData } = await req.json();
        const botToken = process.env.BOT_TOKEN;

        if (!botToken) {
            return NextResponse.json({ error: 'BOT_TOKEN is not configured' }, { status: 500 });
        }

        const validation = validateTelegramInitData(initData, botToken);
        if (!validation.valid || !validation.user) {
            return NextResponse.json({ error: validation.error || 'Invalid initData' }, { status: 401 });
        }

        if (!caseId || typeof caseId !== 'string') {
            return NextResponse.json({ error: 'Invalid caseId' }, { status: 400 });
        }

        const result = await openCaseAction(validation.user.id.toString(), caseId, count, initData);
        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to open case' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            winners: result.winners,
            newPoints: result.newPoints
        });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
