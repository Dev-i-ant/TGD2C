'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Logger } from '@/lib/logger';
import { RARITIES, getRarityRank, calculateEffectivePrice, pickWeightedReward, SUPER_ADMINS } from '@/lib/constants';
import { validateTelegramInitData } from '@/lib/telegramInitData';

const revalidatePaths = (paths: string[]) => {
    for (const path of paths) {
        revalidatePath(path);
    }
};

const sanitizeNullableString = (value: unknown): string => {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') {
        return '';
    }
    return String(value);
};

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

        revalidatePaths(['/', '/profile', '/inventory', '/history', '/leaderboard']);

        return { success: true };
    } catch (error) {
        console.error('Failed to reset data:', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Тестирование доступа к Маркету (для админа)
 */
export async function testMarketAccessAction(telegramId: string) {
    try {
        Logger.info(`[testMarketAccessAction] Attempting market access test for user: ${telegramId}`);
        const user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user || !user.isAdmin) {
            Logger.warn(`[testMarketAccessAction] Access denied for user ${telegramId}: Not found or not admin.`);
            return { success: false, error: 'Access denied' };
        }

        const { MarketApi } = await import('@/lib/marketApi');
        const result = await MarketApi.testAccess();
        if (result.success) {
            Logger.info(`[testMarketAccessAction] Market access test successful for admin ${telegramId}.`);
        } else {
            Logger.error(`[testMarketAccessAction] Market access test failed for admin ${telegramId}: ${result.error}`);
        }
        return result;
    } catch (error) {
        Logger.error(`[testMarketAccessAction] Server error during market access test for ${telegramId}:`, error);
        return { success: false, error: 'Server error' };
    }
}

/**
 * Получить цену предмета на Market в рублях
 */
export async function getItemPriceAction(itemName: string): Promise<{ success: boolean; priceRub?: number; error?: string }> {
    try {
        const { MarketApi } = await import('@/lib/marketApi');
        const priceKopeks = await MarketApi.getMinPrice(itemName);

        if (priceKopeks !== null) {
            // Convert kopeks to rubles (divide by 100)
            const priceRub = priceKopeks / 100;
            return { success: true, priceRub };
        }
        return { success: false, error: 'Цена не найдена' };
    } catch (error) {
        Logger.error('[getItemPriceAction] Error:', error);
        return { success: false, error: 'Ошибка получения цены' };
    }
}

export async function syncUser(data: { telegramId: string; username?: string; firstName?: string; lastName?: string; photoUrl?: string; referralCode?: string | null }) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { telegramId: data.telegramId }
        });

        // Admin Detection
        const isSuperAdmin = SUPER_ADMINS.includes(data.telegramId);

        // Sanitize incoming data to prevent "null"/"undefined" strings
        const cleanData = {
            telegramId: data.telegramId,
            username: sanitizeNullableString(data.username),
            firstName: sanitizeNullableString(data.firstName),
            lastName: sanitizeNullableString(data.lastName),
            photoUrl: sanitizeNullableString(data.photoUrl)
        };

        // Detailed debug logging
        Logger.info(`[SyncUser] Data received (sanitized):`, {
            telegramId: cleanData.telegramId,
            username: cleanData.username,
            firstName: cleanData.firstName,
            lastName: cleanData.lastName,
            hasPhoto: !!cleanData.photoUrl
        });

        if (existingUser) {
            // ... (referral logic remains same)

            // Standard info update + Admin check
            const updatedUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    username: (cleanData.username || existingUser.username) as any,
                    firstName: (cleanData.firstName || (existingUser as any).firstName) as any,
                    lastName: (cleanData.lastName || (existingUser as any).lastName) as any,
                    photoUrl: (cleanData.photoUrl || (existingUser as any).photoUrl) as any,
                    // Admin flag logic: 
                    // 1. Super admin is ALWAYS admin.
                    // 2. Otherwise, keep current DB value.
                    isAdmin: isSuperAdmin ? true : existingUser.isAdmin,
                    // Whitelist: Super admin is whitelisted. 
                    // Others keep status, or get it if they are admins.
                    isWhitelisted: isSuperAdmin ? true : ((existingUser as any).isWhitelisted || existingUser.isAdmin)
                } as any
            });
            return { success: true, user: updatedUser };
        }

        // New User logic
        let referredById: string | null = null;
        if (data.referralCode) {
            const normalizedCode = data.referralCode.trim();
            if (normalizedCode) {
                const referrer = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { id: normalizedCode },
                            { referralCode: normalizedCode }
                        ]
                    },
                    select: { id: true, telegramId: true }
                });

                if (referrer && referrer.telegramId !== cleanData.telegramId) {
                    referredById = referrer.id;
                }
            }
        }

        const newUser = await prisma.user.create({
            data: {
                telegramId: cleanData.telegramId,
                username: cleanData.username,
                firstName: cleanData.firstName,
                lastName: cleanData.lastName,
                photoUrl: cleanData.photoUrl,
                points: referredById ? 1500 : 1000,
                isAdmin: isSuperAdmin,
                isWhitelisted: isSuperAdmin,
                referredById
            } as any
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

        revalidatePaths(['/profile', '/inventory']);
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
                    where: { status: 'IN_STOCK' as any },
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
        const allTransactions: any[] = await prisma.transaction.findMany({
            where: { userId: user.id }
        });

        // Run cleanup/sync for withdrawals before returning data
        await syncWithdrawalStatusAction(user.telegramId);

        // Fetch user again to get updated inventory after cleanup
        const userWithCleanup = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                // Fetch ALL items to support history/sold view
                // OLD: where: { status: 'IN_STOCK' as any },
                inventory: {
                    include: { case: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!userWithCleanup) return null;

        const stats = {
            totalOpened: allTransactions.filter((t: any) => t.type === 'CASE_OPEN').length,
            totalEarned: allTransactions.filter((t: any) => t.amount > 0).reduce((acc: any, t: any) => acc + (t.amount || 0), 0),
            bestInInventory: userWithCleanup.inventory.length > 0 ? userWithCleanup.inventory.find((i: any) => i.status === 'IN_STOCK') || userWithCleanup.inventory[0] : null,
            inventoryCount: userWithCleanup.inventory.filter((i: any) => i.status === 'IN_STOCK').length,
        };

        const historicalBest = userWithCleanup.bestItemName ? {
            name: userWithCleanup.bestItemName,
            rarity: userWithCleanup.bestItemRarity,
            image: userWithCleanup.bestItemImage,
            weight: userWithCleanup.bestItemWeight
        } : null;

        // Sort transactions by date descending for UI
        const transactions = allTransactions.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Sort items: Rare first (Arcana -> Common)
        const sortedInventory = [...userWithCleanup.inventory].sort((a: any, b: any) => {
            const rA = RARITIES.indexOf(a.rarity as any);
            const rB = RARITIES.indexOf(b.rarity as any);
            if (rA !== rB) return rB - rA;
            return a.weight - b.weight;
        });

        // Return clean, explicit object
        return {
            id: userWithCleanup.id,
            telegramId: userWithCleanup.telegramId,
            username: userWithCleanup.username,
            points: userWithCleanup.points,
            isAdmin: userWithCleanup.isAdmin || SUPER_ADMINS.includes(userWithCleanup.telegramId),
            titles: userWithCleanup.titles,
            tradeUrl: userWithCleanup.tradeUrl,
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

export async function openCaseAction(telegramId: string, caseId: string, count: number = 1, initData?: string) {
    try {
        if (count < 1 || count > 5) return { success: false, error: 'Некорректное количество' };
        const botToken = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.BOT_TOKEN;

        if (botToken && initData) {
            const validation = validateTelegramInitData(initData, botToken);
            if (!validation.valid || !validation.user) {
                return { success: false, error: 'Ошибка авторизации Telegram' };
            }
            if (validation.user.id.toString() !== telegramId) {
                return { success: false, error: 'Неверный пользователь' };
            }
        }

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
        const totalPrice = caseData.price * count;
        if (user.points < totalPrice) return { success: false, error: 'Недостаточно BP' };
        if (caseData.rewards.length === 0) return { success: false, error: 'Кейс пуст' };

        // 2. Select winners (Weight-based)
        type CaseReward = (typeof caseData.rewards)[number];
        const winners: CaseReward[] = [];

        for (let c = 0; c < count; c++) {
            winners.push(pickWeightedReward(caseData.rewards));
        }

        // 3. Transactional Update
        // 2. Fetch prices in parallel OUTSIDE the transaction
        const priceMap = new Map<string, number>();

        try {
            const { MarketApi } = await import('@/lib/marketApi');
            const uniqueItemNames = Array.from(new Set(winners.map(w => w.name)));

            await Promise.all(uniqueItemNames.map(async (name) => {
                try {
                    const price = await MarketApi.getMinPrice(name);
                    if (price) {
                        priceMap.set(name, Math.ceil(price / 100));
                    }
                } catch (e) {
                    Logger.error('OpenCase: Failed to fetch price for ' + name, e);
                }
            }));
        } catch (e) {
            Logger.error('OpenCase: Failed to load MarketApi', e);
        }

        // 3. Execute Database Transaction
        const transactionResult = await prisma.$transaction(async (tx: any) => {
            // Deduct balance
            await tx.user.update({
                where: { id: user.id },
                data: { points: { decrement: totalPrice } }
            });

            // Commission Logic
            if (user.referredById) {
                const commission = Math.floor(totalPrice * 0.1);
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
                            description: `${user.username || user.telegramId}: ${caseData.name} (x${count})`,
                        }
                    });
                }
            }

            // Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: -totalPrice,
                    type: 'CASE_OPEN',
                    description: `Кейс: ${caseData.name}${count > 1 ? ` (x${count})` : ''}`,
                }
            });

            // Add Items
            const inventoryItems: any[] = [];
            let bestWinnerInBatch = winners[0];
            let maxPriceInBatch = 0;

            for (const winner of winners) {
                let realPriceRub = priceMap.get(winner.name) || winner.sellPrice;

                const inventoryItem = await tx.reward.create({
                    data: {
                        name: winner.name,
                        rarity: winner.rarity,
                        image: winner.image,
                        weight: winner.weight,
                        sellPrice: realPriceRub,
                        caseId: caseId,
                        userId: user.id
                    }
                });
                inventoryItems.push(inventoryItem);

                const itemPrice = calculateEffectivePrice(winner.rarity, winner.weight, realPriceRub);
                if (itemPrice > maxPriceInBatch) {
                    maxPriceInBatch = itemPrice;
                    bestWinnerInBatch = winner;
                }
            }

            // Update stats
            const userBestPrice = (user as any).bestItemPrice || 0;
            if (maxPriceInBatch > userBestPrice) {
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        bestItemName: bestWinnerInBatch.name,
                        bestItemRarity: bestWinnerInBatch.rarity,
                        bestItemImage: bestWinnerInBatch.image,
                        bestItemWeight: bestWinnerInBatch.weight,
                        bestItemPrice: maxPriceInBatch
                    }
                });
            }

            return { inventoryItems };
        }, {
            maxWait: 10000,
            timeout: 20000
        });

        // Re-fetch user to get updated points
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

        revalidatePaths(['/inventory', '/profile', '/history']);

        return {
            success: true,
            winners: transactionResult.inventoryItems,
            newPoints: updatedUser ? updatedUser.points : user.points - totalPrice
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

        revalidatePaths(['/inventory', '/profile', '/history']);

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
        const itemIds = user.inventory.map((item: (typeof user.inventory)[number]) => {
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

        revalidatePaths(['/inventory', '/profile', '/history']);

        return { success: true, totalPoints, count: itemIds.length };
    } catch (error) {
        console.error('Sell all error:', error);
        return { success: false, error: 'Ошибка при массовой продаже' };
    }
}

export async function withdrawItemAction(telegramId: string, itemId: string) {
    try {
        Logger.info('Withdrawal: Initiating request', { telegramId, itemId });

        const user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user) {
            Logger.warn('Withdrawal: User not found', { telegramId });
            return { success: false, error: 'User not found' };
        }

        if (!user.tradeUrl) {
            Logger.warn('Withdrawal: Missing trade URL', { telegramId });
            return { success: false, error: 'Сначала укажите ссылку на обмен в профиле' };
        }

        const item = await prisma.reward.findUnique({ where: { id: itemId } });

        if (!item || item.userId !== user.id || item.status !== 'IN_STOCK') {
            Logger.warn('Withdrawal: Item invalid or not in stock', { itemId, status: item?.status });
            return { success: false, error: 'Предмет не найден или уже выведен' };
        }

        // Market Integration
        const { MarketApi } = await import('@/lib/marketApi');

        // 1. Check Market Balance first
        const balanceRaw = await MarketApi.getMoney();
        if (balanceRaw === null) {
            Logger.error('Withdrawal: Could not check Market balance');
            return { success: false, error: 'на данный момент вывод предметов недоступен, обратитесь в поддержку' };
        }

        const balance = Number(balanceRaw);

        // Debugging types and values
        Logger.info('Withdrawal: Balance Check Debug', {
            balanceRaw,
            typeOfRaw: typeof balanceRaw,
            balance,
            typeOfBalance: typeof balance,
            balanceInKopeks: balance * 100
        });

        // 1. Determine cost
        // We TRY to fetch the current market price again to be precise.
        // If fetch fails, we fallback to the stored sellPrice (converted to kopeks).

        let maxPriceKopeks = 0;

        const currentMinPrice = await MarketApi.getMinPrice(item.name);
        if (currentMinPrice) {
            // Add a small buffer? User said "do purchase at price indicated".
            // If we buy at minPrice, it should work. 
            // Maybe add 10% buffer? Or just use what we found.
            // Let's use exact min price found.
            maxPriceKopeks = currentMinPrice;
            Logger.info('Withdrawal: Using realtime price', { itemName: item.name, maxPriceKopeks });
        } else {
            const suggestedPrice = calculateEffectivePrice(item.rarity, item.weight, (item as any).sellPrice);
            maxPriceKopeks = suggestedPrice * 100;
            Logger.warn('Withdrawal: Using calculated/stored price (fallback)', { itemName: item.name, maxPriceKopeks });
        }

        // Ensure we don't accidentally try to buy for 0
        if (maxPriceKopeks <= 0) maxPriceKopeks = 1000; // Min 10 rub fallback?

        const balanceKopeks = Math.floor(balance * 100);

        Logger.info('Withdrawal: Comparison Debug', {
            balance,
            balanceKopeks,
            maxPriceKopeks,
            condition: `${balanceKopeks} < ${maxPriceKopeks}`,
            result: balanceKopeks < maxPriceKopeks
        });

        if (balanceKopeks < maxPriceKopeks) {
            Logger.warn('Withdrawal: Insufficient Market balance', { balance, cost: maxPriceKopeks, balanceKopeks });
            return { success: false, error: 'на данный момент вывод предметов недоступен, обратитесь в поддержку' };
        }

        // 2. Buy for user using Reward ID as custom_id for tracking
        Logger.info('Withdrawal: Calling Market API', { itemName: item.name, maxPriceKopeks, customId: item.id });
        const marketResponse = await MarketApi.buyForUser(item.name, user.tradeUrl, maxPriceKopeks, item.id);

        if (!marketResponse.success) {
            Logger.error('Withdrawal: Market API failed', {
                error: marketResponse.error,
                itemId,
                itemName: item.name,
                userId: user.id
            });
            return { success: false, error: 'на данный момент вывод предметов недоступен, обратитесь в поддержку' };
        }

        Logger.info('Withdrawal: Market API success, updating DB', { marketId: marketResponse.id });
        await prisma.reward.update({
            where: { id: itemId },
            data: {
                status: 'WITHDRAW_PENDING',
                marketId: marketResponse.id,
                withdrawAt: new Date()
            } as any
        });

        revalidatePaths(['/profile', '/inventory']);
        Logger.info('Withdrawal: Completed successfully');
        return {
            success: true,
            id: marketResponse.id,
            message: 'Запрос на трейд создан! Ожидайте приглашение (5-10 мин). Примите его в течение 5 минут, иначе он будет отменен.'
        };
    } catch (error) {
        Logger.error('Withdrawal: Unexpected error', error, { telegramId, itemId });
        return { success: false, error: 'Ошибка сервера при выводе' };
    }
}

/**
 * Синхронизирует статус всех PENDING выводов пользователя с Маркетом
 */
export async function syncWithdrawalStatusAction(telegramId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: { inventory: { where: { status: 'WITHDRAW_PENDING' } as any } }
        });

        if (!user || user.inventory.length === 0) return { success: true, checked: 0 };

        const { MarketApi } = await import('@/lib/marketApi');
        let updatedCount = 0;

        for (const item of user.inventory) {
            // Check status by Reward ID (used as custom_id)
            const status = await MarketApi.getBuyInfoByCustomId(item.id);

            if (!status || !status.success) {
                // No status from API - just skip, don't reset the item
                // The item will remain in WITHDRAW_PENDING until the API responds
                continue;
            }

            const data = status.data;
            // stages: TRADE_STAGE_NEW(1), TRADE_STAGE_GIVEN(2), etc.
            // documentation says: settlement > 0 means finished
            if (data.settlement > 0) {
                await prisma.reward.update({
                    where: { id: item.id },
                    data: { status: 'WITHDRAWN' } as any
                });
                updatedCount++;
            } else if (
                Number(data.stage) === 5 ||
                data.stage === '5' ||
                data.stage === 'TRADE_STAGE_CANCELLED'
            ) { // Check cancellation
                await prisma.reward.update({
                    where: { id: item.id },
                    data: { status: 'IN_STOCK', marketId: null, withdrawAt: null } as any
                });
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            revalidatePaths(['/profile', '/inventory']);
        }
        return { success: true, updatedCount };
    } catch (error) {
        Logger.error('SyncWithdrawalStatus error:', error);
        return { success: false, error: 'Ошибка синхронизации' };
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
export async function updateTradeUrlAction(telegramId: string, tradeUrl: string) {
    try {
        if (!tradeUrl || !tradeUrl.includes('steamcommunity.com/tradeoffer/new')) {
            return { success: false, error: 'Некорректная ссылка на обмен' };
        }

        await prisma.user.update({
            where: { telegramId },
            data: { tradeUrl }
        });

        revalidatePaths(['/profile', '/settings']);
        return { success: true };
    } catch (error) {
        console.error('Update trade URL error:', error);
        return { success: false, error: 'Ошибка базы данных' };
    }
}
