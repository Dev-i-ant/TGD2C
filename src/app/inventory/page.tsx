'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ExternalLink, TrendingUp, Wallet, Trash2 } from 'lucide-react';
import { getUserData, sellItemAction, withdrawItemAction, sellAllItemsAction } from '../actions/user';
import { useTranslation } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';

const RARITY_COLORS: Record<string, string> = {
    'COMMON': 'bg-gray-500',
    'UNCOMMON': 'bg-green-500',
    'RARE': 'bg-blue-400',
    'MYTHICAL': 'bg-purple-500',
    'LEGENDARY': 'bg-pink-500',
    'IMMORTAL': 'bg-orange-400',
    'ARCANA': 'bg-red-500',
};

export default function InventoryPage() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isSelling, setIsSelling] = useState(false);
    const [activeTab, setActiveTab] = useState<'IN_STOCK' | 'SOLD' | 'WITHDRAWN'>('IN_STOCK');
    const [showMassSellConfirm, setShowMassSellConfirm] = useState(false);

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

    const filteredItems = items.filter(item => item.status === activeTab);

    const handleSell = async (itemId: string) => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user || isSelling) return;

        setIsSelling(true);
        const result = await sellItemAction(tg.initDataUnsafe.user.id.toString(), itemId);
        if (result.success) {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'SOLD' } : i));
            setSelectedItem(null);
        } else {
            alert(result.error);
        }
        setIsSelling(false);
    };

    const handleWithdraw = async (itemId: string) => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) return;

        const result = await withdrawItemAction(tg.initDataUnsafe.user.id.toString(), itemId);
        if (result.success) {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'WITHDRAWN' } : i));
            setSelectedItem(null);
        } else {
            alert("Error withdrawing item");
        }
    };

    const handleMassSell = async () => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user || isSelling) return;

        setIsSelling(true);
        const result = await sellAllItemsAction(tg.initDataUnsafe.user.id.toString());
        if (result.success) {
            setItems(prev => prev.map(i => i.status === 'IN_STOCK' ? { ...i, status: 'SOLD' } : i));
            setShowMassSellConfirm(false);
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        } else {
            alert(result.error);
        }
        setIsSelling(false);
    };

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title={t.inventory.title} hideTitle />
                <div className="px-6 py-2 flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 flex-1 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
                <div className="p-6 grid grid-cols-2 gap-2 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 steam-bevel" />)}
                </div>
            </div>
        );
    }

    const inStockItems = items.filter(i => i.status === 'IN_STOCK');
    const totalSelectedValue = inStockItems.reduce((acc, item) => acc + (item.sellPrice !== null ? item.sellPrice : (Math.floor(item.weight / 2) || 10)), 0);

    return (
        <div className="pb-24">
            <PageHeader title={t.inventory.title} backPath="/profile" hideTitle />

            <div className="p-6 pb-32">
                {activeTab === 'IN_STOCK' && filteredItems.length > 0 && (
                    <button
                        onClick={() => setShowMassSellConfirm(true)}
                        className="w-full mb-6 steam-bevel h-12 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:translate-y-[1px] transition-none"
                    >
                        <TrendingUp size={14} />
                        {t.inventory.sell_all_button.toUpperCase()} ({filteredItems.length})
                    </button>
                )}

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map((item, index) => {
                            const price = item.sellPrice !== null ? item.sellPrice : (Math.floor(item.weight / 2) || 10);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => setSelectedItem(item)}
                                    className="steam-bevel p-2 flex flex-col gap-2 cursor-pointer active:translate-y-[1px] transition-none group relative overflow-hidden"
                                >
                                    <div className={`w-full aspect-square steam-emboss flex items-center justify-center relative`}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Package size={32} className="text-[var(--accent)]/10" />
                                        )}
                                        <div className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full m-2 ${RARITY_COLORS[item.rarity] || 'bg-gray-500'}`} />
                                    </div>
                                    <div>
                                        <p className="steam-header-text text-[var(--foreground)] leading-tight truncate text-[10px] font-bold uppercase">{item.name}</p>
                                        <p className={`steam-header-text text-[7px] font-black uppercase tracking-widest opacity-40 mt-0.5 ${(RARITY_COLORS[item.rarity] || 'bg-gray-500').replace('bg-', 'text-')}`}>{item.rarity}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-[var(--border)]">
                                        <span className="text-[9px] font-black text-[var(--accent)]">{price} {t.common.bp}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-[var(--accent)] blur-3xl rounded-full opacity-20"
                            />
                            <Package className="text-[var(--accent)] relative z-10 opacity-60" size={80} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col gap-2 px-10">
                            <p className="steam-header-text text-[var(--foreground)] text-[11px] uppercase font-black tracking-[0.15em] leading-tight">
                                {activeTab === 'IN_STOCK' ? (t.inventory as any).empty_in_stock_title :
                                    activeTab === 'SOLD' ? (t.inventory as any).empty_sold_title :
                                        (t.inventory as any).empty_withdrawn_title}
                            </p>
                            <p className="steam-header-text text-[8px] text-[var(--foreground)]/30 uppercase font-black tracking-widest leading-relaxed">
                                {activeTab === 'IN_STOCK' ? (t.inventory as any).empty_in_stock_desc :
                                    activeTab === 'SOLD' ? (t.inventory as any).empty_sold_desc :
                                        (t.inventory as any).empty_withdrawn_desc}
                            </p>
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
                            className="w-full max-w-sm steam-bevel p-6 flex flex-col gap-4 mx-4 mb-[calc(1rem+env(safe-area-inset-bottom))]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 steam-emboss flex items-center justify-center shrink-0">
                                    {selectedItem.image ? (
                                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Package size={40} className="text-[var(--accent)]/30" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`steam-header-text text-[8px] font-black uppercase tracking-widest ${(RARITY_COLORS[selectedItem.rarity] || 'bg-gray-500').replace('bg-', 'text-')} mb-1`}>{selectedItem.rarity}</p>
                                    <h2 className="steam-header-text text-sm text-[var(--foreground)] font-black uppercase leading-tight line-clamp-2">{selectedItem.name}</h2>
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="w-5 h-5 steam-emboss flex items-center justify-center">
                                            <Wallet size={10} className="text-[var(--accent)]" />
                                        </div>
                                        <span className="text-[var(--accent)] font-black text-sm">{selectedItem.sellPrice || Math.floor(selectedItem.weight / 2) || 10} {t.common.bp}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedItem.status === 'IN_STOCK' ? (
                                <div className="grid grid-cols-1 gap-2 mt-4">
                                    <button
                                        onClick={() => handleSell(selectedItem.id)}
                                        disabled={isSelling}
                                        className="steam-bevel h-14 bg-green-500/10 text-green-500 text-[11px] font-black uppercase tracking-[0.2em] active:translate-y-[1px] transition-none disabled:opacity-50"
                                    >
                                        {isSelling ? t.common.processing.toUpperCase() : `${t.inventory.sell_item.toUpperCase()} (+${selectedItem.sellPrice || Math.floor(selectedItem.weight / 2) || 10} ${t.common.bp})`}
                                    </button>
                                    <button
                                        onClick={() => handleWithdraw(selectedItem.id)}
                                        className="steam-bevel h-14 bg-[var(--background)] text-[var(--foreground)] text-[11px] font-black uppercase tracking-[0.2em] active:translate-y-[1px] transition-none"
                                    >
                                        {t.inventory.withdraw.toUpperCase()}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 steam-emboss bg-black/20 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                                        {selectedItem.status === 'SOLD' ? 'ПРЕДМЕТ ПРОДАН' : 'ПРЕДМЕТ ВЫВЕДЕН'}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="steam-bevel h-12 bg-[var(--background)] text-[var(--foreground)]/40 text-[10px] font-black uppercase tracking-[0.2em] active:translate-y-[1px] transition-none mt-2"
                            >
                                {t.common.close.toUpperCase()}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mass Sell Confirmation */}
            <AnimatePresence>
                {showMassSellConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="steam-bevel p-8 w-full max-w-sm flex flex-col gap-6 text-center"
                        >
                            <div className="w-16 h-16 steam-emboss flex items-center justify-center mx-auto text-green-500">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight">
                                    {t.inventory.mass_sell_confirm_title.toUpperCase()}
                                </h2>
                                <p className="text-xs text-[var(--foreground)]/40 mt-2 uppercase font-bold leading-relaxed">
                                    {t.inventory.mass_sell_confirm_desc.replace('{count}', inStockItems.length.toString())}
                                </p>
                                <div className="text-2xl font-black text-[var(--accent)] mt-4">
                                    {totalSelectedValue} {t.common.bp}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-4">
                                <button
                                    onClick={handleMassSell}
                                    disabled={isSelling}
                                    className="steam-bevel h-14 bg-green-500 text-white text-xs font-black uppercase tracking-widest active:translate-y-[1px] transition-none disabled:opacity-50"
                                >
                                    {t.inventory.sell_all_button.toUpperCase()}
                                </button>
                                <button
                                    onClick={() => setShowMassSellConfirm(false)}
                                    className="steam-bevel h-12 bg-transparent text-[var(--foreground)]/60 text-xs font-black uppercase tracking-widest active:translate-y-[1px] transition-none"
                                >
                                    {t.common.cancel.toUpperCase()}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Tabs Navigation */}
            <div className="fixed bottom-[calc(6.2rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-6">
                <div className={`${theme === 'dark'
                    ? 'bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                    : 'steam-bevel bg-[var(--background)] p-1.5 shadow-2xl'
                    } flex gap-1.5 max-w-sm mx-auto`}
                >
                    {[
                        { id: 'IN_STOCK', label: 'В наличии', icon: Package },
                        { id: 'SOLD', label: 'Продано', icon: TrendingUp },
                        { id: 'WITHDRAWN', label: 'Выведено', icon: ExternalLink }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                const tg = (window as any).Telegram?.WebApp;
                                if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
                            }}
                            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all duration-200 gap-1 relative overflow-hidden active:scale-95 active:translate-y-[1px] ${activeTab === tab.id
                                ? theme === 'dark'
                                    ? 'bg-red-500/10 text-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]'
                                    : 'steam-emboss bg-[var(--secondary)] text-[var(--accent)]'
                                : theme === 'dark'
                                    ? 'text-white/20 hover:text-white/40 active:bg-white/5'
                                    : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)] active:steam-emboss'
                                }`}
                        >
                            {activeTab === tab.id && theme === 'dark' && (
                                <motion.div
                                    layoutId="tab-active-glow"
                                    className="absolute inset-0 bg-red-500/5 blur-lg"
                                />
                            )}
                            <tab.icon size={theme === 'dark' ? 18 : 16} className="relative z-10" />
                            <span className={`${theme === 'dark'
                                ? 'text-[8px] font-black'
                                : 'steam-header-text text-[7px] font-black'
                                } uppercase tracking-[0.1em] relative z-10`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
