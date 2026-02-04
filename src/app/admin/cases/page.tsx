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
            <PageHeader title="Управление кейсами" backPath="/admin" />

            <div className="p-6 flex flex-col gap-6">
                <Link
                    href="/admin/cases/new"
                    className="steam-bevel w-full h-14 flex items-center justify-center gap-2 uppercase font-black text-xs tracking-[0.2em] active:translate-y-[1px] transition-none"
                >
                    <Plus size={18} />
                    <span>CREATE_NEW_UNIT</span>
                </Link>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-black text-[var(--accent)] uppercase tracking-widest px-2">Текущие кейсы</h3>

                    {isLoading ? (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 w-full steam-bevel animate-pulse" />
                            ))}
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase">Кейсов пока нет</div>
                    ) : (
                        cases.map((c) => (
                            <div key={c.id} className="steam-bevel p-3 flex items-center gap-4">
                                <div className={`w-12 h-12 steam-emboss flex items-center justify-center`}>
                                    <Package size={20} className={c.color.replace('bg-', 'text-').replace('color-', 'text-')} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-[var(--foreground)] text-[11px] truncate uppercase tracking-tighter">{c.name}</h4>
                                    <div className="flex items-center gap-3 text-[8px] text-[var(--foreground)]/40 font-black uppercase mt-1 tracking-widest">
                                        <span>COST: {c.price} BP</span>
                                        <span className="w-1 h-1 bg-[var(--border)]" />
                                        <span>TYPE: {c.rarity}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Link
                                        href={`/admin/cases/${c.id}`}
                                        className="w-8 h-8 steam-bevel flex items-center justify-center hover:bg-[var(--secondary)] active:translate-y-[1px] transition-none"
                                    >
                                        <Edit2 size={14} className="text-[var(--foreground)]" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(c.id, c.name)}
                                        className="w-8 h-8 steam-bevel flex items-center justify-center text-red-500/50 hover:text-red-500 active:translate-y-[1px] transition-none"
                                    >
                                        <Trash2 size={14} />
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
