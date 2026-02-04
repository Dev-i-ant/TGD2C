'use server';

import { prisma } from '@/lib/prisma';

export async function getAdminStats() {
    try {
        const [userCount, totalPointsResult, rewardCount, transactionCount] = await Promise.all([
            prisma.user.count(),
            prisma.user.aggregate({
                _sum: { points: true }
            }),
            prisma.reward.count(),
            prisma.transaction.count()
        ]);

        return {
            userCount,
            totalPoints: totalPointsResult._sum.points || 0,
            rewardCount,
            transactionCount
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return {
            userCount: 0,
            totalPoints: 0,
            rewardCount: 0,
            transactionCount: 0
        };
    }
}
