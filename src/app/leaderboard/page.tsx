'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User as UserIcon, Package } from 'lucide-react';
import { getLeaderboard } from '../actions/user';

import { useTranslation } from '@/components/LanguageProvider';

export default function LeaderboardPage() {
    const { t } = useTranslation();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const result = await getLeaderboard();
            if (result.success) {
                setLeaderboard(result.leaderboard || []);
            }

            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                setCurrentUserId(window.Telegram.WebApp.initDataUnsafe?.user?.id?.toString());
            }
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title={t.nav.leaderboard} />
                <div className="p-6 flex flex-col gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-16 steam-bevel" />
                    ))}
                </div>
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <div className="pb-24">
            <PageHeader title={t.leaderboard.title} backPath="/profile" />

            <div className="p-6 flex flex-col gap-8">
                {/* Podium */}
                {topThree.length > 0 && (
                    <div className="flex items-end justify-center gap-2 pt-8 pb-4">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-2 w-24"
                            >
                                <div className="relative steam-emboss p-1">
                                    <div className="w-14 h-14 bg-slate-400/20 flex items-center justify-center">
                                        <UserIcon size={24} className="text-slate-400" />
                                    </div>
                                    <div className="absolute -top-2 -left-2 steam-bevel bg-slate-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5">2ND</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-[var(--foreground)] uppercase truncate w-20 tracking-tighter">{topThree[1].username || t.leaderboard.player}</p>
                                    <p className="text-[9px] text-[var(--accent)] font-black">{topThree[1].points} {t.common.bp}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-2 w-28 z-10"
                            >
                                <div className="relative steam-emboss p-1.5 border-[var(--accent)]/50 border-2">
                                    <div className="w-18 h-18 bg-[var(--accent)]/20 flex items-center justify-center">
                                        <UserIcon size={32} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 steam-bevel bg-[var(--accent)] text-black text-[10px] font-black px-2 py-0.5">{t.leaderboard.champion.toUpperCase()}</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate w-24 tracking-widest">{topThree[0].username || t.leaderboard.player}</p>
                                    <p className="text-xs text-[var(--accent)] font-black">{topThree[0].points} {t.common.bp}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-2 w-24"
                            >
                                <div className="relative steam-emboss p-1">
                                    <div className="w-14 h-14 bg-orange-700/20 flex items-center justify-center">
                                        <UserIcon size={24} className="text-orange-700" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 steam-bevel bg-orange-700 text-orange-100 text-[9px] font-black px-1.5 py-0.5">3RD</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-[var(--foreground)] uppercase truncate w-20 tracking-tighter">{topThree[2].username || t.leaderboard.player}</p>
                                    <p className="text-[9px] text-[var(--accent)] font-black">{topThree[2].points} {t.common.bp}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* List */}
                <div className="flex flex-col gap-2">
                    {others.map((user, index) => {
                        const isMe = user.telegramId === currentUserId;
                        return (
                            <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                key={user.id}
                                className={`steam-bevel p-2 flex items-center gap-4 transition-none ${isMe ? 'border-2 border-[var(--accent)] bg-[var(--accent)]/5' : ''}`}
                            >
                                <span className={`text-[10px] font-black w-6 text-center text-[var(--foreground)]/40`}>
                                    {index + 4}
                                </span>
                                <div className="w-10 h-10 steam-emboss p-1 shrink-0">
                                    <div className="w-full h-full bg-black/20 flex items-center justify-center">
                                        <UserIcon size={16} className="text-[var(--foreground)]/20" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[var(--foreground)] truncate flex items-center gap-2 uppercase text-[11px] tracking-tighter">
                                        {user.username || t.leaderboard.player}
                                        {isMe && <span className="text-[8px] bg-[var(--accent)] text-black px-1 font-black uppercase">{t.leaderboard.you}</span>}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[9px] text-[var(--foreground)]/40 font-bold flex items-center gap-1 uppercase tracking-widest">
                                            {user._count.inventory} {t.leaderboard.items.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-[var(--accent)] text-xs">{user.points}</p>
                                    <p className="text-[7px] text-[var(--foreground)]/30 font-bold uppercase tracking-widest leading-none">{t.leaderboard.balance.toUpperCase()}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
