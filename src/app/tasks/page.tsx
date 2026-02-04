'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Users, ExternalLink, ClipboardList, Check } from 'lucide-react';
import { getTasks, getUserTaskStatus, completeTaskAction } from '../actions/tasks';

import { useTranslation } from '@/components/LanguageProvider';

export default function TasksPage() {
    const { t } = useTranslation();
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
            <PageHeader title={t.tasks.title} />

            <div className="flex flex-col gap-4 p-6">
                {isLoading ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="dota-card p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed bg-transparent">
                        <p className="text-gray-600 text-[10px] uppercase font-bold text-center">{t.common.soon}</p>
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
                                transition={{ delay: index * 0.05 }}
                                className={`steam-bevel p-2 flex items-center gap-4 transition-opacity ${isCompleted ? 'opacity-50 grayscale' : ''}`}
                            >
                                <div className={`w-10 h-10 steam-emboss flex items-center justify-center ${isCompleted ? 'text-green-500/50' : 'text-[var(--accent)]'}`}>
                                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[var(--foreground)] truncate text-[11px] uppercase tracking-tighter">{task.title}</h3>
                                    <p className="text-[9px] text-[var(--foreground)]/40 line-clamp-1 uppercase font-bold tracking-tighter">{task.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <span className="text-[var(--accent)] font-black text-[10px]">+{task.points} {t.common.bp}</span>
                                    {isCompleted ? (
                                        <div className="steam-emboss text-green-500/50 p-1">
                                            <Check size={14} />
                                        </div>
                                    ) : (
                                        <button
                                            disabled={claimingId === task.id}
                                            onClick={() => handleAction(task)}
                                            className="steam-bevel h-8 px-3 text-[9px] font-black uppercase active:translate-y-[1px] transition-none disabled:opacity-50"
                                        >
                                            {isClaimable ? t.tasks.claim.toUpperCase() : t.common.open.toUpperCase()}
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
