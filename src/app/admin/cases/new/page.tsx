'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useRouter } from 'next/navigation';
import { Plus, Copy, X, Check } from 'lucide-react';
import { createCase } from '../actions';

export default function NewCasePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('100');
    const [rarity, setRarity] = useState('RARE');
    const [color, setColor] = useState('bg-blue-500');
    const [imageUrl, setImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSave = async () => {
        if (!name) return alert('Введите название');
        setIsSaving(true);
        setError(null);

        const result = await createCase({
            name,
            price: parseInt(price),
            rarity,
            color,
            image: imageUrl || null
        });

        if (result.success) {
            router.push('/admin/cases');
        } else {
            console.error('Create case error:', result.error);
            setError(result.error || 'Неизвестная ошибка');
            setIsSaving(false);
        }
    };

    const copyError = async () => {
        if (error) {
            await navigator.clipboard.writeText(error);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="pb-24">
            <PageHeader title="Новый кейс" />

            {/* Error Modal */}
            {error && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6" onClick={() => setError(null)}>
                    <div className="bg-[#1a1f24] rounded-2xl p-6 max-w-md w-full border border-red-500/30" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-red-500 font-bold uppercase text-sm tracking-wider">Ошибка</h3>
                            <button onClick={() => setError(null)} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 mb-4 max-h-60 overflow-auto">
                            <code className="text-xs text-white/80 break-all whitespace-pre-wrap">{error}</code>
                        </div>
                        <button
                            onClick={copyError}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Скопировано!' : 'Скопировать ошибку'}
                        </button>
                    </div>
                </div>
            )}

            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Название кейса</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Напр: Immortal Treasure 2024"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-red-500/50 outline-none"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Картинка (URL)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/case-image.png"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-red-500/50 outline-none"
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
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-base focus:border-red-500/50 outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Редкость</label>
                        <select
                            value={rarity}
                            onChange={(e) => setRarity(e.target.value)}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-base focus:border-red-500/50 outline-none appearance-none"
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
                                className={`w-8 h-8 rounded-lg ${c} ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b0e11]' : 'opacity-50 hover:opacity-75'} transition-opacity`}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`dota-button w-full h-16 flex items-center justify-center gap-2 mt-4 ${isSaving ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                    {isSaving ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Plus size={20} />
                            <span className="uppercase font-black tracking-widest">Создать кейс</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
