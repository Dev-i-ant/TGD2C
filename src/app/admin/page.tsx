'use client';

import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Package, ClipboardList, Users, Settings, ChevronRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const adminLinks = [
        { label: 'Управление кейсами', icon: Package, path: '/admin/cases', color: 'text-red-500' },
        { label: 'Список заданий', icon: ClipboardList, path: '/admin/tasks', color: 'text-blue-500' },
        { label: 'Пользователи', icon: Users, path: '/admin/users', color: 'text-green-500' },
        { label: 'Статистика', icon: BarChart3, path: '/admin/stats', color: 'text-yellow-500' },
    ];

    return (
        <div className="pb-24">
            <PageHeader title="Админ-панель" />

            <div className="p-6 flex flex-col gap-4">
                <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 mb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Панель управления</h2>
                    <p className="text-xs text-gray-500 uppercase font-bold mt-1">Здесь вы можете настраивать контент приложения</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {adminLinks.map((link, index) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-all group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${link.color}`}>
                                    <link.icon size={24} />
                                </div>
                                <span className="font-bold text-white uppercase text-sm tracking-tight">{link.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-700 group-hover:text-white transition-colors" />
                        </Link>
                    ))}
                </div>

                <div className="mt-8 dota-card p-6 border-dashed border-gray-800 bg-transparent flex flex-col items-center text-center gap-4">
                    <Settings className="text-gray-700" size={32} />
                    <div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                            Доступ ограничен.<br />Только для авторизованных администраторов.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
