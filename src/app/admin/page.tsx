'use client';

import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Package, ClipboardList, Users, Settings, ChevronRight, BarChart3, LayoutDashboard, Activity, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { testMarketAccessAction } from '../actions/user';
import { useTranslation } from '@/components/LanguageProvider';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [isChecking, setIsChecking] = useState(false);
    const [marketStatus, setMarketStatus] = useState<{ success: boolean; money?: number; error?: string } | null>(null);

    const adminLinks = [
        { label: 'УПРАВЛЕНИЕ КЕЙСАМИ', sub: 'УПРАВЛЕНИЕ_ОБЪЕКТАМИ', icon: Package, path: '/admin/cases', color: 'text-red-500' },
        { label: 'БИБЛИОТЕКА ПРЕДМЕТОВ', sub: 'ЦЕНТРАЛЬНЫЙ_РЕПОЗИТОРИЙ', icon: Package, path: '/admin/items', color: 'text-orange-500' },
        { label: 'ПОЛЬЗОВАТЕЛИ', sub: 'БАЗА_ДАННЫХ_ИГРОКОВ', icon: Users, path: '/admin/users', color: 'text-green-500' },
        { label: 'СТАТИСТИКА', sub: 'АНАЛИТИКА_СИСТЕМЫ', icon: BarChart3, path: '/admin/stats', color: 'text-yellow-500' },
    ];

    const handleCheckMarket = async () => {
        setIsChecking(true);
        const tg = (window as any).Telegram?.WebApp;
        const result = await testMarketAccessAction(tg?.initDataUnsafe?.user?.id?.toString() || '');
        setMarketStatus(result as any);
        setIsChecking(false);
    };

    return (
        <div className="pb-24">
            <PageHeader title="Админ-панель" backPath="/profile" isAdmin />

            <div className="p-6 flex flex-col gap-6">
                {/* Market Health Check Card */}
                <div className="steam-bevel p-5 bg-black/20 flex flex-col gap-4 border-t-2 border-t-blue-500/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-blue-500" />
                            <span className="font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">МАРКЕТ_СТАТУС</span>
                        </div>
                        <button
                            onClick={handleCheckMarket}
                            disabled={isChecking}
                            className="text-[9px] font-black uppercase px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded border border-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isChecking ? <Loader2 className="animate-spin" size={12} /> : 'ПРОВЕРИТЬ'}
                        </button>
                    </div>

                    {marketStatus && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`p-3 rounded-lg border flex flex-col gap-2 ${marketStatus.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                        >
                            <div className="flex items-center gap-2">
                                {marketStatus.success ? (
                                    <CheckCircle2 size={14} className="text-green-500" />
                                ) : (
                                    <AlertTriangle size={14} className="text-red-500" />
                                )}
                                <span className={`font-black text-[10px] uppercase ${marketStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                                    {marketStatus.success ? 'ДОСТУП_РАЗРЕШЕН' : 'ОШИБКА_ДОСТУПА'}
                                </span>
                            </div>
                            {marketStatus.success ? (
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-[9px] font-bold text-[var(--foreground)]/40 uppercase">БАЛАНС_МАРКЕТА</span>
                                    <span className="text-sm font-black text-green-500">{(marketStatus.money || 0)} RUB</span>
                                </div>
                            ) : (
                                <p className="text-[9px] font-bold text-red-400 uppercase leading-relaxed">
                                    {marketStatus.error}
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>

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
