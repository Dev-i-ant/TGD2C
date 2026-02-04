'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User as UserIcon, Package } from 'lucide-react';
import { getLeaderboard } from '../actions/user';

export default function LeaderboardPage() {
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
                <PageHeader title="Рейтинг" />
                <div className="p-6 flex flex-col gap-6 animate-pulse">
                    <div className="h-64 bg-white/5 rounded-2xl" />
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <div className="pb-24">
            <PageHeader title="Топ игроков" />

            <div className="p-6 flex flex-col gap-8">
                {/* Podium */}
                {topThree.length > 0 && (
                    <div className="flex items-end justify-center gap-2 pt-8 pb-4">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center gap-2 w-24"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-slate-400 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                                        <div className="w-full h-full rounded-full bg-[#1c242d] flex items-center justify-center overflow-hidden">
                                            <UserIcon size={32} className="text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">2</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white truncate w-20">{topThree[1].username || 'Игрок'}</p>
                                    <p className="text-[10px] text-slate-400 font-black">{topThree[1].points} BP</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1.1 }}
                                className="flex flex-col items-center gap-2 w-28 z-10 -translate-y-4"
                            >
                                <div className="relative">
                                    <Crown size={24} className="text-yellow-500 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                    <div className="w-20 h-20 rounded-full bg-yellow-500 p-1.5 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.4)]">
                                        <div className="w-full h-full rounded-full bg-[#1c242d] flex items-center justify-center overflow-hidden">
                                            <UserIcon size={40} className="text-yellow-500" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full">1</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-white truncate w-24">{topThree[0].username || 'Игрок'}</p>
                                    <p className="text-xs text-yellow-500 font-black">{topThree[0].points} BP</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-2 w-24"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-orange-700 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(194,65,12,0.3)]">
                                        <div className="w-full h-full rounded-full bg-[#1c242d] flex items-center justify-center overflow-hidden">
                                            <UserIcon size={32} className="text-orange-700" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-orange-100 text-[10px] font-black px-2 py-0.5 rounded-full">3</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white truncate w-20">{topThree[2].username || 'Игрок'}</p>
                                    <p className="text-[10px] text-orange-700 font-black">{topThree[2].points} BP</p>
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
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                key={user.id}
                                className={`dota-card p-4 flex items-center gap-4 transition-colors ${isMe ? 'border-l-4 border-l-[var(--accent)] bg-[var(--accent)]/5' : 'bg-white/[0.02]'}`}
                            >
                                <span className={`text-sm font-black w-6 text-center ${index < 7 ? 'text-[var(--primary)]' : 'text-gray-600'}`}>
                                    {index + 4}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <UserIcon size={20} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate flex items-center gap-2">
                                        {user.username || 'Игрок'}
                                        {isMe && <span className="text-[8px] bg-[var(--accent)] text-black px-1 rounded font-black uppercase">Вы</span>}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase">
                                            <Package size={10} /> {user._count.inventory} предметов
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-[var(--accent)]">{user.points}</p>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Balance</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
