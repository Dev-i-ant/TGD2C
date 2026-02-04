'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import Link from 'next/link';
import { getCases } from '../admin/cases/actions';

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
            <PageHeader title={t.cases.title} />

            <div className="px-6 py-4">
                <div className="px-6 py-2">
                    <div className="relative steam-emboss p-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
                        <input
                            type="text"
                            placeholder={t.common.loading.toUpperCase() + "..."}
                            className="w-full h-8 bg-[var(--secondary)] pl-10 pr-4 text-[11px] font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--foreground)]/20 uppercase tracking-widest"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 pt-0">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
                    ))
                ) : cases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
                        <Package size={64} />
                        <p className="font-bold uppercase text-xs tracking-widest">{t.inventory.empty_title}</p>
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
                                <div className="w-20 h-20 steam-emboss p-1 flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[0.2]" />
                                    ) : (
                                        <Package className="text-[var(--accent)]/30" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[9px] text-[var(--foreground)]/40 font-black uppercase tracking-widest mb-0.5">{item.rarity}</div>
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
