'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Users, ExternalLink, ClipboardList, Check } from 'lucide-react';
import { getTasks, getUserTaskStatus, completeTaskAction } from '../actions/tasks';

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    const [allTasks, completed] = await Promise.all([
                        getTasks(),
                        getUserTaskStatus(user.id.toString())
                    ]);
                    setTasks(allTasks);
                    setCompletedTaskIds(completed);
                }
            }
            setIsLoading(false);
        }
        load();
    }, []);

    const handleAction = async (task: any) => {
        if (completedTaskIds.includes(task.id)) return;

        // Use Telegram WebApp API for opening links if available
        const tg = window.Telegram?.WebApp;

        // If it's a gated task with a link
        if (task.channelId && (task.type === 'SUBSCRIPTION' || task.type === 'SOCIAL')) {
            const isTelegramUrl = task.channelId.startsWith('@') || task.channelId.includes('t.me/');

            if (isTelegramUrl) {
                const url = task.channelId.startsWith('@')
                    ? `https://t.me/${task.channelId.substring(1)}`
                    : task.channelId;

                if (tg?.openTelegramLink) {
                    tg.openTelegramLink(url);
                } else {
                    window.open(url, '_blank');
                }
            } else {
                if (tg?.openLink) {
                    tg.openLink(task.channelId);
                } else {
                    window.open(task.channelId, '_blank');
                }
            }
            return;
        }

        // If it's a claimable task (DAILY or others without forced flow)
        setClaimingId(task.id);
        const user = tg?.initDataUnsafe?.user;

        if (user) {
            const result = await completeTaskAction(user.id.toString(), task.id);
            if (result.success) {
                setCompletedTaskIds(prev => [...prev, task.id]);
            } else {
                alert(result.error);
            }
        }
        setClaimingId(null);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUBSCRIPTION': return Send;
            case 'SOCIAL': return Users;
            default: return ClipboardList;
        }
    };

    return (
        <div className="pb-24">
            <PageHeader title="Задания" />

            <div className="flex flex-col gap-4 p-6">
                {isLoading ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="dota-card p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed bg-transparent">
                        <p className="text-gray-600 text-[10px] uppercase font-bold text-center">Заданий пока нет. Заходи позже!</p>
                    </div>
                ) : (
                    tasks.map((task, index) => {
                        const Icon = getIcon(task.type);
                        const isCompleted = completedTaskIds.includes(task.id);
                        const isClaimable = task.type === 'DAILY' || !task.channelId;

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                                className={`dota-card p-4 flex items-center gap-4 transition-opacity ${isCompleted ? 'opacity-50' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isCompleted ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                    {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate text-sm uppercase">{task.title}</h3>
                                    <p className="text-[10px] text-white/40 line-clamp-1 uppercase font-bold">{task.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <span className="text-yellow-500 font-black text-xs">+{task.points} BP</span>
                                    {isCompleted ? (
                                        <div className="bg-green-500/20 text-green-500 p-1.5 rounded-lg border border-green-500/20">
                                            <Check size={16} />
                                        </div>
                                    ) : (
                                        <button
                                            disabled={claimingId === task.id}
                                            onClick={() => handleAction(task)}
                                            className={`${isClaimable ? 'bg-green-600/20 text-green-400 border-green-500/20 px-3' : 'bg-blue-600/20 text-blue-400 border-blue-500/20 px-1.5'} hover:opacity-80 py-1.5 rounded-lg transition-all border active:scale-95 disabled:opacity-50`}
                                        >
                                            {isClaimable ? (
                                                <span className="text-[10px] font-black uppercase">Забрать</span>
                                            ) : (
                                                <ExternalLink size={16} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
