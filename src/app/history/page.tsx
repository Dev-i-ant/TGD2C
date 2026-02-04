'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, Info } from 'lucide-react';
import { getUserData } from '../actions/user';

import { useTranslation } from '@/components/LanguageProvider';

export default function HistoryPage() {
    const { t } = useTranslation();
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
            .replace('Открытие кейса: ', t.history.case_open)
            .replace('Продажа предмета: ', t.history.item_sell)
            .replace('Бонус за приглашение игрока ', t.history.referral_bonus)
            .replace('Доход от реферала за кейс ', t.history.referral_income);
    };

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title={t.history.title} backPath="/profile" />
                <div className="p-4 flex flex-col gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 steam-bevel" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title={t.history.title} backPath="/profile" />

            <div className="flex flex-col gap-3 p-4">
                {(transactions || []).length > 0 ? (
                    transactions.map((tx, index) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="steam-bevel p-2 flex items-center gap-3"
                        >
                            <div className={`w-10 h-10 steam-emboss flex items-center justify-center shrink-0 ${tx.amount > 0
                                ? 'text-green-500/50'
                                : 'text-red-500/50'
                                }`}>
                                {tx.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--foreground)] text-[11px] leading-tight truncate uppercase tracking-tighter">
                                    {cleanDescription(tx.description)}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[8px] text-[var(--foreground)]/40 mt-1 uppercase font-black tracking-widest">
                                    <Clock size={8} className="opacity-70" />
                                    <span>{formatDate(tx.createdAt)}</span>
                                </div>
                            </div>
                            <div className={`text-right font-black text-xs tabular-nums ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                <span className="text-[8px] uppercase ml-1 opacity-50">{t.common.bp}</span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
                        <Clock size={48} />
                        <div className="uppercase font-black text-xs tracking-widest text-center">
                            {t.history.empty}
                        </div>
                    </div>
                )}

                <div className="mt-2 p-3 steam-emboss flex gap-3 text-[var(--foreground)]/40 bg-[var(--secondary)]">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[9px] uppercase font-bold leading-relaxed tracking-tight">
                        {t.history.log.toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
}
