'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAllUsers() {
    try {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                telegramId: true,
                username: true,
                points: true,
                isAdmin: true,
                isWhitelisted: true,
                titles: true,
                createdAt: true,
                _count: {
                    select: { inventory: true, transactions: true }
                }
            }
        });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export async function updateUserPoints(userId: string, points: number) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { points }
        });
        revalidatePath('/admin/users');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user points:', error);
        return { success: false, error: 'Ошибка при обновлении баланса' };
    }
}

export async function updateUserTitles(userId: string, titles: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { titles }
        });
        revalidatePath('/admin/users');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user titles:', error);
        return { success: false, error: 'Ошибка при обновлении званий' };
    }
}
export async function toggleAdminStatus(userId: string, currentStatus: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isAdmin: !currentStatus }
        });
        revalidatePath('/admin/users');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle admin status:', error);
        return { success: false, error: 'Ошибка при изменении прав' };
    }
}

export async function toggleWhitelistStatus(userId: string, currentStatus: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isWhitelisted: !currentStatus }
        });
        revalidatePath('/admin/users');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle whitelist status:', error);
        return { success: false, error: 'Ошибка при изменении доступа' };
    }
}
