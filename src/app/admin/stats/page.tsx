'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { BarChart3, Users, Wallet, Package, TrendingUp, CheckCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
// Server action for fetching stats
import { getAdminStats, getSpendingChartData } from './actions';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function SpendingChart({ hours }: { hours: number }) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const res = await getSpendingChartData(hours);
            if (res.success) setData(res.data);
            setIsLoading(false);
        }
        load();
    }, [hours]);

    if (isLoading) {
        return <div className="h-[200px] w-full steam-bevel animate-pulse p-4" />;
    }

    return (
        <div className="h-[200px] w-full steam-bevel p-4 bg-black/20">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="#ffffff40"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#ffffff40"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: '10px' }}
                        itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="spent"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorSpent)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function AdminStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState(24);

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
                    {[1, 2, 3, 4, 5, 6].map(i => (
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
        { label: 'Выведено (успешно)', value: stats?.withdrawnCount || 0, icon: CheckCircle, color: 'text-blue-400' },
        { label: 'В ожидании (Market)', value: stats?.pendingCount || 0, icon: Clock, color: 'text-orange-500' },
        { label: 'Общая ценность вывода', value: stats?.totalWithdrawnValue || 0, icon: ShieldCheck, color: 'text-cyan-500' },
    ];

    const periods = [
        { label: '1Ч', value: 1 },
        { label: '6Ч', value: 6 },
        { label: '12Ч', value: 12 },
        { label: '24Ч', value: 24 },
    ];

    return (
        <div className="pb-24">
            <PageHeader title="Статистика" backPath="/admin" isAdmin />

            <div className="p-6 flex flex-col gap-6">
                {/* Spending Chart Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="text-blue-500" size={16} />
                            <h2 className="steam-header-text uppercase text-[10px] tracking-widest font-black">График трат BP</h2>
                        </div>
                        <div className="flex bg-black/40 p-0.5 steam-bevel border-none">
                            {periods.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setChartPeriod(p.value)}
                                    className={`px-3 py-1 text-[9px] font-black transition-all ${chartPeriod === p.value
                                            ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                            : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SpendingChart hours={chartPeriod} />
                </div>

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
