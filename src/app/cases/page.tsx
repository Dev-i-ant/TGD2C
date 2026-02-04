'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import Link from 'next/link';
import { getCases } from '../admin/cases/actions';

export default function CasesPage() {
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
            <PageHeader title="Магазин кейсов" />

            <div className="px-6 py-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Поиск кейсов..."
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white focus:border-red-500/50 outline-none transition-all"
                    />
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
                        <p className="font-bold uppercase text-xs tracking-widest">Кейсов пока нет</p>
                    </div>
                ) : (
                    cases.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            className={`dota-card p-1 bg-gradient-to-r ${item.color}/10 to-transparent border-white/5`}
                        >
                            <div className="bg-[#151a1f]/60 backdrop-blur-sm p-4 rounded-lg flex items-center gap-4">
                                <div className={`w-20 h-20 rounded-lg bg-gradient-to-t ${item.color}/40 to-transparent flex items-center justify-center border border-white/10 shadow-lg overflow-hidden`}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-white/80" size={40} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">{item.rarity}</div>
                                    <h3 className="font-bold text-lg text-white mb-2 leading-none">{item.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-red-500 font-black">{item.price}</span>
                                            <span className="text-[9px] text-red-500/50 font-black uppercase tracking-tighter">BP</span>
                                        </div>
                                        <Link
                                            href={`/cases/${item.id}`}
                                            prefetch={true}
                                            className="bg-red-600 hover:bg-red-700 active:scale-95 px-5 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center uppercase tracking-widest shadow-lg shadow-red-900/20"
                                        >
                                            Открыть
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
