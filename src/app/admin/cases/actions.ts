'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const revalidatePaths = (paths: string[]) => {
    for (const path of paths) {
        revalidatePath(path);
    }
};

const normalizePositiveNumber = (value: number, fallback: number): number => {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(1, Math.floor(value));
};

export async function getCases() {
    try {
        return await prisma.case.findMany({
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Failed to fetch cases:', error);
        return [];
    }
}

export async function getCaseById(id: string) {
    try {
        return await prisma.case.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error('Failed to fetch case:', error);
        return null;
    }
}

export async function createCase(data: {
    name: string;
    price: number;
    rarity: string;
    color: string;
    image?: string | null;
}) {
    try {
        if (!data.name?.trim()) {
            return { success: false, error: 'Название кейса обязательно' };
        }

        const newCase = await prisma.case.create({
            data: {
                name: data.name.trim(),
                price: normalizePositiveNumber(data.price, 1),
                rarity: data.rarity,
                color: data.color,
                image: data.image || null,
            },
        });
        revalidatePaths(['/cases', '/admin/cases']);
        return { success: true, case: newCase };
    } catch (error) {
        console.error('Failed to create case:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Ошибка: ${errorMessage}` };
    }
}

export async function updateCase(id: string, data: {
    name: string;
    price: number;
    rarity: string;
    color: string;
    image?: string | null;
}) {
    try {
        if (!id) return { success: false, error: 'Кейс не найден' };
        if (!data.name?.trim()) {
            return { success: false, error: 'Название кейса обязательно' };
        }

        const updatedCase = await prisma.case.update({
            where: { id },
            data: {
                name: data.name.trim(),
                price: normalizePositiveNumber(data.price, 1),
                rarity: data.rarity,
                color: data.color,
                image: data.image || null,
            },
        });
        revalidatePaths(['/cases', `/cases/${id}`, '/admin/cases']);
        return { success: true, case: updatedCase };
    } catch (error) {
        console.error('Failed to update case:', error);
        return { success: false, error: 'Ошибка при обновлении кейса' };
    }
}

export async function deleteCase(id: string) {
    try {
        if (!id) return { success: false, error: 'Кейс не найден' };

        await prisma.case.delete({
            where: { id },
        });
        revalidatePaths(['/cases', '/admin/cases']);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete case:', error);
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Ошибка при удалении кейса: ${errMsg}` };
    }
}

export async function getCaseRewards(caseId: string) {
    try {
        return await prisma.reward.findMany({
            where: {
                caseId,
                userId: null // Only show templates, not user rewards
            },
            orderBy: { rarity: 'asc' },
        });
    } catch (error) {
        console.error('Failed to fetch rewards:', error);
        return [];
    }
}

export async function addReward(caseId: string, data: {
    name: string;
    rarity: string;
    weight: number;
    image?: string | null;
    sellPrice?: number | null;
}) {
    try {
        if (!caseId) return { success: false, error: 'Кейс не найден' };
        if (!data.name?.trim()) return { success: false, error: 'Название предмета обязательно' };

        const reward = await prisma.reward.create({
            data: {
                name: data.name.trim(),
                rarity: data.rarity,
                weight: normalizePositiveNumber(data.weight, 100),
                sellPrice: data.sellPrice || null,
                image: data.image || null,
                caseId: caseId,
            },
        });
        revalidatePaths([`/cases/${caseId}`, `/admin/cases/${caseId}/items`]);
        return { success: true, reward };
    } catch (error) {
        console.error('Failed to add reward:', error);
        return { success: false, error: 'Ошибка при добавлении предмета' };
    }
}

export async function updateReward(rewardId: string, caseId: string, data: {
    name: string;
    rarity: string;
    weight: number;
    image?: string | null;
    sellPrice?: number | null;
}) {
    try {
        if (!rewardId || !caseId) return { success: false, error: 'Предмет не найден' };
        if (!data.name?.trim()) return { success: false, error: 'Название предмета обязательно' };

        const reward = await prisma.reward.update({
            where: { id: rewardId },
            data: {
                name: data.name.trim(),
                rarity: data.rarity,
                weight: normalizePositiveNumber(data.weight, 100),
                sellPrice: data.sellPrice !== undefined ? data.sellPrice : null,
                image: data.image || null,
            },
        });
        revalidatePaths([`/cases/${caseId}`, `/admin/cases/${caseId}/items`]);
        return { success: true, reward };
    } catch (error) {
        console.error('Failed to update reward:', error);
        return { success: false, error: 'Ошибка при обновлении предмета' };
    }
}

export async function deleteReward(rewardId: string, caseId: string) {
    try {
        if (!rewardId || !caseId) return { success: false, error: 'Предмет не найден' };

        await prisma.reward.delete({
            where: { id: rewardId },
        });
        revalidatePaths([`/cases/${caseId}`, `/admin/cases/${caseId}/items`]);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete reward:', error);
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Ошибка при удалении предмета: ${errMsg}` };
    }
}

// --- Global Items ---

export async function getGlobalItems() {
    try {
        return await prisma.globalItem.findMany({
            orderBy: { name: 'asc' },
        });
    } catch (error) {
        console.error('Failed to fetch global items:', error);
        return [];
    }
}

export async function addGlobalItem(data: {
    name: string;
    rarity: string;
    image?: string | null;
    sellPrice?: number | null;
    defaultWeight?: number | null;
}) {
    try {
        if (!data.name?.trim()) return { success: false, error: 'Название предмета обязательно' };

        const item = await prisma.globalItem.create({
            data: {
                name: data.name.trim(),
                rarity: data.rarity,
                image: data.image || null,
                sellPrice: data.sellPrice || null,
                defaultWeight: normalizePositiveNumber(data.defaultWeight ?? 100, 100),
            },
        });
        revalidatePath('/admin/items');
        return { success: true, item };
    } catch (error) {
        console.error('Failed to add global item:', error);
        return { success: false, error: 'Ошибка при добавлении предмета в библиотеку' };
    }
}

export async function updateGlobalItem(id: string, data: {
    name: string;
    rarity: string;
    image?: string | null;
    sellPrice?: number | null;
    defaultWeight?: number | null;
}) {
    try {
        if (!id) return { success: false, error: 'Предмет не найден' };
        if (!data.name?.trim()) return { success: false, error: 'Название предмета обязательно' };

        const item = await prisma.globalItem.update({
            where: { id },
            data: {
                name: data.name.trim(),
                rarity: data.rarity,
                image: data.image || null,
                sellPrice: data.sellPrice || null,
                defaultWeight: normalizePositiveNumber(data.defaultWeight ?? 100, 100),
            },
        });
        revalidatePath('/admin/items');
        return { success: true, item };
    } catch (error) {
        console.error('Failed to update global item:', error);
        return { success: false, error: 'Ошибка при обновлении предмета в библиотеке' };
    }
}

export async function deleteGlobalItem(id: string) {
    try {
        if (!id) return { success: false, error: 'Предмет не найден' };

        await prisma.globalItem.delete({
            where: { id },
        });
        revalidatePath('/admin/items');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete global item:', error);
        return { success: false, error: 'Ошибка при удалении предмета из библиотеки' };
    }
}

export async function addRewardFromLibrary(caseId: string, globalItemId: string, weight?: number | null) {
    try {
        if (!caseId || !globalItemId) return { success: false, error: 'Некорректные данные' };

        const globalItem = await prisma.globalItem.findUnique({
            where: { id: globalItemId }
        });

        if (!globalItem) return { success: false, error: 'Предмет не найден в библиотеке' };

        const reward = await prisma.reward.create({
            data: {
                name: globalItem.name,
                rarity: globalItem.rarity,
                image: globalItem.image,
                sellPrice: globalItem.sellPrice,
                weight: normalizePositiveNumber(weight ?? globalItem.defaultWeight ?? 100, 100),
                caseId: caseId,
            },
        });

        revalidatePaths([`/cases/${caseId}`, `/admin/cases/${caseId}/items`]);
        return { success: true, reward };
    } catch (error) {
        console.error('Failed to add reward from library:', error);
        return { success: false, error: 'Ошибка при добавлении предмета из библиотеки' };
    }
}
export async function autoBalanceCase(caseId: string, targetRtp: number = 85) {
    try {
        if (!caseId) return { success: false, error: 'Кейс не найден' };
        const safeTargetRtp = Math.min(200, Math.max(10, targetRtp));

        const c = await prisma.case.findUnique({
            where: { id: caseId },
            include: { rewards: { where: { userId: null } } }
        });

        if (!c) return { success: false, error: 'Кейс не найден' };
        if (c.rewards.length === 0) return { success: false, error: 'Кейс пуст' };

        // Group rewards by rarity to calculate weights
        const rarityGroups: Record<string, Array<(typeof c.rewards)[number]>> = {};
        c.rewards.forEach(r => {
            if (!rarityGroups[r.rarity]) rarityGroups[r.rarity] = [];
            rarityGroups[r.rarity].push(r);
        });

        // Get base economy config
        const { ECONOMY_CONFIG } = await import('@/lib/constants');

        // Calculate the ratio between actual target and base target (85%)
        const rtpRatio = safeTargetRtp / 85;

        const updates = c.rewards.map(r => {
            const config = ECONOMY_CONFIG[r.rarity as keyof typeof ECONOMY_CONFIG] || ECONOMY_CONFIG.COMMON;

            // Scaled multiplier based on target RTP
            const scaledMultiplier = config.multiplier * rtpRatio;
            const suggestedPrice = Math.max(1, Math.floor(c.price * scaledMultiplier));

            // Weight remains rarity-balanced
            const itemsCountInRarity = rarityGroups[r.rarity].length;
            const suggestedWeight = normalizePositiveNumber(Math.floor((config.baseProbability * 100) / itemsCountInRarity), 1);

            return prisma.reward.update({
                where: { id: r.id },
                data: {
                    sellPrice: suggestedPrice,
                    weight: suggestedWeight
                }
            });
        });

        await prisma.$transaction(updates);

        revalidatePaths([`/cases/${caseId}`, `/admin/cases/${caseId}/items`]);
        return { success: true };
    } catch (error) {
        console.error('Failed to auto-balance case:', error);
        return { success: false, error: 'Ошибка при автоматической балансировке' };
    }
}
