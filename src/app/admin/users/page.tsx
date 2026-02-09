'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Users, Search, Edit2, Wallet, Package, History, Copy, Check, BadgePlus, Shield, ShieldAlert, ShieldCheck, UserPlus, UserMinus } from 'lucide-react';
import { getAllUsers, updateUserPoints, updateUserTitles, toggleAdminStatus, toggleWhitelistStatus } from './actions';
import { SUPER_ADMINS } from '@/lib/constants';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);


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

    async function handleToggleWhitelist(userId: string, currentStatus: boolean, username: string) {
        const action = currentStatus ? 'убрать из вайтлиста' : 'добавить в вайтлист';
        if (!confirm(`Вы уверены, что хотите ${action} пользователя ${username}?`)) return;

        const result = await toggleWhitelistStatus(userId, currentStatus);
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
                    <div className="flex flex-col gap-4">
                        {filteredUsers.map((user) => (
                            <motion.div
                                layout
                                key={user.id}
                                className="steam-bevel p-4 flex flex-col gap-4 bg-black/5"
                            >
                                {/* Header: Identity & Role */}
                                <div className="flex items-start justify-between border-b border-[var(--foreground)]/5 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 steam-emboss flex items-center justify-center text-[var(--foreground)]/20 bg-black/40">
                                            <Users size={20} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[var(--foreground)] font-black text-[13px] uppercase tracking-tighter">
                                                    {user.username || 'БЕЗ_ИМЕНИ'}
                                                </span>
                                                {user.isAdmin && (
                                                    <span className="text-[8px] steam-emboss bg-orange-500/10 text-orange-500 px-1.5 py-0.5 border-orange-500/20 uppercase font-black tracking-widest flex items-center gap-1">
                                                        <ShieldCheck size={10} /> ADMIN
                                                    </span>
                                                )}
                                                {user.isWhitelisted && !user.isAdmin && (
                                                    <span className="text-[8px] steam-emboss bg-blue-500/10 text-blue-500 px-1.5 py-0.5 border-blue-500/20 uppercase font-black tracking-widest flex items-center gap-1">
                                                        <Check size={10} /> WHITELIST
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleCopyId(user.telegramId)}
                                                className="flex items-center gap-1.5 text-[10px] text-[var(--foreground)]/40 font-mono hover:text-[var(--foreground)] transition-none uppercase"
                                            >
                                                ID: {user.telegramId}
                                                {copiedId === user.telegramId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Body: Stats & Titles */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 bg-black/20 p-2 steam-emboss">
                                        <div className="flex flex-col flex-1">
                                            <span className="text-[8px] text-[var(--foreground)]/30 uppercase font-black tracking-widest mb-0.5">БАЛАНС</span>
                                            <span className="text-[14px] text-[var(--accent)] font-black flex items-center gap-1.5 uppercase tracking-widest">
                                                <Wallet size={14} /> {user.points.toLocaleString()} BP
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-[var(--foreground)]/10" />
                                        <div className="flex flex-col flex-1">
                                            <span className="text-[8px] text-[var(--foreground)]/30 uppercase font-black tracking-widest mb-0.5">ИНВЕНТАРЬ</span>
                                            <span className="text-[14px] text-[var(--foreground)]/60 font-black flex items-center gap-1.5 uppercase tracking-widest">
                                                <Package size={14} /> {user._count.inventory} ПРЕДМ.
                                            </span>
                                        </div>
                                    </div>

                                    {user.titles && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.titles.split(',').map((t: string, i: number) => (
                                                <span key={i} className="text-[8px] steam-emboss bg-black/20 text-[var(--foreground)]/50 px-2 py-1 border-0 uppercase font-black tracking-wider">
                                                    {t.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer: Responsive Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-3 border-t border-[var(--foreground)]/5">
                                    {currentAdminId && SUPER_ADMINS.includes(currentAdminId) && (
                                        <>
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.isAdmin, user.username || user.telegramId)}
                                                className={`flex items-center justify-center gap-2 py-3 steam-bevel transition-none active:translate-y-[1px] ${user.isAdmin ? 'text-red-500 bg-red-500/5' : 'text-[var(--foreground)]/40'}`}
                                            >
                                                {user.isAdmin ? <ShieldAlert size={16} /> : <Shield size={16} />}
                                                <span className="text-[9px] font-black uppercase tracking-widest">АДМИН</span>
                                            </button>
                                            <button
                                                onClick={() => handleToggleWhitelist(user.id, user.isWhitelisted, user.username || user.telegramId)}
                                                className={`flex items-center justify-center gap-2 py-3 steam-bevel transition-none active:translate-y-[1px] ${user.isWhitelisted ? 'text-blue-500 bg-blue-500/5' : 'text-[var(--foreground)]/40'}`}
                                            >
                                                {user.isWhitelisted ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                                <span className="text-[9px] font-black uppercase tracking-widest">ДОСТУП</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleUpdateTitles(user.id, user.titles)}
                                        className="flex items-center justify-center gap-2 py-3 steam-bevel text-[var(--foreground)]/40 hover:text-[var(--accent)] active:translate-y-[1px] transition-none"
                                    >
                                        <BadgePlus size={16} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">ЗВАНИЯ</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdatePoints(user.id, user.points)}
                                        className="flex items-center justify-center gap-2 py-3 steam-bevel text-[var(--foreground)]/40 hover:text-[var(--foreground)] active:translate-y-[1px] transition-none"
                                    >
                                        <Edit2 size={16} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">BP</span>
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
