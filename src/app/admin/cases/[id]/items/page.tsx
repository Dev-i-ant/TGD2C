'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useParams } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Package, Search, TrendingUp, Edit2, Save, X, ArrowUpDown, Wand2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RARITIES, RARITY_COLORS, getRarityColor, ECONOMY_CONFIG } from '@/lib/constants';
import { getCaseRewards, addReward, updateReward, deleteReward, getGlobalItems, addRewardFromLibrary, getCaseById, autoBalanceCase } from '@/app/admin/cases/actions';

export default function CaseItemsPage() {
    const { id } = useParams();
    const [caseData, setCaseData] = useState<any>(null);
    // List of rewards in this case
    const [rewards, setRewards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [rarity, setRarity] = useState('COMMON');
    const [weight, setWeight] = useState('100');
    const [sellPrice, setSellPrice] = useState('');
    const [image, setImage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [targetRtp, setTargetRtp] = useState('85');
    const [editingReward, setEditingReward] = useState<any>(null);
    const [isAutoWeight, setIsAutoWeight] = useState(true);

    // Sorting state
    const [sortBy, setSortBy] = useState<'rarity' | 'weight' | 'price' | 'name'>('weight');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Library Modal state
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [globalItems, setGlobalItems] = useState<any[]>([]);
    const [libSearch, setLibSearch] = useState('');
    const [libWeight, setLibWeight] = useState('100');

    useEffect(() => {
        fetchRewards();
        fetchCase();
    }, [id]);

    async function fetchRewards() {
        const data = await getCaseRewards(id as string);
        setRewards(data);
        setIsLoading(false);
    }

    async function fetchCase() {
        const data = await getCaseById(id as string);
        setCaseData(data);
    }

    const calculateRTP = () => {
        if (!caseData || caseData.price === 0 || rewards.length === 0) return 0;
        const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
        if (totalWeight === 0) return 0;

        const totalExpectedReturn = rewards.reduce((sum, r) => {
            const prob = r.weight / totalWeight;
            return sum + (r.sellPrice || 0) * prob;
        }, 0);

        return (totalExpectedReturn / caseData.price) * 100;
    };

    const handleAutoBalance = async () => {
        const target = parseFloat(targetRtp);
        if (isNaN(target) || target < 1 || target > 200) return alert('Введите корректный RTP (1-200%)');

        if (!confirm(`Автоматически пересчитать веса и цены всех предметов для RTP ~${target}%?`)) return;
        setIsSaving(true);
        const result = await autoBalanceCase(id as string, target);
        if (result.success) {
            await fetchRewards();
            alert(`Баланс кейса успешно оптимизирован под ${target}% RTP!`);
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const calculateWeightFromPrice = (price: string) => {
        const p = parseInt(price);
        if (isNaN(p) || p <= 0) return '100';
        return Math.max(1, Math.floor(10000 / p)).toString();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSellPrice(val);
        if (isAutoWeight) {
            setWeight(calculateWeightFromPrice(val));
        }
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWeight(e.target.value);
        setIsAutoWeight(false);
    };

    const toggleAutoWeight = () => {
        const next = !isAutoWeight;
        setIsAutoWeight(next);
        if (next) {
            setWeight(calculateWeightFromPrice(sellPrice));
        }
    };

    async function openLibrary() {
        setIsLibraryOpen(true);
        const data = await getGlobalItems();
        setGlobalItems(data);
    }

    const handleAdd = async () => {
        if (!name) return alert('Введите название предмета');
        setIsSaving(true);
        const result = await addReward(id as string, {
            name,
            rarity,
            weight: parseInt(weight),
            sellPrice: sellPrice ? parseInt(sellPrice) : null,
            image: image || null
        });

        if (result.success) {
            resetForm();
            fetchRewards();
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const handleEdit = (reward: any) => {
        setEditingReward(reward);
        setName(reward.name);
        setRarity(reward.rarity);
        setWeight(reward.weight.toString());
        setSellPrice(reward.sellPrice?.toString() || '');
        setImage(reward.image || '');
        setIsAutoWeight(false); // Manual mode when editing existing
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveEdit = async () => {
        if (!name || !editingReward) return;
        setIsSaving(true);
        const result = await updateReward(editingReward.id, id as string, {
            name,
            rarity,
            weight: parseInt(weight),
            sellPrice: sellPrice ? parseInt(sellPrice) : null,
            image: image || null
        });

        if (result.success) {
            resetForm();
            fetchRewards();
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const resetForm = () => {
        setEditingReward(null);
        setName('');
        setWeight('100');
        setSellPrice('');
        setImage('');
        setIsAutoWeight(true);
    };

    const handleAddFromLibrary = async (globalItem: any) => {
        setIsSaving(true);
        const result = await addRewardFromLibrary(id as string, globalItem.id, parseInt(libWeight));
        if (result.success) {
            fetchRewards();
            setIsLibraryOpen(false);
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const handleDelete = async (rewardId: string) => {
        if (confirm('Удалить этот предмет?')) {
            const result = await deleteReward(rewardId, id as string);
            if (result.success) {
                fetchRewards();
            } else {
                alert(result.error);
            }
        }
    };

    const sortedRewards = [...rewards].sort((a, b) => {
        // If sorting by weight (default/rarest first)
        if (sortBy === 'weight') {
            const rA = RARITIES.indexOf(a.rarity as any);
            const rB = RARITIES.indexOf(b.rarity as any);
            // Higher rarity rank first (Arcana > Immortal)
            if (rA !== rB) return sortOrder === 'asc' ? rB - rA : rA - rB;
            // Then lower weight first if rarity is same
            if (a.weight !== b.weight) return sortOrder === 'asc' ? a.weight - b.weight : b.weight - a.weight;
            return 0;
        }

        let valA, valB;
        if (sortBy === 'rarity') {
            valA = RARITIES.indexOf(a.rarity);
            valB = RARITIES.indexOf(b.rarity);
        } else if (sortBy === 'price') {
            valA = a.sellPrice || 0;
            valB = b.sellPrice || 0;
        } else {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredLibItems = globalItems.filter(item =>
        item.name.toLowerCase().includes(libSearch.toLowerCase())
    );

    return (
        <div className="pb-24">
            <PageHeader title="Содержимое кейса" backPath={`/admin/cases/${id}`} isAdmin />

            <div className="p-6 flex flex-col gap-8">
                {/* Economy Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="steam-bevel bg-white/5 p-4 flex flex-col gap-1 border border-white/5">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Текущий RTP</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${calculateRTP() > 95 ? 'text-red-500' : 'text-green-500'}`}>
                                {calculateRTP().toFixed(1)}%
                            </span>
                            <TrendingUp size={14} className="text-white/20" />
                        </div>
                        <p className="text-[7px] text-white/20 uppercase font-black tracking-tighter">На основе весов и цен</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <div className="flex-1 steam-bevel bg-white/5 p-2 flex flex-col gap-1 border border-white/5">
                                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Цель RTP (%)</span>
                                <input
                                    type="number"
                                    value={targetRtp}
                                    onChange={(e) => setTargetRtp(e.target.value)}
                                    className="bg-transparent text-sm font-black text-indigo-400 outline-none w-full"
                                />
                            </div>
                            <button
                                onClick={handleAutoBalance}
                                disabled={isSaving || rewards.length === 0}
                                className="steam-bevel h-full px-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 active:translate-y-[1px] hover:bg-indigo-500/20 transition-all disabled:opacity-30"
                            >
                                <Wand2 size={18} />
                            </button>
                        </div>
                        <span className="text-[7px] text-white/20 uppercase font-black tracking-tighter text-center">Пересчитать балланс цен и весов</span>
                    </div>
                </div>

                {/* Library Button */}
                <button
                    onClick={openLibrary}
                    className="steam-bevel h-14 flex items-center justify-center gap-3 bg-white/5 text-white active:translate-y-[1px] transition-none"
                >
                    <Package size={20} className="text-[var(--accent)]" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Выбрать из библиотеки</span>
                </button>

                {/* Form to add/edit item */}
                <div className={`dota-card p-6 border-dashed bg-transparent flex flex-col gap-4 transition-all ${editingReward ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            {editingReward ? 'Редактировать предмет' : 'Создать предмет в кейсе'}
                        </h3>
                        {editingReward && (
                            <button onClick={resetForm} className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                <X size={12} /> Отмена
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Название предмета</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Название предмета"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-[var(--accent)]/50 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Редкость</label>
                                <div className="relative">
                                    <select
                                        value={rarity}
                                        onChange={(e) => setRarity(e.target.value)}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-base focus:border-[var(--accent)]/50 outline-none appearance-none"
                                    >
                                        {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                        <Filter size={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Шанс (вес)</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={handleWeightChange}
                                        className={`w-full h-14 bg-white/5 border rounded-xl px-6 pr-12 text-white text-base outline-none focus:border-[var(--accent)]/50 transition-all ${isAutoWeight ? 'border-green-500/30' : 'border-white/10'}`}
                                    />
                                    <button
                                        onClick={toggleAutoWeight}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${isAutoWeight ? 'text-green-500' : 'text-white/20 hover:text-white/40'}`}
                                        title={isAutoWeight ? 'Авто-расчет включен' : 'Включить авто-расчет'}
                                    >
                                        <Wand2 size={16} />
                                    </button>
                                    {isAutoWeight && (
                                        <span className="absolute -top-2 left-4 px-1.5 py-0.5 bg-green-500 text-black text-[7px] font-black rounded-sm uppercase tracking-tighter pointer-events-none">
                                            AUTO
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Цена выкупа (BP)</label>
                            <input
                                type="number"
                                value={sellPrice}
                                onChange={handlePriceChange}
                                placeholder="Цена выкупа (опционально)"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-[var(--accent)]/50 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Картинка (URL)</label>
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://..."
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-[var(--accent)]/50 outline-none"
                            />
                        </div>

                        {editingReward ? (
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="steam-bevel h-14 flex items-center justify-center gap-2 mt-2 bg-green-600 text-white active:translate-y-[1px]"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Сохранить изменения</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleAdd}
                                disabled={isSaving}
                                className="steam-bevel h-16 flex items-center justify-center gap-2 mt-2 bg-[var(--accent)] text-white active:translate-y-[1px] shadow-lg shadow-black/20"
                            >
                                {isSaving ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus size={20} />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Добавить в кейс</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Sorting & Filters */}
                <div className="flex flex-col gap-4 px-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Список предметов ({rewards.length})</h3>
                        <TrendingUp size={14} className="text-white/20" />
                    </div>

                    <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'weight-asc', label: 'Редкие выше', icon: ArrowUpDown },
                            { id: 'weight-desc', label: 'Частые выше', icon: ArrowUpDown },
                            { id: 'price-desc', label: 'Цена (↓)', icon: TrendingUp },
                            { id: 'name-asc', label: 'А-Я', icon: Search },
                        ].map((option) => {
                            const isActive = `${sortBy}-${sortOrder}` === option.id ||
                                (option.id === 'rarity-desc' && sortBy === 'rarity') ||
                                (option.id === 'price-desc' && sortBy === 'price') ||
                                (option.id === 'name-asc' && sortBy === 'name');

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        const [b, o] = option.id.split('-') as [any, any];
                                        setSortBy(b);
                                        setSortOrder(o || 'desc');
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${isActive ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    <option.icon size={12} className={isActive ? 'text-black' : 'text-white/20'} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-20 bg-white/5 animate-pulse rounded-2xl" />
                ) : rewards.length === 0 ? (
                    <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
                        <Package size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Пусто</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {sortedRewards.map((reward) => (
                            <div
                                key={reward.id}
                                onClick={() => handleEdit(reward)}
                                className="steam-bevel p-3 flex flex-col gap-3 bg-white/[0.02] relative group overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:bg-white/[0.04]"
                            >
                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <div className="w-7 h-7 rounded-md bg-white/10 text-white/60 flex items-center justify-center border border-white/10">
                                        <Edit2 size={12} />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(reward.id);
                                        }}
                                        className="w-7 h-7 rounded-md bg-red-500/10 text-red-500/60 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all border border-red-500/20"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                <div className="aspect-square w-full rounded-lg bg-white/5 flex items-center justify-center steam-emboss relative">
                                    {reward.image ? (
                                        <img src={reward.image} alt={reward.name} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Package size={24} className="opacity-10" />
                                    )}
                                    <div className="absolute top-1 left-1">
                                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm ${getRarityColor(reward.rarity)}`}>
                                            {reward.rarity}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <h4 className="font-bold text-white text-[10px] uppercase tracking-tight truncate leading-tight">{reward.name}</h4>
                                    <div className="flex flex-col gap-0.5 mt-auto">
                                        <div className="flex items-center justify-between text-[8px] font-black uppercase text-white/40">
                                            <span>Шанс:</span>
                                            <span className="text-white/60">{reward.weight}</span>
                                        </div>
                                        {reward.sellPrice && (
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase">
                                                <span className="text-white/30">Выкуп:</span>
                                                <span className="text-green-500/60">{reward.sellPrice} BP</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex gap-3 text-gray-500 items-start">
                <TrendingUp size={20} className="shrink-0" />
                <p className="text-[10px] uppercase font-bold leading-relaxed">
                    Вес определяет вероятность выпадения. <br />
                    Шанс = (Вес предмета) / (Сумма всех весов в кейсе) * 100%
                </p>
            </div>
            {/* Library Modal */}
            <AnimatePresence>
                {isLibraryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md p-6 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Библиотека</h2>
                            <button onClick={() => setIsLibraryOpen(false)} className="text-white/40 uppercase text-[10px] font-black">Закрыть</button>
                        </div>

                        <div className="relative steam-emboss bg-white/5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                type="text"
                                placeholder="ПОИСК..."
                                value={libSearch}
                                onChange={e => setLibSearch(e.target.value)}
                                className="w-full bg-transparent py-4 pl-10 pr-4 text-white text-xs outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 steam-bevel bg-white/5">
                            <span className="text-[10px] font-black text-white/40 uppercase">Шанс (вес) для всех:</span>
                            <input
                                type="number"
                                value={libWeight}
                                onChange={e => setLibWeight(e.target.value)}
                                className="w-20 bg-black/20 border border-white/10 rounded h-8 px-2 text-xs text-white outline-none"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-2 no-scrollbar">
                            {filteredLibItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleAddFromLibrary(item)}
                                    className="steam-bevel p-3 flex items-center justify-between bg-white/5 hover:bg-white/10 text-left transition-none"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-white">{item.name}</span>
                                        <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                                    </div>
                                    <Plus size={14} className="text-white/20" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
