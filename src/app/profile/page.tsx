'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Wallet, Package, Trophy, Settings, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserData } from '../actions/user';

export default function ProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState('Игрок');
    const [tgHandle, setTgHandle] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    setFullName(`${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`);
                    setPhotoUrl(user.photo_url || null);
                    setTgHandle(user.username || null);
                    const data = await getUserData(user.id.toString());
                    setUserData(data);
                }
            }
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="Профиль" />
                <div className="p-6 flex flex-col gap-6 animate-pulse">
                    <div className="h-48 bg-white/5 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-2xl" />
                        <div className="h-24 bg-white/5 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <PageHeader title="Профиль" />

            <div className="p-6 flex flex-col gap-6">
                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="dota-card p-6 flex flex-col items-center text-center gap-4 border-t-2 border-t-red-600"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-red-400 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <div className="w-full h-full rounded-full bg-[#151a1f] flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <Trophy size={48} className="text-red-500" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">{fullName}</h2>
                        {(tgHandle || (userData?.username && userData.username !== '')) && (
                            <p className="text-gray-400 text-sm">@{tgHandle || userData?.username}</p>
                        )}
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest opacity-50">Dota 2 Collector</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="bg-red-600/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/20 uppercase">Pro Player</span>
                        <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase">Collector</span>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="dota-card p-4 flex flex-col gap-1 items-center justify-center bg-white/5">
                        <Wallet className="text-red-500 mb-1" size={20} />
                        <span className="text-2xl font-black text-white">{userData?.points || 0}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Баланс BP</span>
                    </div>
                    <div
                        onClick={() => router.push('/inventory')}
                        className="dota-card p-4 flex flex-col gap-1 items-center justify-center bg-white/5 cursor-pointer active:scale-95 transition-transform border-b-2 border-b-blue-600"
                    >
                        <Package className="text-blue-500 mb-1" size={20} />
                        <span className="text-2xl font-black text-white">{userData?.inventory?.length || 0}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Инвентарь</span>
                    </div>
                </div>

                {/* Settings / Menu */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => router.push('/admin')}
                        className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-l-2 border-l-orange-500"
                    >
                        <div className="flex items-center gap-3 text-white/80">
                            <Settings size={20} className="text-orange-500" />
                            <span className="font-bold">Админ-панель</span>
                        </div>
                    </button>
                    <button className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3 text-white/80">
                            <Star size={20} className="text-yellow-500" />
                            <span className="font-bold">Достижения</span>
                        </div>
                        <div className="text-xs text-gray-500">Скоро</div>
                    </button>
                    <button
                        onClick={() => router.push('/settings')}
                        className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3 text-white/80">
                            <Settings size={20} className="text-gray-400" />
                            <span className="font-bold">Настройки</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
