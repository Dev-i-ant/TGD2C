'use server';

import { prisma } from '@/lib/prisma';

export async function getReferralData(telegramId: string) {
    if (!telegramId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { telegramId: telegramId.toString() },
            select: {
                id: true,
                referralCount: true,
                referralEarnings: true,
                referrals: {
                    select: {
                        id: true,
                        username: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        });

        if (!user) return null;

        return {
            referralCode: user.id, // Primary key is used as code
            referralCount: user.referralCount || 0,
            referralEarnings: user.referralEarnings || 0,
            referrals: (user.referrals || []).map(r => ({
                ...r,
                contribution: 0,
                joinedAt: r.createdAt
            }))
        };
    } catch (error) {
        console.error('Failed to fetch referral data:', error);
        return null;
    }
}
