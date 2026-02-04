'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
        const newCase = await prisma.case.create({
            data: {
                name: data.name,
                price: data.price,
                rarity: data.rarity,
                color: data.color,
                image: data.image || null,
            },
        });
        revalidatePath('/cases');
        revalidatePath('/admin/cases');
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
        const updatedCase = await prisma.case.update({
            where: { id },
            data: {
                name: data.name,
                price: data.price,
                rarity: data.rarity,
                color: data.color,
                image: data.image || null,
            },
        });
        revalidatePath('/cases');
        revalidatePath(`/cases/${id}`);
        revalidatePath('/admin/cases');
        return { success: true, case: updatedCase };
    } catch (error) {
        console.error('Failed to update case:', error);
        return { success: false, error: 'Ошибка при обновлении кейса' };
    }
}

export async function deleteCase(id: string) {
    try {
        await prisma.case.delete({
            where: { id },
        });
        revalidatePath('/cases');
        revalidatePath('/admin/cases');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete case:', error);
        return { success: false, error: 'Ошибка при удалении кейса' };
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
        const reward = await prisma.reward.create({
            data: {
                name: data.name,
                rarity: data.rarity,
                weight: data.weight,
                sellPrice: data.sellPrice || null,
                image: data.image || null,
                caseId: caseId,
            },
        });
        revalidatePath(`/cases/${caseId}`);
        revalidatePath(`/admin/cases/${caseId}/items`);
        return { success: true, reward };
    } catch (error) {
        console.error('Failed to add reward:', error);
        return { success: false, error: 'Ошибка при добавлении предмета' };
    }
}

export async function deleteReward(rewardId: string, caseId: string) {
    try {
        await prisma.reward.delete({
            where: { id: rewardId },
        });
        revalidatePath(`/cases/${caseId}`);
        revalidatePath(`/admin/cases/${caseId}/items`);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete reward:', error);
        return { success: false, error: 'Ошибка при удалении предмета' };
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
}) {
    try {
        const item = await prisma.globalItem.create({
            data: {
                name: data.name,
                rarity: data.rarity,
                image: data.image || null,
                sellPrice: data.sellPrice || null,
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
}) {
    try {
        const item = await prisma.globalItem.update({
            where: { id },
            data: {
                name: data.name,
                rarity: data.rarity,
                image: data.image || null,
                sellPrice: data.sellPrice || null,
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

export async function addRewardFromLibrary(caseId: string, globalItemId: string, weight: number) {
    try {
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
                weight: weight,
                caseId: caseId,
            },
        });

        revalidatePath(`/cases/${caseId}`);
        revalidatePath(`/admin/cases/${caseId}/items`);
        return { success: true, reward };
    } catch (error) {
        console.error('Failed to add reward from library:', error);
        return { success: false, error: 'Ошибка при добавлении предмета из библиотеки' };
    }
}
