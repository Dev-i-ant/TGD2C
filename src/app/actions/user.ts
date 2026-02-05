'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { RARITIES, getRarityRank, calculateEffectivePrice } from '@/lib/constants';

export async function resetAllUserDataAction() {
    try {
        await prisma.$transaction([
            // 1. Delete all user-owned rewards
            prisma.reward.deleteMany({
                where: { userId: { not: null } }
            }),
            // 2. Delete all transactions
            prisma.transaction.deleteMany({}),
            // 3. Reset user stats
            prisma.user.updateMany({
                data: {
                    points: 1000,
                    bestItemName: null,
                    bestItemRarity: null,
                    bestItemImage: null,
                    bestItemWeight: 0,
                    bestItemPrice: 0,
                    referralCount: 0,
                    referralEarnings: 0
                }
            })
        ]);

        revalidatePath('/');
        revalidatePath('/profile');
        revalidatePath('/inventory');
        revalidatePath('/history');
        revalidatePath('/leaderboard');

        return { success: true };
    } catch (error) {
        console.error('Failed to reset data:', error);
        return { success: false, error: 'Database error' };
    }
}

export async function syncUser(data: { telegramId: string; username?: string; firstName?: string; lastName?: string; referralCode?: string | null }) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { telegramId: data.telegramId }
        });

        // Admin Detection
        const SUPER_ADMIN_ID = '1810988833';
        const isSuperAdmin = data.telegramId === SUPER_ADMIN_ID;

        console.log(`[SyncUser] ID: ${data.telegramId}, Username: ${data.username}, IsSuperAdmin: ${isSuperAdmin}`);

        if (existingUser) {
            // Retroactive referral check: if user exists but has NO referrer, and code is provided
            if (!existingUser.referredById && data.referralCode && data.referralCode !== existingUser.id) {
                const referrer = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { id: data.referralCode },
                            { referralCode: data.referralCode }
                        ]
                    }
                });

                if (referrer) {
                    console.log(`[syncUser] Found referrer ${referrer.id} for existing user ${existingUser.telegramId}`);
                    const updatedUser = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            referredById: referrer.id,
                            points: { increment: 500 },
                            isAdmin: isSuperAdmin || (existingUser as any).isAdmin
                        }
                    });

                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: referrer.id },
                            data: {
                                points: { increment: 500 },
                                referralCount: { increment: 1 },
                                referralEarnings: { increment: 500 },
                            }
                        }),
                        prisma.transaction.create({
                            data: {
                                userId: referrer.id,
                                fromUserId: updatedUser.id,
                                amount: 500,
                                type: 'REFERRAL_BONUS',
                                description: `Бонус за приглашение игрока ${updatedUser.username || updatedUser.telegramId}`
                            }
                        }),
                        prisma.transaction.create({
                            data: {
                                userId: updatedUser.id,
                                fromUserId: referrer.id,
                                amount: 500,
                                type: 'REFERRAL_BONUS',
                                description: `Бонус за вступление по приглашению`
                            }
                        })
                    ]);
                    return { success: true, user: updatedUser };
                }
            }

            // Safety: if existing user has 0 points but is active, ensure they have at least 1000 (starting balance)
            // unless they've actually spent them all (hard to distinguish, but 0 is usually a sign of uninitialized)
            const pointsToSet = existingUser.points === 0 ? 1000 : existingUser.points;

            // Standard info update + Admin check
            const updatedUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    ...(data.username && { username: data.username }),
                    points: pointsToSet,
                    isAdmin: isSuperAdmin || (existingUser as any).isAdmin
                }
            });
            return { success: true, user: updatedUser };
        }

        // New User logic
        let referredById = null;
        if (data.referralCode) {
            const referrer = await prisma.user.findFirst({
                where: {
                    OR: [
                        { id: data.referralCode },
                        { referralCode: data.referralCode }
                    ]
                }
            });
            if (referrer) referredById = referrer.id;
        }

        const newUser = await prisma.user.create({
            data: {
                telegramId: data.telegramId,
                username: data.username || data.firstName || '',
                points: referredById ? 1500 : 1000,
                referredById: referredById,
                isAdmin: isSuperAdmin
            },
        });

        console.log(`[syncUser] Created new user ${newUser.telegramId} with points ${newUser.points}. Referred by: ${referredById}`);

        if (referredById) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: referredById },
                    data: {
                        points: { increment: 500 },
                        referralCount: { increment: 1 },
                        referralEarnings: { increment: 500 },
                    }
                }),
                prisma.transaction.create({
                    data: {
                        userId: referredById,
                        fromUserId: newUser.id,
                        amount: 500,
                        type: 'REFERRAL_BONUS',
                        description: `${newUser.username || newUser.telegramId}: Бонус за вступление`
                    }
                }),
                prisma.transaction.create({
                    data: {
                        userId: newUser.id,
                        fromUserId: referredById,
                        amount: 500,
                        type: 'REFERRAL_BONUS',
                        description: `Бонус за вступление по приглашению`
                    }
                })
            ]);
        }

        return { success: true, user: newUser };
    } catch (error) {
        console.error('Failed to sync user:', error);
        return { success: false, error: 'Database error' };
    }
}

export async function getUserData(telegramId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: {
                inventory: {
                    include: { case: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) return null;

        // --- Safe Self-healing ---
        try {
            if ((!user.bestItemName || (user as any).bestItemPrice === 0) && user.inventory.length > 0) {
                // Find most expensive item in inventory
                let recordItem = user.inventory[0];
                let maxPrice = 0;

                for (const item of user.inventory) {
                    const price = calculateEffectivePrice(item.rarity, item.weight, item.sellPrice);
                    if (price > maxPrice) {
                        maxPrice = price;
                        recordItem = item;
                    }
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        bestItemName: recordItem.name,
                        bestItemRarity: recordItem.rarity,
                        bestItemImage: recordItem.image,
                        bestItemWeight: recordItem.weight,
                        bestItemPrice: maxPrice
                    }
                });
                user.bestItemName = recordItem.name;
                user.bestItemRarity = recordItem.rarity;
                user.bestItemImage = recordItem.image;
                user.bestItemWeight = recordItem.weight;
                (user as any).bestItemPrice = maxPrice;
            }
        } catch (healErr) {
            console.error('Self-healing failed but continuing:', healErr);
        }

        // Calculate stats using dedicated query for accuracy
        const allTransactions = await prisma.transaction.findMany({
            where: { userId: user.id }
        });

        const stats = {
            totalOpened: allTransactions.filter(t => t.type === 'CASE_OPEN').length,
            totalEarned: allTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + (t.amount || 0), 0),
            bestInInventory: user.inventory.length > 0 ? user.inventory[0] : null,
            inventoryCount: await prisma.reward.count({ where: { userId: user.id, status: 'IN_STOCK' as any } })
        };

        const historicalBest = user.bestItemName ? {
            name: user.bestItemName,
            rarity: user.bestItemRarity,
            image: user.bestItemImage,
            weight: user.bestItemWeight
        } : null;

        // Sort transactions by date descending for UI
        const transactions = allTransactions.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Sort items: Rare first (Arcana -> Common)
        const sortedInventory = [...user.inventory].sort((a, b) => {
            const rA = RARITIES.indexOf(a.rarity as any);
            const rB = RARITIES.indexOf(b.rarity as any);
            if (rA !== rB) return rB - rA;
            return a.weight - b.weight;
        });

        // Return clean, explicit object
        return {
            id: user.id,
            telegramId: user.telegramId,
            username: user.username,
            points: user.points,
            isAdmin: user.isAdmin,
            titles: user.titles,
            stats,
            historicalBest,
            inventory: sortedInventory,
            transactions
        };
    } catch (error) {
        console.error('Error in getUserData server action:', error);
        return null;
    }
}

export async function openCaseAction(telegramId: string, caseId: string) {
    try {
        // 1. Get or create user
        const user = await prisma.user.upsert({
            where: { telegramId },
            update: {},
            create: {
                telegramId,
                username: '',
                points: 1000, // Initial bonus
            },
        });

        const caseData = await prisma.case.findUnique({
            where: { id: caseId },
            include: {
                rewards: {
                    where: { userId: null }
                }
            }
        });

        if (!caseData) return { success: false, error: 'Кейс не найден' };
        if (user.points < caseData.price) return { success: false, error: 'Недостаточно BP' };
        if (caseData.rewards.length === 0) return { success: false, error: 'Кейс пуст' };

        // 2. Select winner (Weight-based)
        const totalWeight = caseData.rewards.reduce((acc: number, r: any) => acc + r.weight, 0);
        let randomNum = Math.random() * totalWeight;
        let winner = caseData.rewards[0];

        for (const reward of caseData.rewards) {
            if (randomNum < reward.weight) {
                winner = reward;
                break;
            }
            randomNum -= reward.weight;
        }

        // 3. Transactional Update
        const result = await prisma.$transaction(async (tx: any) => {
            // Deduct points
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { points: { decrement: caseData.price } },
            });

            // Commission Distribution
            if (user.referredById) {
                const commission = Math.floor(caseData.price * 0.1);
                if (commission > 0) {
                    await tx.user.update({
                        where: { id: user.referredById },
                        data: {
                            points: { increment: commission },
                            referralEarnings: { increment: commission }
                        }
                    });

                    await tx.transaction.create({
                        data: {
                            userId: user.referredById,
                            fromUserId: user.id,
                            amount: commission,
                            type: 'REFERRAL_COMMISSION',
                            description: `${user.username || user.telegramId}: ${caseData.name}`,
                        }
                    });
                }
            }

            // Add reward to user (creating a copy for inventory)
            const inventoryItem = await tx.reward.create({
                data: {
                    name: winner.name,
                    rarity: winner.rarity,
                    image: winner.image,
                    weight: winner.weight,
                    sellPrice: winner.sellPrice,
                    caseId: caseId,
                    userId: user.id, // Set the owner
                }
            });

            // Create transaction log
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: -caseData.price,
                    type: 'CASE_OPEN',
                    description: `Кейс: ${caseData.name}`,
                }
            });

            // Update historical record if this drop is better (Price-based)
            const winnerPrice = calculateEffectivePrice(winner.rarity, winner.weight, winner.sellPrice);
            const userBestPrice = (user as any).bestItemPrice || 0;

            if (winnerPrice > userBestPrice) {
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        bestItemName: winner.name,
                        bestItemRarity: winner.rarity,
                        bestItemImage: winner.image,
                        bestItemWeight: winner.weight,
                        bestItemPrice: winnerPrice
                    }
                });
            }

            return { updatedUser, inventoryItem };
        });

        revalidatePath('/inventory');
        revalidatePath('/profile');
        revalidatePath('/history');

        return {
            success: true,
            winner: result.inventoryItem,
            newPoints: result.updatedUser.points
        };
    } catch (error) {
        console.error('Open case error:', error);
        return { success: false, error: 'Ошибка сервера при открытии' };
    }
}
export async function sellItemAction(telegramId: string, itemId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { telegramId } });
        const item = await prisma.reward.findUnique({ where: { id: itemId } });

        if (!user || !item || item.userId !== user.id) {
            return { success: false, error: 'Item not found' };
        }

        // Logic: Rarer items (smaller weight) should cost MORE.
        const sellPrice = calculateEffectivePrice(item.rarity, item.weight, (item as any).sellPrice);

        await prisma.$transaction(async (tx: any) => {
            // Update item status instead of deleting
            await tx.reward.update({
                where: { id: itemId },
                data: { status: 'SOLD' }
            });

            // Update user points
            await tx.user.update({
                where: { id: user.id },
                data: { points: { increment: sellPrice } }
            });

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: sellPrice,
                    type: 'ITEM_SELL',
                    description: `Продажа: ${item.name}`,
                }
            });
        });

        revalidatePath('/inventory');
        revalidatePath('/profile');
        revalidatePath('/history');

        return { success: true, sellPrice };
    } catch (error) {
        console.error('Sell item error:', error);
        return { success: false, error: 'Ошибка при продаже' };
    }
}

export async function sellAllItemsAction(telegramId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: { inventory: { where: { status: 'IN_STOCK' } as any } }
        });

        if (!user || user.inventory.length === 0) {
            return { success: false, error: 'Инвентарь пуст' };
        }

        let totalPoints = 0;
        const itemIds = user.inventory.map(item => {
            const price = calculateEffectivePrice(item.rarity, item.weight, (item as any).sellPrice);
            totalPoints += price;
            return item.id;
        });

        await prisma.$transaction(async (tx: any) => {
            // Update all items to SOLD
            await tx.reward.updateMany({
                where: { id: { in: itemIds } },
                data: { status: 'SOLD' }
            });

            // Update user points
            await tx.user.update({
                where: { id: user.id },
                data: { points: { increment: totalPoints } }
            });

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: totalPoints,
                    type: 'ITEM_SELL',
                    description: `Массовая продажа (${itemIds.length} предметов)`,
                }
            });
        });

        revalidatePath('/inventory');
        revalidatePath('/profile');
        revalidatePath('/history');

        return { success: true, totalPoints, count: itemIds.length };
    } catch (error) {
        console.error('Sell all error:', error);
        return { success: false, error: 'Ошибка при массовой продаже' };
    }
}

export async function withdrawItemAction(telegramId: string, itemId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user) return { success: false, error: 'User not found' };

        const item = await prisma.reward.findUnique({ where: { id: itemId } });

        if (!item || item.userId !== user.id) {
            return { success: false, error: 'Item not found' };
        }

        await prisma.reward.update({
            where: { id: itemId },
            data: { status: 'WITHDRAWN' } as any
        });

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Withdraw item error:', error);
        return { success: false, error: 'Ошибка при выводе' };
    }
}

export async function getLeaderboard() {
    try {
        const topUsers = await prisma.user.findMany({
            orderBy: { points: 'desc' },
            take: 50,
            select: {
                id: true,
                telegramId: true,
                username: true,
                points: true,
                _count: {
                    select: { inventory: true }
                }
            }
        });
        return { success: true, leaderboard: topUsers };
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return { success: false, error: 'Database error' };
    }
}
