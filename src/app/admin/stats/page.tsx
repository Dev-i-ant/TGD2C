'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { BarChart3, Users, Wallet, Package, TrendingUp } from 'lucide-react';
// Server action for fetching stats
import { getAdminStats } from './actions';

export default function AdminStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getAdminStats();
            setStats(data);
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="Статистика" backPath="/admin" isAdmin />
                <div className="p-6 grid grid-cols-2 gap-2 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 steam-bevel" />
                    ))}
                </div>
            </div>
        );
    }

    const cards = [
        { label: 'Всего игроков', value: stats?.userCount || 0, icon: Users, color: 'text-blue-500' },
        { label: 'Всего BP в системе', value: stats?.totalPoints || 0, icon: Wallet, color: 'text-yellow-500' },
        { label: 'Предметов у игроков', value: stats?.rewardCount || 0, icon: Package, color: 'text-purple-500' },
        { label: 'Всего транзакций', value: stats?.transactionCount || 0, icon: TrendingUp, color: 'text-green-500' },
    ];

    return (
        <div className="pb-24">
            <PageHeader title="Статистика" backPath="/admin" isAdmin />

            <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-2">
                    {cards.map((card, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={card.label}
                            className="steam-emboss p-4 flex flex-col items-center justify-center text-center gap-2"
                        >
                            <card.icon className={`${card.color} opacity-40`} size={20} />
                            <span className="text-xl font-black text-[var(--foreground)]">{card.value.toLocaleString()}</span>
                            <span className="steam-header-text text-[8px] text-[var(--foreground)]/40">{card.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="steam-bevel p-4 border-dashed bg-black/5 flex flex-col gap-2">
                    <h3 className="text-[var(--foreground)]/60 font-black uppercase text-[9px] tracking-[0.2em]">STATISTICS_ENGINE_LOG</h3>
                    <p className="text-[var(--foreground)]/30 text-[8px] leading-relaxed uppercase font-bold tracking-widest">
                        DATA_IS_FETCHED_DIRECTLY_FROM_REMOTE_SERVER_IN_REALTIME.
                    </p>
                </div>
            </div>
        </div>
    );
}
