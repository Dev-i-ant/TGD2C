'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import Link from 'next/link';
import { getCases } from '../admin/cases/actions';
import { getRarityRank, getRarityTextColor } from '@/lib/constants';

import { useTranslation } from '@/components/LanguageProvider';

export default function CasesPage() {
    const { t } = useTranslation();
    const [cases, setCases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            const data = await getCases();
            setCases(data);
            setIsLoading(false);
        };
        fetchCases();
    }, []);

    return (
        <div className="pb-24">
            <PageHeader title={t.cases.title} hideTitle />


            <div className="grid grid-cols-1 gap-4 p-6 pt-[calc(3rem+env(safe-area-inset-top))]">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
                    ))
                ) : cases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
                        <Package size={64} />
                        <p className="font-bold uppercase text-xs tracking-widest">{t.cases.available || 'КЕЙСЫ НЕ НАЙДЕНЫ'}</p>
                    </div>
                ) : (
                    cases.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="steam-bevel p-2"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 steam-emboss flex items-center justify-center overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Package className="text-[var(--accent)]/30" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${getRarityTextColor(item.rarity)}`}>{item.rarity}</div>
                                    <h3 className="font-bold text-sm text-[var(--foreground)] mb-2 uppercase tracking-tight">{item.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[var(--accent)] font-black text-sm">{item.price}</span>
                                            <span className="text-[8px] text-[var(--accent)]/50 font-black uppercase">{t.common.bp}</span>
                                        </div>
                                        <Link
                                            href={`/cases/${item.id}`}
                                            prefetch={true}
                                            className="steam-bevel bg-[var(--background)] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] active:translate-y-[1px] transition-none"
                                        >
                                            {t.common.open.toUpperCase()}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
