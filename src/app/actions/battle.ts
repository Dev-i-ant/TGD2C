'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { runBattle } from "@/lib/battleLogic";

/**
 * Create a new battle
 */
export async function createBattleAction(telegramId: string, caseIds: string[], maxParticipants: number, isCrazyMode: boolean = false) {
    try {
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: { inventory: true }
        });

        if (!user) return { success: false, error: 'User not found' };

        // 1. Calculate total price and verify cases
        const cases = await prisma.case.findMany({
            where: { id: { in: caseIds } }
        });

        if (cases.length === 0) return { success: false, error: 'No cases selected' };

        // Maintain order of cases as provided
        const caseMap = new Map(cases.map(c => [c.id, c]));
        const orderedCases = caseIds.map(id => caseMap.get(id)).filter(Boolean) as any[];

        const totalPricePerBatch = orderedCases.reduce((sum, c) => sum + c.price, 0);

        if (user.points < totalPricePerBatch) {
            return { success: false, error: 'Insufficient BP' };
        }

        // 2. Create battle and deduct points from creator
        const battle = await prisma.$transaction(async (tx) => {
            // Deduct points
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { points: { decrement: totalPricePerBatch } }
            });

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: -totalPricePerBatch,
                    type: 'BATTLE_CREATE',
                    description: `Кейс Баттл (Создание)`
                }
            });

            // Create Battle
            const newBattle = await tx.battle.create({
                data: {
                    creatorId: user.id,
                    maxParticipants,
                    totalPrice: totalPricePerBatch,
                    status: 'WAITING',
                    isCrazyMode,
                }
            });

            // Create Participants
            await tx.battleParticipant.create({
                data: {
                    battleId: newBattle.id,
                    userId: user.id,
                    slot: 0,
                    isBot: false
                }
            });

            // Create Case sequence
            for (let i = 0; i < orderedCases.length; i++) {
                await tx.battleCase.create({
                    data: {
                        battleId: newBattle.id,
                        caseId: orderedCases[i].id,
                        order: i
                    }
                });
            }

            return newBattle;
        });

        revalidatePath('/games/battle');
        return { success: true, battleId: battle.id };
    } catch (error: any) {
        console.error('[CreateBattle] Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Join an existing battle
 */
export async function joinBattleAction(telegramId: string, battleId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user) return { success: false, error: 'User not found' };

        const battle = await prisma.battle.findUnique({
            where: { id: battleId },
            include: { participants: true }
        });

        if (!battle) return { success: false, error: 'Battle not found' };
        if (battle.status !== 'WAITING') return { success: false, error: 'Battle already started' };
        if (battle.participants.length >= battle.maxParticipants) return { success: false, error: 'Battle full' };
        if (battle.participants.find(p => p.userId === user.id)) return { success: false, error: 'Already joined' };

        if (user.points < battle.totalPrice) return { success: false, error: 'Insufficient BP' };

        await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.user.update({
                where: { id: user.id },
                data: { points: { decrement: battle.totalPrice } }
            });

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: -battle.totalPrice,
                    type: 'BATTLE_JOIN',
                    description: `Кейс Баттл (Участие)`
                }
            });

            // Add participant
            await tx.battleParticipant.create({
                data: {
                    battleId: battle.id,
                    userId: user.id,
                    slot: battle.participants.length,
                    isBot: false
                }
            });
        });

        // Trigger battle start if full
        const updatedBattle = await prisma.battle.findUnique({
            where: { id: battleId },
            include: { participants: true }
        });

        if (updatedBattle && updatedBattle.participants.length >= updatedBattle.maxParticipants) {
            runBattle(battleId);
        }

        revalidatePath(`/games/battle/${battleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Add a bot to the battle
 */
export async function addBotToBattleAction(battleId: string) {
    try {
        const battle = await prisma.battle.findUnique({
            where: { id: battleId },
            include: { participants: true }
        });

        if (!battle) return { success: false, error: 'Battle not found' };
        if (battle.status !== 'WAITING') return { success: false, error: 'Battle already started' };
        if (battle.participants.length >= battle.maxParticipants) return { success: false, error: 'Battle full' };

        await prisma.battleParticipant.create({
            data: {
                battleId: battle.id,
                slot: battle.participants.length,
                isBot: true,
                totalValue: 0
            }
        });

        // Trigger battle start if full
        if (battle.participants.length + 1 >= battle.maxParticipants) {
            runBattle(battleId);
        }

        revalidatePath(`/games/battle/${battleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get active battles
 */
export async function getActiveBattles() {
    return prisma.battle.findMany({
        where: { status: { in: ['WAITING', 'IN_PROGRESS'] } },
        include: {
            participants: { include: { user: true } },
            cases: { include: { case: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

/**
 * Get single battle details
 */
export async function getBattleDetail(battleId: string) {
    return prisma.battle.findUnique({
        where: { id: battleId },
        include: {
            participants: { include: { user: true } },
            cases: {
                include: {
                    case: {
                        include: { rewards: { where: { userId: null } } }
                    }
                }
            },
            rewards: { include: { reward: true } }
        }
    });
}
/**
 * Cancel a battle and refund all human participants
 */
export async function cancelBattleAction(battleId: string, telegramId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user) return { success: false, error: 'User not found' };

        const battle = await prisma.battle.findUnique({
            where: { id: battleId },
            include: { participants: { include: { user: true } } }
        });

        if (!battle) return { success: false, error: 'Battle not found' };
        if (battle.creatorId !== user.id) return { success: false, error: 'Only creator can cancel' };
        if (battle.status !== 'WAITING') return { success: false, error: 'Battle already in progress' };

        await prisma.$transaction(async (tx) => {
            // Refund each human participant
            for (const p of battle.participants) {
                if (!p.isBot && p.userId) {
                    await tx.user.update({
                        where: { id: p.userId },
                        data: { points: { increment: battle.totalPrice } }
                    });

                    await tx.transaction.create({
                        data: {
                            userId: p.userId,
                            amount: battle.totalPrice,
                            type: 'BATTLE_CANCEL_REFUND',
                            description: `Кейс Баттл (Отмена)`
                        }
                    });
                }
            }

            // Delete battle (cascades to participants, cases, rewards)
            await tx.battle.delete({
                where: { id: battle.id }
            });
        });

        revalidatePath('/games/battle');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get finished battle history
 */
export async function getBattleHistory() {
    return prisma.battle.findMany({
        where: { status: 'FINISHED' },
        include: {
            participants: { include: { user: true } },
            cases: { include: { case: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
    });
}
