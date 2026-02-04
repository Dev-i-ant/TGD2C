'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Users, Search, Edit2, Wallet, Package, History } from 'lucide-react';
import { getAllUsers, updateUserPoints } from './actions';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
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

    return (
        <div className="pb-24">
            <PageHeader title="Пользователи" backPath="/admin" />

            <div className="p-6 flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск по ID или Username..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 outline-none transition-all placeholder:text-gray-600"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl" />
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
                                className="dota-card p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <Users size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm">
                                            {user.username || 'Без имени'}
                                            <span className="ml-2 text-[10px] text-gray-600 font-mono">#{user.telegramId}</span>
                                        </span>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] text-yellow-500/80 font-black flex items-center gap-1 uppercase">
                                                <Wallet size={10} /> {user.points} BP
                                            </span>
                                            <span className="text-[9px] text-blue-500/80 font-black flex items-center gap-1 uppercase">
                                                <Package size={10} /> {user._count.inventory}
                                            </span>
                                            <span className="text-[9px] text-gray-500 font-black flex items-center gap-1 uppercase">
                                                <History size={10} /> {user._count.transactions}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUpdatePoints(user.id, user.points)}
                                    className="p-2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
