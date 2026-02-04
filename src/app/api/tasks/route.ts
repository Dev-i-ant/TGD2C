import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const tasks = await prisma.task.findMany();
    return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
    try {
        const { userId, taskId } = await req.json();

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        const existingUserTask = await prisma.userTask.findUnique({
            where: {
                userId_taskId: { userId, taskId }
            }
        });

        if (existingUserTask) {
            return NextResponse.json({ error: 'Already completed' }, { status: 400 });
        }

        // Update user points, mark task as completed, and log transaction
        const [updatedUser] = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { points: { increment: task.points } }
            }),
            prisma.userTask.create({
                data: { userId, taskId }
            }),
            prisma.transaction.create({
                data: {
                    userId: userId,
                    amount: task.points,
                    type: 'TASK_REWARD',
                    description: `Выполнение задания: ${task.title}`
                }
            })
        ]);

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
