'use client';

import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Package, ClipboardList, Users, Settings, ChevronRight, BarChart3, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const adminLinks = [
        { label: 'УПРАВЛЕНИЕ КЕЙСАМИ', sub: 'УПРАВЛЕНИЕ_ОБЪЕКТАМИ', icon: Package, path: '/admin/cases', color: 'text-red-500' },
        { label: 'БИБЛИОТЕКА ПРЕДМЕТОВ', sub: 'ЦЕНТРАЛЬНЫЙ_РЕПОЗИТОРИЙ', icon: Package, path: '/admin/items', color: 'text-orange-500' },
        { label: 'ПОЛЬЗОВАТЕЛИ', sub: 'БАЗА_ДАННЫХ_ИГРОКОВ', icon: Users, path: '/admin/users', color: 'text-green-500' },
        { label: 'СТАТИСТИКА', sub: 'АНАЛИТИКА_СИСТЕМЫ', icon: BarChart3, path: '/admin/stats', color: 'text-yellow-500' },
    ];

    return (
        <div className="pb-24">
            <PageHeader title="Админ-панель" backPath="/profile" isAdmin />

            <div className="p-6 flex flex-col gap-6">
                <div className="steam-bevel border-t-red-600 bg-[var(--background)] p-6 mb-2">
                    <h2 className="text-xs font-black text-[var(--foreground)] uppercase tracking-[0.2em]">ДОСТУП_АДМИНИСТРАТОРА</h2>
                    <p className="text-[9px] text-[var(--foreground)]/40 uppercase font-black mt-2 tracking-widest">МОДУЛЬ_ОБСЛУЖИВАНИЯ_СИСТЕМЫ_1.0</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {adminLinks.map((link, index) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className="steam-bevel p-3 flex items-center justify-between hover:bg-white/[0.02] transition-none group active:translate-y-[1px]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 steam-emboss flex items-center justify-center ${link.color} opacity-60`}>
                                    <link.icon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-[var(--foreground)] uppercase text-[11px] tracking-widest">{link.label}</span>
                                    <span className="font-black text-[var(--foreground)]/20 uppercase text-[8px] tracking-widest">{link.sub}</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-700 group-hover:text-[var(--foreground)]" />
                        </Link>
                    ))}
                </div>

                <div className="mt-8 steam-emboss p-6 flex flex-col items-center text-center gap-4 bg-[var(--background)]">
                    <Settings className="text-[var(--foreground)]/20" size={32} />
                    <div>
                        <p className="text-[var(--foreground)]/40 font-black uppercase text-[9px] tracking-[0.2em] leading-relaxed">
                            НЕСАНКЦИОНИРОВАННЫЙ_ДОСТУП_ЛОГИРУЕТСЯ.<br />ТОЛЬКО_ДЛЯ_ЗАЩИЩЕННОЙ_СРЕДЫ.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
