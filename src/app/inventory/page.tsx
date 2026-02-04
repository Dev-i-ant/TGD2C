'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ExternalLink, TrendingUp, DollarSign, Trash2 } from 'lucide-react';
import { getUserData, sellItemAction } from '../actions/user';

const RARITY_COLORS: Record<string, string> = {
    'COMMON': 'bg-gray-500',
    'UNCOMMON': 'bg-green-500',
    'RARE': 'bg-blue-500',
    'MYTHICAL': 'bg-indigo-600',
    'LEGENDARY': 'bg-pink-600',
    'IMMORTAL': 'bg-orange-500',
    'ARCANA': 'bg-purple-600',
};

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isSelling, setIsSelling] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    async function fetchInventory() {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe?.user;
            if (user) {
                const data = await getUserData(user.id.toString());
                if (data) setItems(data.inventory);
            }
        }
        setIsLoading(false);
    }

    const handleSell = async (itemId: string) => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user || isSelling) return;

        setIsSelling(true);
        const result = await sellItemAction(tg.initDataUnsafe.user.id.toString(), itemId);
        if (result.success) {
            setItems(prev => prev.filter(i => i.id !== itemId));
            setSelectedItem(null);
        } else {
            alert(result.error);
        }
        setIsSelling(false);
    };

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="Инвентарь" />
                <div className="p-6 grid grid-cols-2 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title="Инвентарь" />

            <div className="p-6">
                {items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03, duration: 0.2 }}
                                onClick={() => setSelectedItem(item)}
                                className="dota-card p-3 flex flex-col gap-3 bg-white/[0.02] cursor-pointer active:scale-95 transition-transform group relative overflow-hidden"
                            >
                                <div className={`w-full aspect-square rounded-lg ${RARITY_COLORS[item.rarity] || 'bg-gray-500'}/20 flex items-center justify-center relative`}>
                                    <Package size={48} className="text-white/20 group-hover:text-white/40 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white leading-tight uppercase truncate">{item.name}</p>
                                    <p className={`text-[8px] font-bold ${(RARITY_COLORS[item.rarity] || 'bg-gray-500').replace('bg-', 'text-')} uppercase`}>{item.rarity}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                    <span className="text-[10px] font-black text-red-500">{Math.floor(item.weight / 2) || 10} BP</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                        <Package className="text-gray-600" size={64} />
                        <div>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Инвентрарь пуст</p>
                            <p className="text-[10px] text-gray-700 uppercase mt-1">Открой свой первый кейс!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Item Action Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-end justify-center backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-[#151a1f] border-t border-white/10 rounded-t-[2rem] p-8 flex flex-col gap-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-24 h-24 rounded-2xl ${RARITY_COLORS[selectedItem.rarity] || 'bg-gray-500'}/20 border border-white/5 flex items-center justify-center shadow-lg`}>
                                    <Package size={48} className="text-white/40" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-black ${(RARITY_COLORS[selectedItem.rarity] || 'bg-gray-500').replace('bg-', 'text-')} uppercase tracking-widest mb-1`}>{selectedItem.rarity}</p>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedItem.name}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <DollarSign size={14} className="text-red-500" />
                                        <span className="text-red-500 font-black text-lg">{Math.floor(selectedItem.weight / 2) || 10} BP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mt-4">
                                <button
                                    onClick={() => handleSell(selectedItem.id)}
                                    disabled={isSelling}
                                    className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between px-6 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={20} className="text-green-500" />
                                        <span className="font-bold text-white uppercase text-sm">Продать</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isSelling ? (
                                            <div className="w-5 h-5 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                                        ) : (
                                            <span className="text-green-500 font-black">+{Math.floor(selectedItem.weight / 2) || 10} BP</span>
                                        )}
                                    </div>
                                </button>

                                <button
                                    className="w-full h-14 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 mt-2"
                                >
                                    <ExternalLink size={20} className="text-white" />
                                    <span className="font-black text-white uppercase text-sm">Вывести в Steam</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-full py-4 text-gray-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
                            >
                                Отмена
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
