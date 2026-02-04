'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useRouter, useParams } from 'next/navigation';
import { Save, Package } from 'lucide-react';
import Link from 'next/link';
import { getCaseById, updateCase, deleteCase as deleteCaseAction } from '../actions';

export default function EditCasePage() {
    const router = useRouter();
    const { id } = useParams();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('0');
    const [rarity, setRarity] = useState('RARE');
    const [color, setColor] = useState('bg-blue-500');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchCase() {
            const c = await getCaseById(id as string);
            if (c) {
                setName(c.name);
                setPrice(c.price.toString());
                setRarity(c.rarity);
                setColor(c.color);
                setImageUrl(c.image || '');
                setIsLoading(false);
            } else {
                router.push('/admin/cases');
            }
        }
        fetchCase();
    }, [id]);

    const handleSave = async () => {
        if (!name) return alert('Введите название');
        setIsSaving(true);
        const result = await updateCase(id as string, {
            name,
            price: parseInt(price),
            rarity,
            color,
            image: imageUrl || null
        });
        if (result.success) {
            router.push('/admin/cases');
        } else {
            alert(result.error);
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Вы уверены, что хотите удалить этот кейс?')) {
            const result = await deleteCaseAction(id as string);
            if (result.success) {
                router.push('/admin/cases');
            } else {
                alert(result.error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="Загрузка..." backPath="/admin/cases" />
                <div className="p-6 flex flex-col gap-6 animate-pulse">
                    <div className="h-20 bg-white/5 rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-white/5 rounded-xl" />
                        <div className="h-20 bg-white/5 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title={`Редактирование: ${name}`} backPath="/admin/cases" />

            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Название кейса</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSaving}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-red-500/50 outline-none disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Картинка (URL)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={isSaving}
                        placeholder="https://example.com/case-image.png"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-red-500/50 outline-none disabled:opacity-50"
                    />
                    {imageUrl && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Цена (BP)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={isSaving}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-red-500/50 outline-none disabled:opacity-50"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Редкость</label>
                        <select
                            value={rarity}
                            onChange={(e) => setRarity(e.target.value)}
                            disabled={isSaving}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-base focus:border-red-500/50 outline-none appearance-none disabled:opacity-50"
                        >
                            <option value="COMMON">Common</option>
                            <option value="RARE">Rare</option>
                            <option value="MYTHICAL">Mythical</option>
                            <option value="LEGENDARY">Legendary</option>
                            <option value="IMMORTAL">Immortal</option>
                            <option value="ARCANA">Arcana</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Цвет темы</label>
                    <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
                        {['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-600', 'bg-pink-500', 'bg-rose-500'].map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                disabled={isSaving}
                                className={`w-8 h-8 rounded-lg ${c} ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b0e11]' : 'opacity-50 hover:opacity-75'} transition-opacity disabled:cursor-not-allowed`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`dota-button w-full h-16 flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 grayscale' : ''}`}
                    >
                        {isSaving ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                <span className="uppercase font-black tracking-widest">Сохранить изменения</span>
                            </>
                        )}
                    </button>

                    <Link
                        href={`/admin/cases/${id}/items`}
                        className="dota-card w-full h-14 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-white/10"
                    >
                        <Package size={18} className="text-gray-400" />
                        <span className="uppercase font-black text-xs tracking-widest text-white/80">Настроить содержимое (предметы)</span>
                    </Link>

                    <button
                        onClick={handleDelete}
                        disabled={isSaving}
                        className="w-full h-12 bg-transparent text-red-500 text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30 mt-2"
                    >
                        Удалить кейс
                    </button>
                </div>
            </div>
        </div>
    );
}
