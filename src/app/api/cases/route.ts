import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const cases = await prisma.case.findMany({
        include: { rewards: true }
    });
    return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
    try {
        const { userId, caseId } = await req.json();

        const dotaCase = await prisma.case.findUnique({
            where: { id: caseId },
            include: { rewards: true }
        });

        if (!dotaCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.points < dotaCase.price) {
            return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
        }

        // RNG Logic
        const rewards = dotaCase.rewards;
        const totalWeight = rewards.reduce((sum: number, r: any) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;

        let selectedReward = rewards[0];
        for (const reward of rewards) {
            if (random < reward.weight) {
                selectedReward = reward;
                break;
            }
            random -= reward.weight;
        }

        // Transaction: Deduct points, assign reward, and log transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { points: { decrement: dotaCase.price } }
            }),
            prisma.reward.update({
                where: { id: selectedReward.id },
                data: { userId: user.id }
            }),
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: -dotaCase.price,
                    type: 'CASE_OPEN',
                    description: `Открытие кейса: ${dotaCase.name}`
                }
            })
        ]);

        return NextResponse.json({ reward: selectedReward });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
