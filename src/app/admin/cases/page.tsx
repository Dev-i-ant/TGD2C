'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { getCases, deleteCase } from './actions';

export default function AdminCases() {
    const [cases, setCases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCases();
    }, []);

    async function fetchCases() {
        const data = await getCases();
        setCases(data);
        setIsLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (confirm(`Вы уверены, что хотите удалить кейс "${name}"?`)) {
            const result = await deleteCase(id);
            if (result.success) {
                fetchCases();
            } else {
                alert(result.error);
            }
        }
    }

    return (
        <div className="pb-24">
            <PageHeader title="Кейсы (Админ)" />

            <div className="p-6 flex flex-col gap-6">
                <Link
                    href="/admin/cases/new"
                    className="dota-button w-full h-14 flex items-center justify-center gap-2 uppercase font-black text-sm tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                    <Plus size={20} />
                    <span>Создать новый кейс</span>
                </Link>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Текущие кейсы</h3>

                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase">Кейсов пока нет</div>
                    ) : (
                        cases.map((c) => (
                            <div key={c.id} className="dota-card p-4 flex items-center gap-4 bg-white/[0.02]">
                                <div className={`w-14 h-14 rounded-lg ${c.color}/20 border border-white/5 flex items-center justify-center`}>
                                    <Package size={24} className={c.color.replace('bg-', 'text-')} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white text-sm truncate uppercase tracking-tight">{c.name}</h4>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase mt-1">
                                        <span>{c.price} BP</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-800" />
                                        <span>{c.rarity}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/cases/${c.id}`}
                                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:text-blue-500 transition-colors border border-white/5"
                                    >
                                        <Edit2 size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(c.id, c.name)}
                                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
