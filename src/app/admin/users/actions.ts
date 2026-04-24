'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SUPER_ADMINS } from '@/lib/constants';

const revalidatePaths = (paths: string[]) => {
    for (const path of paths) {
        revalidatePath(path);
    }
};

const normalizePoints = (points: number): number => {
    if (!Number.isFinite(points)) return 0;
    return Math.max(0, Math.floor(points));
};

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
        if (!userId) {
            return { success: false, error: 'Пользователь не найден' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { points: normalizePoints(points) }
        });
        revalidatePaths(['/admin/users', '/profile']);
        return { success: true };
    } catch (error) {
        console.error('Failed to update user points:', error);
        return { success: false, error: 'Ошибка при обновлении баланса' };
    }
}

export async function updateUserTitles(userId: string, titles: string) {
    try {
        if (!userId) {
            return { success: false, error: 'Пользователь не найден' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { titles: titles?.trim() || '' }
        });
        revalidatePaths(['/admin/users', '/profile']);
        return { success: true };
    } catch (error) {
        console.error('Failed to update user titles:', error);
        return { success: false, error: 'Ошибка при обновлении званий' };
    }
}
export async function toggleAdminStatus(userId: string, currentStatus: boolean) {
    try {
        if (!userId) {
            return { success: false, error: 'Пользователь не найден' };
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && SUPER_ADMINS.includes(user.telegramId)) {
            return { success: false, error: 'Статус Супер-Администратора нельзя изменить' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isAdmin: !currentStatus }
        });
        revalidatePaths(['/admin/users', '/profile']);
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle admin status:', error);
        return { success: false, error: 'Ошибка при изменении прав' };
    }
}

export async function toggleWhitelistStatus(userId: string, currentStatus: boolean) {
    try {
        if (!userId) {
            return { success: false, error: 'Пользователь не найден' };
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && SUPER_ADMINS.includes(user.telegramId)) {
            return { success: false, error: 'Доступ Супер-Администратора нельзя изменить' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isWhitelisted: !currentStatus }
        });
        revalidatePaths(['/admin/users', '/profile']);
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle whitelist status:', error);
        return { success: false, error: 'Ошибка при изменении доступа' };
    }
}
