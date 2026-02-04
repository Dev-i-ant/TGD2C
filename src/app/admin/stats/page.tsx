'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { BarChart3, Users, Wallet, Package, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma'; // This won't work on client, need server action

// But wait, it's easier to create a small server action for this.
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
                <PageHeader title="Статистика" backPath="/admin" />
                <div className="p-6 grid grid-cols-2 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl" />
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
            <PageHeader title="Статистика" backPath="/admin" />

            <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    {cards.map((card, index) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            key={card.label}
                            className="dota-card p-6 flex flex-col items-center justify-center text-center gap-2"
                        >
                            <card.icon className={card.color} size={24} />
                            <span className="text-2xl font-black text-white">{card.value.toLocaleString()}</span>
                            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{card.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="dota-card p-6 bg-transparent border-dashed border-gray-800 flex flex-col gap-4">
                    <h3 className="text-white font-bold uppercase text-xs tracking-widest">Последние данные</h3>
                    <p className="text-gray-500 text-[10px] leading-relaxed uppercase font-bold">
                        Статистика обновляется в реальном времени на основе текущего состояния базы данных.
                    </p>
                </div>
            </div>
        </div>
    );
}
