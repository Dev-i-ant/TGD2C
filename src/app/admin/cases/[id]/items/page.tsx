'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Package, TrendingUp } from 'lucide-react';
import { getCaseRewards, addReward, deleteReward } from '../../actions';

const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'MYTHICAL', 'LEGENDARY', 'IMMORTAL', 'ARCANA'];
const RARITY_COLORS: Record<string, string> = {
    'COMMON': 'text-gray-400',
    'UNCOMMON': 'text-green-500',
    'RARE': 'text-blue-500',
    'MYTHICAL': 'text-indigo-500',
    'LEGENDARY': 'text-pink-500',
    'IMMORTAL': 'text-orange-500',
    'ARCANA': 'text-purple-500',
};

export default function CaseItemsPage() {
    const { id } = useParams();
    const [rewards, setRewards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [rarity, setRarity] = useState('COMMON');
    const [weight, setWeight] = useState('100');
    const [image, setImage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRewards();
    }, [id]);

    async function fetchRewards() {
        const data = await getCaseRewards(id as string);
        setRewards(data);
        setIsLoading(false);
    }

    const handleAdd = async () => {
        if (!name) return alert('Введите название предмета');
        setIsSaving(true);
        const result = await addReward(id as string, {
            name,
            rarity,
            weight: parseInt(weight),
            image: image || null
        });

        if (result.success) {
            setName('');
            setImage('');
            fetchRewards();
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

    return (
        <div className="pb-24">
            <PageHeader title="Содержимое кейса" />

            <div className="p-6 flex flex-col gap-8">
                {/* Form to add item */}
                <div className="dota-card p-6 border-dashed border-white/10 bg-transparent flex flex-col gap-4">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Добавить предмет</h3>

                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Название предмета"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-red-500/50"
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
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Шанс (вес)"
                                className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-red-500/50"
                            />
                        </div>
                        <input
                            type="text"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="URL картинки (опционально)"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-red-500/50"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isSaving}
                            className="dota-button h-12 flex items-center justify-center gap-2 mt-2"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Добавить в кейс</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Список предметов ({rewards.length})</h3>

                    {isLoading ? (
                        <div className="h-20 bg-white/5 animate-pulse rounded-2xl" />
                    ) : rewards.length === 0 ? (
                        <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
                            <Package size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Пусто</p>
                        </div>
                    ) : (
                        rewards.map((reward) => (
                            <div key={reward.id} className="dota-card p-4 flex items-center gap-4 bg-white/[0.02]">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Package size={24} className="opacity-20" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm uppercase tracking-tight">{reward.name}</h4>
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase mt-1">
                                        <span className={RARITY_COLORS[reward.rarity]}>{reward.rarity}</span>
                                        <span className="text-gray-700">•</span>
                                        <span className="text-gray-500">Вес: {reward.weight}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(reward.id)}
                                    className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 active:scale-90 transition-transform"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
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
            </div>
        </div>
    );
}
