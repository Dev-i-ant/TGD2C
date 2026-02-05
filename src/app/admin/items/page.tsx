'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Trash2, Package, Search, Filter, Edit2, Save, X, Wand2, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlobalItems, addGlobalItem, updateGlobalItem, deleteGlobalItem } from '@/app/admin/cases/actions';

import { RARITIES, RARITY_COLORS, getRarityColor } from '@/lib/constants';

export default function GlobalItemsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRarity, setFilterRarity] = useState('ALL');

    // Form state
    const [name, setName] = useState('');
    const [rarity, setRarity] = useState('COMMON');
    const [sellPrice, setSellPrice] = useState('');
    const [defaultWeight, setDefaultWeight] = useState('100');
    const [image, setImage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoWeight, setIsAutoWeight] = useState(true);

    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        const data = await getGlobalItems();
        setItems(data);
        setIsLoading(false);
    }

    const calculateWeightFromPrice = (price: string) => {
        const p = parseInt(price);
        if (isNaN(p) || p <= 0) return '100';
        return Math.max(1, Math.floor(10000 / p)).toString();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSellPrice(val);
        if (isAutoWeight) {
            setDefaultWeight(calculateWeightFromPrice(val));
        }
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDefaultWeight(e.target.value);
        setIsAutoWeight(false);
    };

    const toggleAutoWeight = () => {
        const next = !isAutoWeight;
        setIsAutoWeight(next);
        if (next) {
            setDefaultWeight(calculateWeightFromPrice(sellPrice));
        }
    };

    const handleAdd = async () => {
        if (!name) return alert('Введите название предмета');
        setIsSaving(true);
        const result = await addGlobalItem({
            name,
            rarity,
            sellPrice: sellPrice ? parseInt(sellPrice) : null,
            defaultWeight: parseInt(defaultWeight) || 100,
            image: image || null
        });

        if (result.success) {
            setName('');
            setSellPrice('');
            setDefaultWeight('100');
            setImage('');
            setIsAutoWeight(true);
            fetchItems();
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setName(item.name);
        setRarity(item.rarity);
        setSellPrice(item.sellPrice?.toString() || '');
        setDefaultWeight(item.defaultWeight?.toString() || '100');
        setImage(item.image || '');
        setIsAutoWeight(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        if (!name || !editingItem) return;
        setIsSaving(true);
        const result = await updateGlobalItem(editingItem.id, {
            name,
            rarity,
            sellPrice: sellPrice ? parseInt(sellPrice) : null,
            defaultWeight: parseInt(defaultWeight) || 100,
            image: image || null
        });

        if (result.success) {
            setEditingItem(null);
            setName('');
            setSellPrice('');
            setDefaultWeight('100');
            setIsAutoWeight(true);
            setImage('');
            fetchItems();
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setName('');
        setSellPrice('');
        setDefaultWeight('100');
        setIsAutoWeight(true);
        setImage('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Удалить этот предмет из библиотеки?')) {
            const result = await deleteGlobalItem(id);
            if (result.success) {
                fetchItems();
            } else {
                alert(result.error);
            }
        }
    };

    const sortedItems = [...items]
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRarity = filterRarity === 'ALL' || item.rarity === filterRarity;
            return matchesSearch && matchesRarity;
        })
        .sort((a, b) => {
            // Rare first: index Arcana (7) > Common (0)
            const rA = RARITIES.indexOf(a.rarity as any);
            const rB = RARITIES.indexOf(b.rarity as any);
            if (rA !== rB) return rB - rA;
            return a.defaultWeight - b.defaultWeight;
        });

    return (
        <div className="pb-24">
            <PageHeader title="Библиотека предметов" backPath="/admin" isAdmin />

            <div className="p-6 flex flex-col gap-8">
                {/* Form to add/edit item */}
                <div className={`dota-card p-6 border-dashed bg-transparent flex flex-col gap-4 transition-all ${editingItem ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            {editingItem ? 'Редактировать предмет' : 'Создать шаблон предмета'}
                        </h3>
                        {editingItem && (
                            <button onClick={handleCancel} className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
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
                                placeholder="Например: Dragonclaw Hook"
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
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Вес (шанс)</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={defaultWeight}
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
                                placeholder="Влияет на авто-расчёт шанса"
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

                        {editingItem ? (
                            <button
                                onClick={handleSave}
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
                                        <span className="text-[11px] font-black uppercase tracking-widest">Добавить в библиотеку</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-3">
                    <div className="relative steam-emboss bg-black/10">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input
                            type="text"
                            placeholder="ПОИСК_В_БИБЛИОТЕКЕ..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent py-3 pl-10 pr-4 text-white text-[11px] font-black uppercase tracking-widest focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setFilterRarity('ALL')}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterRarity === 'ALL' ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}
                        >
                            ВСЕ
                        </button>
                        {RARITIES.map(r => (
                            <button
                                key={r}
                                onClick={() => setFilterRarity(r)}
                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterRarity === r ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Шаблоны ({sortedItems.length})</h3>
                        <div className="flex items-center gap-1 opacity-20">
                            <ArrowUpDown size={10} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Сначала редкие</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-20 bg-white/5 animate-pulse rounded-2xl" />
                    ) : sortedItems.length === 0 ? (
                        <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
                            <Package size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Пусто</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {sortedItems.map((item) => (
                                <div key={item.id} className="steam-bevel p-3 flex flex-col gap-3 bg-white/[0.02] relative group overflow-hidden">
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="w-7 h-7 rounded-md bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all border border-white/10"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="w-7 h-7 rounded-md bg-red-500/10 text-red-500/60 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all border border-red-500/20"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    <div className="aspect-square w-full rounded-lg bg-white/5 flex items-center justify-center steam-emboss relative">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Package size={24} className="opacity-10" />
                                        )}
                                        <div className="absolute top-1 left-1">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm ${getRarityColor(item.rarity)}`}>
                                                {item.rarity}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1">
                                        <h4 className="font-bold text-white text-[10px] uppercase tracking-tight truncate leading-tight">{item.name}</h4>
                                        <div className="flex flex-col gap-0.5 mt-auto">
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase text-white/40">
                                                <span>Вес:</span>
                                                <span className="text-white/60">{item.defaultWeight}</span>
                                            </div>
                                            {item.sellPrice && (
                                                <div className="flex items-center justify-between text-[8px] font-black uppercase">
                                                    <span className="text-white/30">Выкуп:</span>
                                                    <span className="text-green-500/60">{item.sellPrice} BP</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
