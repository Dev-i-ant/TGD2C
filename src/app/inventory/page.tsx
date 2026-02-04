'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ExternalLink, TrendingUp, Wallet, Trash2 } from 'lucide-react';
import { getUserData, sellItemAction } from '../actions/user';
import { useTranslation } from '@/components/LanguageProvider';

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
    const { t } = useTranslation();
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
                <PageHeader title={t.inventory.title} />
                <div className="p-6 grid grid-cols-2 gap-2 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 steam-bevel" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title={t.inventory.title} />

            <div className="p-6">
                {items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedItem(item)}
                                className="steam-bevel p-2 flex flex-col gap-2 cursor-pointer active:translate-y-[1px] transition-none group relative overflow-hidden"
                            >
                                <div className={`w-full aspect-square steam-emboss flex items-center justify-center relative`}>
                                    <Package size={32} className="text-[var(--accent)]/10" />
                                </div>
                                <div>
                                    <p className="steam-header-text text-[var(--foreground)] leading-tight truncate">{item.name}</p>
                                    <p className={`steam-header-text text-[7px] ${(RARITY_COLORS[item.rarity] || 'bg-gray-500').replace('bg-', 'text-')}`}>{item.rarity}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-1 border-t border-[var(--border)]">
                                    <span className="text-[9px] font-black text-[var(--accent)]">{Math.floor(item.weight / 2) || 10} {t.common.bp}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                        <Package className="text-gray-600" size={64} />
                        <div>
                            <p className="steam-header-text text-[var(--foreground)]/60 text-xs text-center w-full">{t.inventory.empty_title}</p>
                            <p className="steam-header-text text-[10px] text-[var(--foreground)]/20 mt-1 text-center w-full">{t.inventory.empty_desc}</p>
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
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-sm steam-bevel p-6 flex flex-col gap-4 mx-4 mb-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 steam-emboss flex items-center justify-center">
                                    <Package size={40} className="text-[var(--accent)]/30" />
                                </div>
                                <div className="flex-1">
                                    <p className={`steam-header-text text-[9px] ${(RARITY_COLORS[selectedItem.rarity] || 'bg-gray-500').replace('bg-', 'text-')} mb-1`}>{selectedItem.rarity}</p>
                                    <h2 className="steam-header-text text-sm text-[var(--foreground)]">{selectedItem.name}</h2>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Wallet size={12} className="text-[var(--accent)]" />
                                        <span className="text-[var(--accent)] font-black text-sm">{Math.floor(selectedItem.weight / 2) || 10} {t.common.bp}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <button
                                    onClick={() => handleSell(selectedItem.id)}
                                    disabled={isSelling}
                                    className="steam-bevel h-12 bg-[var(--background)] text-green-500 text-[11px] font-black uppercase tracking-widest active:translate-y-[1px] transition-none disabled:opacity-50"
                                >
                                    {isSelling ? t.common.processing.toUpperCase() : `${t.inventory.sell_item.toUpperCase()} (+${Math.floor(selectedItem.weight / 2) || 10} ${t.common.bp})`}
                                </button>
                                <button
                                    className="steam-bevel h-12 bg-[var(--background)] text-[var(--foreground)] text-[11px] font-black uppercase tracking-widest active:translate-y-[1px] transition-none"
                                >
                                    {t.inventory.withdraw.toUpperCase()}
                                </button>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="steam-bevel h-10 bg-[var(--background)] text-[var(--foreground)]/60 text-[10px] font-black uppercase tracking-widest active:translate-y-[1px] transition-none"
                                >
                                    {t.common.close.toUpperCase()}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
