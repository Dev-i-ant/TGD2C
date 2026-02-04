'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, Info } from 'lucide-react';
import { getUserData } from '../actions/user';

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    const data = await getUserData(user.id.toString());
                    if (data) {
                        setTransactions(data.transactions);
                    }
                }
            }
            setIsLoading(false);
        }
        fetchHistory();
    }, []);

    const formatDate = (date: string) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${day}.${month} · ${hours}:${minutes}`;
    };

    const cleanDescription = (desc: string) => {
        return desc
            .replace('Открытие кейса: ', 'Кейс: ')
            .replace('Продажа предмета: ', 'Продажа: ')
            .replace('Бонус за приглашение игрока ', 'Бонус: ')
            .replace('Доход от реферала за кейс ', 'Доход: ');
    };

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="История" backPath="/profile" />
                <div className="p-4 flex flex-col gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title="История" backPath="/profile" />

            <div className="flex flex-col gap-3 p-4">
                {(transactions || []).length > 0 ? (
                    transactions.map((tx, index) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            className="dota-card p-3 flex items-center gap-3 bg-white/[0.02] border-white/5"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${tx.amount > 0
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-[13px] leading-tight truncate">
                                    {cleanDescription(tx.description)}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                                    <Clock size={8} className="opacity-70" />
                                    <span>{formatDate(tx.createdAt)}</span>
                                </div>
                            </div>
                            <div className={`text-right font-black text-sm tabular-nums ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                <span className="text-[8px] uppercase ml-1 opacity-50">BP</span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
                        <Clock size={48} />
                        <div className="uppercase font-black text-xs tracking-widest text-center">
                            История пуста
                        </div>
                    </div>
                )}

                <div className="mt-2 p-3 bg-white/[0.03] rounded-lg border border-white/5 flex gap-3 text-gray-500">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[9px] uppercase font-bold leading-relaxed tracking-tight">
                        Здесь отображаются все изменения вашего баланса: выигрыши, покупки и доход от друзей.
                    </p>
                </div>
            </div>
        </div>
    );
}
