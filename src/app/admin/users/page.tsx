'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Users, Search, Edit2, Wallet, Package, History, Copy, Check, BadgePlus, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getAllUsers, updateUserPoints, updateUserTitles, toggleAdminStatus } from './actions';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

    const SUPER_ADMIN_ID = '1810988833';

    useEffect(() => {
        loadUsers();
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            setCurrentAdminId(window.Telegram.WebApp.initDataUnsafe?.user?.id?.toString() || null);
        }
    }, []);

    async function loadUsers() {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setIsLoading(false);
    }

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.telegramId.includes(searchTerm)
    );

    async function handleUpdatePoints(userId: string, currentPoints: number) {
        const newPointsStr = prompt('Введите новый баланс BP:', currentPoints.toString());
        if (newPointsStr === null) return;
        const newPoints = parseInt(newPointsStr);
        if (isNaN(newPoints)) return alert('Некорректное число');

        const result = await updateUserPoints(userId, newPoints);
        if (result.success) {
            loadUsers();
        } else {
            alert(result.error);
        }
    }

    async function handleUpdateTitles(userId: string, currentTitles: string = '') {
        const newTitles = prompt('Введите звания через запятую (напр. Pro Player, Collector):', currentTitles || '');
        if (newTitles === null) return;

        const result = await updateUserTitles(userId, newTitles);
        if (result.success) {
            loadUsers();
        } else {
            alert(result.error);
        }
    }

    async function handleToggleAdmin(userId: string, currentStatus: boolean, username: string) {
        const action = currentStatus ? 'снять' : 'назначить';
        if (!confirm(`Вы уверены, что хотите ${action} администраторские права пользователю ${username}?`)) return;

        const result = await toggleAdminStatus(userId, currentStatus);
        if (result.success) {
            loadUsers();
        } else {
            alert(result.error);
        }
    }

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="pb-24">
            <PageHeader title="Пользователи" backPath="/admin" isAdmin />

            <div className="p-6 flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative steam-emboss bg-black/10">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/20" size={16} />
                    <input
                        type="text"
                        placeholder="ПОИСК_ПО_ID_ИЛИ_ИМЕНИ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent py-3 pl-10 pr-4 text-[var(--foreground)] text-[11px] font-black uppercase tracking-widest focus:outline-none placeholder:text-[var(--foreground)]/10"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 steam-bevel" />
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={48} className="text-gray-800 mx-auto mb-4" />
                        <p className="text-gray-500 uppercase font-black text-xs">Пользователи не найдены</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredUsers.map((user) => (
                            <motion.div
                                layout
                                key={user.id}
                                className="steam-bevel p-2 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 steam-emboss flex items-center justify-center text-[var(--foreground)]/20">
                                        <Users size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[var(--foreground)] font-black text-[11px] uppercase tracking-tighter">
                                                {user.username || 'БЕЗ_ИМЕНИ'}
                                            </span>
                                            <button
                                                onClick={() => handleCopyId(user.telegramId)}
                                                className="flex items-center gap-1 text-[8px] text-[var(--foreground)]/30 font-mono hover:text-[var(--foreground)] transition-none uppercase"
                                            >
                                                #{user.telegramId}
                                                {copiedId === user.telegramId ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                            </button>
                                            {user.isAdmin && (
                                                <span className="text-[7px] steam-emboss bg-orange-500/10 text-orange-500 px-1 border-orange-500/20 uppercase font-black tracking-widest flex items-center gap-0.5">
                                                    <ShieldCheck size={8} /> ADMIN
                                                </span>
                                            )}
                                        </div>
                                        {user.titles && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {user.titles.split(',').map((t: string, i: number) => (
                                                    <span key={i} className="text-[7px] steam-emboss bg-black/5 text-[var(--foreground)]/40 px-1 border-0 uppercase font-black tracking-tighter">
                                                        {t.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[9px] text-[var(--accent)] font-black flex items-center gap-1 uppercase tracking-widest">
                                                <Wallet size={10} /> {user.points} BP
                                            </span>
                                            <span className="text-[9px] text-[var(--foreground)]/40 font-black flex items-center gap-1 uppercase tracking-widest">
                                                <Package size={10} /> {user._count.inventory}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {currentAdminId === SUPER_ADMIN_ID && (
                                        <button
                                            onClick={() => handleToggleAdmin(user.id, user.isAdmin, user.username || user.telegramId)}
                                            className={`w-8 h-8 steam-bevel flex items-center justify-center transition-none active:translate-y-[1px] ${user.isAdmin ? 'text-red-500 hover:text-red-400' : 'text-[var(--foreground)]/40 hover:text-green-500'}`}
                                            title={user.isAdmin ? "СНЯТЬ_АДМИНА" : "НАЗНАЧИТЬ_АДМИНА"}
                                        >
                                            {user.isAdmin ? <ShieldAlert size={14} /> : <Shield size={14} />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleUpdateTitles(user.id, user.titles)}
                                        className="w-8 h-8 steam-bevel flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--accent)] active:translate-y-[1px] transition-none"
                                        title="ИЗМЕНИТЬ_ЗВАНИЯ"
                                    >
                                        <BadgePlus size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleUpdatePoints(user.id, user.points)}
                                        className="w-8 h-8 steam-bevel flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] active:translate-y-[1px] transition-none"
                                        title="ИЗМЕНИТЬ_БАЛАНС"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
