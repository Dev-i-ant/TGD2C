'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Trash2, Package, Search, Filter, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlobalItems, addGlobalItem, updateGlobalItem, deleteGlobalItem } from '@/app/admin/cases/actions';

const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'MYTHICAL', 'LEGENDARY', 'ANCIENT', 'IMMORTAL', 'ARCANA'];
const RARITY_COLORS: Record<string, string> = {
    COMMON: 'text-gray-400',
    UNCOMMON: 'text-green-400',
    RARE: 'text-blue-400',
    MYTHICAL: 'text-purple-400',
    LEGENDARY: 'text-pink-500',
    ANCIENT: 'text-red-500',
    IMMORTAL: 'text-orange-500',
    ARCANA: 'text-green-300',
};

export default function GlobalItemsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRarity, setFilterRarity] = useState('ALL');

    // Form state
    const [name, setName] = useState('');
    const [rarity, setRarity] = useState('COMMON');
    const [sellPrice, setSellPrice] = useState('');
    const [image, setImage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        const data = await getGlobalItems();
        setItems(data);
        setIsLoading(false);
    }

    const handleAdd = async () => {
        if (!name) return alert('Введите название предмета');
        setIsSaving(true);
        const result = await addGlobalItem({
            name,
            rarity,
            sellPrice: sellPrice ? parseInt(sellPrice) : null,
            image: image || null
        });

        if (result.success) {
            setName('');
            setSellPrice('');
            setImage('');
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
        setImage(item.image || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        if (!name || !editingItem) return;
        setIsSaving(true);
        const result = await updateGlobalItem(editingItem.id, {
            name,
            rarity,
            sellPrice: sellPrice ? parseInt(sellPrice) : null,
            image: image || null
        });

        if (result.success) {
            setEditingItem(null);
            setName('');
            setSellPrice('');
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

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRarity = filterRarity === 'ALL' || item.rarity === filterRarity;
        return matchesSearch && matchesRarity;
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

                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Название предмета"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-[var(--accent)]/50"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={rarity}
                                onChange={(e) => setRarity(e.target.value)}
                                className="h-12 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white outline-none appearance-none"
                            >
                                {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <input
                                type="number"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                placeholder="Цена выкупа (BP)"
                                className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-[var(--accent)]/50"
                            />
                        </div>
                        <input
                            type="text"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="URL картинки (опционально)"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-[var(--accent)]/50"
                        />
                        {editingItem ? (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="steam-bevel h-12 flex items-center justify-center gap-2 mt-2 bg-green-600 text-white"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Сохранить изменения</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleAdd}
                                disabled={isSaving}
                                className="steam-bevel h-12 flex items-center justify-center gap-2 mt-2 bg-[var(--accent)] text-white"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Добавить в библиотеку</span>
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
                <div className="flex flex-col gap-3">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Библиотека ({filteredItems.length})</h3>

                    {isLoading ? (
                        <div className="h-20 bg-white/5 animate-pulse rounded-2xl" />
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
                            <Package size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Пусто</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredItems.map((item) => (
                                <div key={item.id} className="steam-bevel p-3 flex items-center gap-4 bg-white/[0.02]">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center steam-emboss">
                                        <Package size={20} className="opacity-20" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-xs uppercase tracking-tight">{item.name}</h4>
                                        <div className="flex items-center gap-3 text-[8px] font-black uppercase mt-1">
                                            <span className={RARITY_COLORS[item.rarity]}>{item.rarity}</span>
                                            {item.sellPrice && (
                                                <>
                                                    <span className="text-gray-700">•</span>
                                                    <span className="text-green-500/70">{item.sellPrice} BP</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="w-8 h-8 rounded-lg bg-white/5 text-white/40 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 active:scale-90 transition-transform"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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
