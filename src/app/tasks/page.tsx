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
    const [taskStatus, setTaskStatus] = useState<Record<string, { lastCompletedAt: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [now, setNow] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function load() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    const [allTasks, status] = await Promise.all([
                        getTasks(),
                        getUserTaskStatus(user.id.toString())
                    ]);
                    setTasks(allTasks);
                    setTaskStatus(status as Record<string, { lastCompletedAt: string }>);
                }
            }
            setIsLoading(false);
        }
        load();
    }, []);

    const handleAction = async (task: any) => {
        if (taskStatus[task.id]) return;

        const tg = window.Telegram?.WebApp;
        if (task.channelId && (task.type === 'SUBSCRIPTION' || task.type === 'SOCIAL')) {
            const isTelegramUrl = task.channelId.startsWith('@') || task.channelId.includes('t.me/');
            if (isTelegramUrl) {
                const url = task.channelId.startsWith('@') ? `https://t.me/${task.channelId.substring(1)}` : task.channelId;
                if (tg?.openTelegramLink) tg.openTelegramLink(url);
                else window.open(url, '_blank');
            } else {
                if (tg?.openLink) tg.openLink(task.channelId);
                else window.open(task.channelId, '_blank');
            }
            return;
        }

        setClaimingId(task.id);
        const user = tg?.initDataUnsafe?.user;
        if (user) {
            const result = await completeTaskAction(user.id.toString(), task.id);
            if (result.success) {
                setTaskStatus(prev => ({
                    ...prev,
                    [task.id]: { lastCompletedAt: new Date().toISOString() }
                }));
            } else {
                alert(result.error);
            }
        }
        setClaimingId(null);
    };

    const getCountdown = (lastCompletedAt: string) => {
        const last = new Date(lastCompletedAt);
        const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
        const diff = next.getTime() - now.getTime();

        if (diff <= 0) return null;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
            <PageHeader title={t.tasks.title} hideTitle />

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
                        const status = taskStatus[task.id];
                        const isCompleted = !!status;
                        const countdown = task.type === 'DAILY' && status ? getCountdown(status.lastCompletedAt) : null;
                        const isClaimable = task.type === 'DAILY' || !task.channelId;

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`dota-card p-4 flex items-center gap-4 transition-all relative overflow-hidden ${isCompleted ? 'opacity-60 bg-black/40' : 'bg-gradient-to-r from-[var(--secondary)] to-transparent border-l-2 border-l-[var(--accent)]'}`}
                            >
                                <div className={`w-12 h-12 steam-emboss flex items-center justify-center shrink-0 ${isCompleted ? 'text-green-500/50' : 'text-[var(--accent)]'}`}>
                                    {isCompleted && !countdown ? <Check size={24} /> : <Icon size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-[var(--foreground)] truncate text-[12px] uppercase tracking-tight">{task.title}</h3>
                                    <p className="text-[9px] text-[var(--foreground)]/40 line-clamp-2 uppercase font-bold tracking-tight leading-tight mt-0.5">{task.description}</p>
                                    {countdown && (
                                        <div className="flex items-center gap-2 mt-2 bg-[var(--accent)]/10 px-2 py-1 rounded w-fit border border-[var(--accent)]/20 animate-in fade-in zoom-in duration-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),1)]" />
                                            <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em]">{countdown}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <span className={`font-black text-[11px] ${isCompleted ? 'text-[var(--foreground)]/20' : 'text-[var(--accent)]'}`}>+{task.points} {t.common.bp}</span>
                                    {!isCompleted && (
                                        <button
                                            disabled={claimingId === task.id}
                                            onClick={() => handleAction(task)}
                                            className="steam-bevel bg-[var(--background)] h-8 px-4 text-[9px] font-black uppercase active:translate-y-[1px] transition-none disabled:opacity-50 text-[var(--foreground)] border-[var(--border-light)]"
                                        >
                                            {isClaimable ? t.tasks.claim.toUpperCase() : t.common.open.toUpperCase()}
                                        </button>
                                    )}
                                    {isCompleted && countdown && (
                                        <div className="steam-bevel bg-black/20 h-8 px-3 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t.tasks.completed.toUpperCase()}</span>
                                        </div>
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
