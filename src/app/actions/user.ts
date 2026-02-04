'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function syncUser(data: { telegramId: string; username?: string; firstName?: string; lastName?: string }) {
    try {
        const user = await prisma.user.upsert({
            where: { telegramId: data.telegramId },
            update: {
                // Only update username if it's provided, to prevent nullifying
                ...(data.username && { username: data.username }),
            },
            create: {
                telegramId: data.telegramId,
                username: data.username || data.firstName || '',
                points: 1000, // Initial bonus points for testing
            },
        });
        return { success: true, user };
    } catch (error) {
        console.error('Failed to sync user:', error);
        return { success: false, error: 'Database error' };
    }
}

export async function getUserData(telegramId: string) {
    try {
        return await prisma.user.findUnique({
            where: { telegramId },
            include: {
                inventory: true,
                transactions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    } catch (error) {
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
            include: { rewards: true }
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

            // Add reward to user (creating a copy for inventory)
            const inventoryItem = await tx.reward.create({
                data: {
                    name: winner.name,
                    rarity: winner.rarity,
                    weight: winner.weight,
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
                    description: `Открытие кейса: ${caseData.name}`,
                }
            });

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

        // Use weight as a proxy for price (e.g., 50% of weight)
        const sellPrice = Math.floor(item.weight / 2) || 10;

        await prisma.$transaction(async (tx: any) => {
            // Delete item
            await tx.reward.delete({ where: { id: itemId } });

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
                    description: `Продажа предмета: ${item.name}`,
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
