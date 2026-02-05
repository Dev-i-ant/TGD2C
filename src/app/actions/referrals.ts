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

        // Efficiently calculate each friend's contribution from their activity
        const referralIds = (user.referrals || []).map(r => r.id);

        // 1. Get all CASE_OPEN transactions from these friends to calculate commission
        const friendsActivity = await prisma.transaction.findMany({
            where: {
                userId: { in: referralIds },
                type: 'CASE_OPEN'
            },
            select: {
                userId: true,
                amount: true
            }
        });

        // 2. Sum up commissions per friend (10% of absolute price)
        const commissionsMap: Record<string, number> = {};
        friendsActivity.forEach(t => {
            const amount = Math.abs(t.amount);
            const commission = Math.floor(amount * 0.1);
            commissionsMap[t.userId] = (commissionsMap[t.userId] || 0) + commission;
        });

        // 3. Calculate total earnings from history (including initial bonuses)
        // This stays as the source of truth for the top "Revenue" box
        const myReferralIncome = await prisma.transaction.findMany({
            where: {
                userId: user.id,
                type: { in: ['REFERRAL_BONUS', 'REFERRAL_COMMISSION'] }
            }
        });
        const totalEarningsFromHistory = myReferralIncome.reduce((acc, t) => acc + t.amount, 0);

        // Safety: if the database field is out of sync, fix it
        let effectiveEarnings = user.referralEarnings || 0;
        if (totalEarningsFromHistory > effectiveEarnings || (effectiveEarnings === 0 && user.referralCount > 0)) {
            effectiveEarnings = Math.max(totalEarningsFromHistory, user.referralCount * 500);
            prisma.user.update({
                where: { id: user.id },
                data: { referralEarnings: effectiveEarnings }
            }).catch(e => console.error('Failed to sync referral earnings:', e));
        }

        return {
            referralCode: user.id,
            referralCount: user.referralCount || 0,
            referralEarnings: effectiveEarnings,
            referrals: (user.referrals || []).map(r => {
                const commission = commissionsMap[r.id] || 0;
                // Contribution = 500 (Initial Bonus) + Calculated Commissions
                return {
                    ...r,
                    contribution: 500 + commission,
                    joinedAt: r.createdAt
                };
            })
        };
    } catch (error) {
        console.error('Failed to fetch referral data:', error);
        return null;
    }
}
