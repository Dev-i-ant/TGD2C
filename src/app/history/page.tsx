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

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="История" />
                <div className="p-6 flex flex-col gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title="История" />

            <div className="flex flex-col gap-4 p-6">
                {transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            className="dota-card p-4 flex items-center gap-4 bg-white/[0.02]"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tx.amount > 0
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                {tx.amount > 0 ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-sm uppercase tracking-tight truncate">{tx.description}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                    <Clock size={10} />
                                    <span>{new Date(tx.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className={`text-right font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                <span className="text-[9px] uppercase ml-1 opacity-50">BP</span>
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

                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3 text-gray-500">
                    <Info size={16} className="shrink-0" />
                    <p className="text-[9px] uppercase font-bold leading-relaxed">
                        Здесь отображаются все ваши операции с балансом BP: выигрыши, покупки и продажи предметов.
                    </p>
                </div>
            </div>
        </div>
    );
}
