'use server';

import { prisma } from '@/lib/prisma';

export async function getAdminStats() {
    try {
        const [userCount, totalPointsResult, rewardCount, transactionCount, withdrawnCount, pendingCount, withdrawnValueResult] = await Promise.all([
            prisma.user.count(),
            prisma.user.aggregate({
                _sum: { points: true }
            }),
            prisma.reward.count(),
            prisma.transaction.count(),
            prisma.reward.count({ where: { status: 'WITHDRAWN' } }),
            prisma.reward.count({ where: { status: 'WITHDRAW_PENDING' } }),
            prisma.reward.aggregate({
                where: { status: { in: ['WITHDRAWN', 'WITHDRAW_PENDING'] } },
                _sum: { sellPrice: true }
            })
        ]);

        return {
            userCount,
            totalPoints: totalPointsResult._sum.points || 0,
            rewardCount,
            transactionCount,
            withdrawnCount,
            pendingCount,
            totalWithdrawnValue: withdrawnValueResult._sum.sellPrice || 0
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return {
            userCount: 0,
            totalPoints: 0,
            rewardCount: 0,
            transactionCount: 0,
            withdrawnCount: 0,
            pendingCount: 0,
            totalWithdrawnValue: 0
        };
    }
}

export async function getSpendingChartData(hours: number = 24) {
    try {
        const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

        // Fetch CASE_OPEN transactions in the given period
        const transactions = await prisma.transaction.findMany({
            where: {
                type: 'CASE_OPEN',
                createdAt: { gte: startTime }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by time interval (e.g., 10 groups)
        const groupsCount = 12;
        const intervalMs = (hours * 60 * 60 * 1000) / groupsCount;

        const chartData = Array.from({ length: groupsCount }).map((_, i) => {
            const groupStartTime = new Date(startTime.getTime() + i * intervalMs);
            const groupEndTime = new Date(startTime.getTime() + (i + 1) * intervalMs);

            const spentInGroup = transactions
                .filter(t => t.createdAt >= groupStartTime && t.createdAt < groupEndTime)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            return {
                time: groupEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                spent: spentInGroup
            };
        });

        return { success: true, data: chartData };
    } catch (error) {
        console.error('Failed to fetch chart data:', error);
        return { success: false, data: [] };
    }
}
