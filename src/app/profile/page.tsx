'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Wallet, Package, Trophy, Settings, Star, Palette, Sparkles, Share2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserData } from '../actions/user';
import { useTheme } from '@/components/ThemeProvider';
import { RARITY_TEXT_COLORS } from '@/lib/constants';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
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
                    className="dota-card p-6 flex flex-col items-center text-center gap-4 border-t-2 border-t-[var(--primary)]"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                        <div className="w-full h-full rounded-full bg-[#151a1f] flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <Trophy size={48} className="text-[var(--primary)]" />
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
                        <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black px-3 py-1 rounded-full border border-[var(--primary)]/20 uppercase">Pro Player</span>
                        <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase">Collector</span>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="dota-card p-4 flex flex-col gap-1 items-center justify-center bg-[var(--background)]/30">
                        <Wallet className="text-[var(--primary)] mb-1" size={20} />
                        <span className="text-2xl font-black text-[var(--foreground)]">{userData?.points || 0}</span>
                        <span className="text-[10px] text-[var(--primary)] uppercase font-bold tracking-widest">Баланс BP</span>
                    </div>
                    <div
                        onClick={() => router.push('/inventory')}
                        className="dota-card p-4 flex flex-col gap-1 items-center justify-center bg-[var(--background)]/30 cursor-pointer active:scale-95 transition-transform border-b-2 border-b-blue-600"
                    >
                        <Package className="text-blue-500 mb-1" size={20} />
                        <span className="text-2xl font-black text-[var(--foreground)]">{userData?.stats?.inventoryCount || userData?.inventory?.length || 0}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Инвентарь</span>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em]">Личная статистика</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="dota-card p-4 bg-white/[0.02] flex flex-col gap-1">
                            <span className="text-[9px] text-gray-500 font-bold uppercase">Всего открыто</span>
                            <span className="text-lg font-black text-[var(--foreground)]">{userData?.stats?.totalOpened || 0}</span>
                        </div>
                        <div className="dota-card p-4 bg-white/[0.02] flex flex-col gap-1 text-right">
                            <span className="text-[9px] text-gray-500 font-bold uppercase">Заработано BP</span>
                            <span className="text-lg font-black text-green-500/80">+{userData?.stats?.totalEarned || 0}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/history')}
                        className="w-full dota-card p-4 bg-white/[0.05] flex items-center justify-between group active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                                <Wallet size={16} className="text-red-500" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">История транзакций</span>
                        </div>
                        <Check size={16} className="text-gray-600 group-hover:text-[var(--accent)] transition-colors" />
                    </button>

                    {/* Enhanced Best Drop Card - Now Historical Record */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em] px-1">Рекордный дроп</h3>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="dota-card p-5 bg-gradient-to-br from-[var(--accent)]/10 to-transparent relative overflow-hidden group border-t-[var(--accent)]/30 border-t-2"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Sparkles size={120} className="text-[var(--accent)]" />
                            </div>

                            <div className="flex items-center gap-5 relative z-10">
                                {/* Item Visual */}
                                <div className="w-20 h-20 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center p-2 shrink-0 shadow-inner group-hover:border-[var(--accent)]/30 transition-colors">
                                    {(userData?.historicalBest?.image || userData?.stats?.bestInInventory?.image) ? (
                                        <img src={userData?.historicalBest?.image || userData?.stats?.bestInInventory?.image} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                                    ) : (
                                        <Package size={40} className="text-gray-600" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-lg font-black uppercase leading-tight truncate ${RARITY_TEXT_COLORS[userData?.historicalBest?.rarity || userData?.stats?.bestInInventory?.rarity || ''] || 'text-[var(--accent)]'}`}>
                                        {userData?.historicalBest?.name || userData?.stats?.bestInInventory?.name || 'Пока нет наград'}
                                    </h4>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                        {userData?.historicalBest ? 'Твой лучший результат за все время' : 'Твой лучший из текущих'}
                                    </p>

                                    {userData?.historicalBest && (
                                        <button
                                            onClick={() => {
                                                const itemName = userData.historicalBest?.name;
                                                const shareText = `Мой рекордный дроп: ${itemName}! 🏆`;

                                                try {
                                                    if (window.Telegram?.WebApp) {
                                                        const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'WhoMyFatherBot';
                                                        const referralLink = `https://t.me/${botUsername}/app?startapp=${userData.id}`;

                                                        // Direct share link works even without Inline Mode
                                                        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
                                                        window.Telegram.WebApp.openTelegramLink(shareUrl);
                                                    }
                                                } catch (e) {
                                                    console.error('Sharing failed', e);
                                                }
                                            }}
                                            className="mt-3 flex items-center gap-2 bg-[var(--accent)] text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity active:scale-95"
                                        >
                                            <Share2 size={12} /> Поделиться рекордом
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="dota-card p-4 flex flex-col gap-3 hover:bg-white/5 transition-colors border-l-2 border-l-purple-500">
                        <div className="flex items-center gap-3 text-white/80">
                            <Palette size={20} className="text-purple-500" />
                            <span className="font-bold">Тема оформления</span>
                        </div>
                        <div className="flex bg-black/20 p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('classic')}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${theme === 'classic' ? 'bg-[#4b5c40] text-[#cba500] shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                Classic
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${theme === 'dark' ? 'bg-[#c23c2a] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>

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
