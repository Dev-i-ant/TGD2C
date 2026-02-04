'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
    try {
        return await prisma.task.findMany({
            orderBy: { points: 'desc' },
        });
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
    }
}

export async function getUserTaskStatus(userId: string) {
    try {
        const completedTasks = await prisma.userTask.findMany({
            where: { userId },
            select: { taskId: true }
        });
        return completedTasks.map(t => t.taskId);
    } catch (error) {
        console.error('Failed to fetch user tasks:', error);
        return [];
    }
}

export async function createTask(data: {
    title: string;
    description: string;
    points: number;
    type: string;
    channelId?: string | null;
}) {
    try {
        const newTask = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                points: data.points,
                type: data.type,
                channelId: data.channelId || null,
            },
        });
        revalidatePath('/tasks');
        revalidatePath('/admin/tasks');
        return { success: true, task: newTask };
    } catch (error) {
        console.error('Failed to create task:', error);
        return { success: false, error: 'Ошибка при создании задания' };
    }
}

export async function updateTask(id: string, data: {
    title: string;
    description: string;
    points: number;
    type: string;
    channelId?: string | null;
}) {
    try {
        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                points: data.points,
                type: data.type,
                channelId: data.channelId || null,
            },
        });
        revalidatePath('/tasks');
        revalidatePath('/admin/tasks');
        return { success: true, task: updatedTask };
    } catch (error) {
        console.error('Failed to update task:', error);
        return { success: false, error: 'Ошибка при обновлении задания' };
    }
}

export async function deleteTask(id: string) {
    try {
        await prisma.task.delete({
            where: { id },
        });
        revalidatePath('/tasks');
        revalidatePath('/admin/tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete task:', error);
        return { success: false, error: 'Ошибка при удалении задания' };
    }
}

export async function completeTaskAction(telegramId: string, taskId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { telegramId }
        });
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!user || !task) return { success: false, error: 'User or task not found' };

        // Check if already completed (for non-DAILY tasks)
        if (task.type !== 'DAILY') {
            const existing = await prisma.userTask.findFirst({
                where: { userId: user.id, taskId }
            });
            if (existing) return { success: false, error: 'Задание уже выполнено' };
        }

        // Transactional update
        await prisma.$transaction(async (tx) => {
            // Add points
            await tx.user.update({
                where: { id: user.id },
                data: { points: { increment: task.points } }
            });

            // Create record
            await tx.userTask.create({
                data: {
                    userId: user.id,
                    taskId: task.id
                }
            });

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: task.points,
                    type: 'TASK_REWARD',
                    description: `Награда за задание: ${task.title}`,
                }
            });
        });

        revalidatePath('/tasks');
        revalidatePath('/profile');

        return { success: true, points: task.points };
    } catch (error) {
        console.error('Complete task error:', error);
        return { success: false, error: 'Ошибка при выполнении задания' };
    }
}
