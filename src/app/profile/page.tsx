'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Wallet, Package, Trophy, Settings, Star, Palette, Sparkles, Share2, Check, History as HistoryIcon, ShieldCheck, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserData } from '../actions/user';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from '@/components/LanguageProvider';
import { getRarityTextColor } from '@/lib/constants';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { t, language } = useTranslation();
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState(t.common.loading);
    const [tgHandle, setTgHandle] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    const fName = user.first_name && user.first_name !== 'undefined' ? user.first_name : '';
                    const lName = user.last_name && user.last_name !== 'undefined' ? user.last_name : '';
                    const localDisplayName = (fName + (lName ? ' ' + lName : '')).trim() || 'User';

                    setFullName(localDisplayName);
                    setPhotoUrl(user.photo_url || null);
                    setTgHandle(user.username && user.username !== 'undefined' ? user.username : null);
                    const data = await getUserData(user.id.toString()) as any;
                    setUserData(data);

                    // If DB data has valid firstName/lastName, prefer it
                    if (data?.firstName && data.firstName !== 'undefined') {
                        const dbFName = data.firstName;
                        const dbLName = data.lastName && data.lastName !== 'undefined' ? data.lastName : '';
                        setFullName((dbFName + (dbLName ? ' ' + dbLName : '')).trim());
                    }
                    if (data?.photoUrl) {
                        setPhotoUrl(data.photoUrl);
                    }
                }
            }
            setIsLoading(false);
        }
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title={t.profile.title} />
                <div className="p-6 flex flex-col gap-6 animate-pulse">
                    <div className="h-48 steam-bevel" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 steam-bevel" />
                        <div className="h-24 steam-bevel" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-[calc(5rem+env(safe-area-inset-top))]">
            <div className="p-6 flex flex-col gap-6">
                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="steam-bevel p-6 flex flex-col items-center text-center gap-4"
                >
                    <div className="w-24 h-24 steam-emboss p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-[#151a1f] flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                <img src={photoUrl} alt={fullName} className="w-full h-full object-cover grayscale-[0.2]" />
                            ) : (
                                <Trophy size={48} className="text-[var(--accent)]" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[var(--foreground)]">{fullName}</h2>
                        {(tgHandle || (userData?.username && userData.username !== '')) && (
                            <p className="text-[var(--foreground)]/40 text-sm">@{tgHandle || userData?.username}</p>
                        )}
                        <p className="steam-header-text mt-1 opacity-50">{t.profile.collector}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {userData?.titles ? (
                            userData.titles.split(',').map((title: string, i: number) => (
                                <span
                                    key={i}
                                    className="steam-emboss text-[var(--foreground)] text-[9px] font-black px-2 py-1 uppercase tracking-tight"
                                >
                                    {title.trim()}
                                </span>
                            ))
                        ) : (
                            <>
                                <span className="steam-emboss text-[var(--foreground)] text-[9px] font-black px-2 py-1 uppercase tracking-tight">Pro Player</span>
                                <span className="steam-emboss border-[var(--accent)]/50 text-[var(--accent)] text-[9px] font-black px-2 py-1 uppercase tracking-tight">Collector</span>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="steam-emboss p-4 flex flex-col gap-1 items-center justify-center">
                        <Wallet className="text-[var(--accent)] mb-1" size={16} />
                        <span className="text-xl font-black text-[var(--foreground)] leading-none">{userData?.points || 0}</span>
                        <span className="steam-header-text text-[9px] text-[var(--foreground)]/60">{t.profile.balance_bp}</span>
                    </div>
                    <div
                        onClick={() => router.push('/inventory')}
                        className="steam-emboss p-4 flex flex-col gap-1 items-center justify-center cursor-pointer active:translate-y-[1px] transition-none"
                    >
                        <Package className="text-[var(--accent)] mb-1" size={16} />
                        <span className="text-xl font-black text-[var(--foreground)] leading-none">{userData?.stats?.inventoryCount ?? 0}</span>
                        <span className="steam-header-text text-[9px] text-[var(--foreground)]/60">{t.nav.inventory || t.profile.inventory}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="steam-bevel px-3 py-1 bg-[var(--secondary)]">
                        <h3 className="steam-header-text text-[var(--foreground)]">{t.profile.personal_stats}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="steam-emboss p-4 flex flex-col gap-1">
                            <span className="steam-header-text text-[var(--foreground)]/60">{t.profile.total_opened}</span>
                            <span className="text-lg font-black text-[var(--foreground)]">{userData?.stats?.totalOpened || 0}</span>
                        </div>
                        <div className="steam-emboss p-4 flex flex-col gap-1 text-right">
                            <span className="steam-header-text text-[var(--foreground)]/60">{t.profile.earned_bp}</span>
                            <span className="text-lg font-black text-[var(--accent)]">+{userData?.stats?.totalEarned || 0}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/history')}
                        className="w-full steam-bevel p-3 flex items-center justify-between group active:translate-y-[1px] transition-none"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 steam-emboss flex items-center justify-center">
                                <HistoryIcon size={16} className="text-[var(--accent)]" />
                            </div>
                            <span className="steam-header-text text-[var(--foreground)] font-black">{t.history.title}</span>
                        </div>
                        <Check size={16} className="text-gray-600 group-hover:text-[var(--accent)] transition-colors" />
                    </button>

                    {/* Enhanced Best Drop Card - Now Historical Record */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-[var(--accent)] font-black uppercase text-[10px] tracking-[0.3em] px-1">{t.profile.best_drop}</h3>
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
                                <div className="w-20 h-20 rounded-xl bg-black/60 border border-white/5 flex items-center justify-center p-2 shrink-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group-hover:border-[var(--accent)]/50 transition-all duration-300">
                                    {(userData?.historicalBest?.image || userData?.stats?.bestInInventory?.image) ? (
                                        <img
                                            src={userData?.historicalBest?.image || userData?.stats?.bestInInventory?.image}
                                            alt=""
                                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter-none"
                                        />
                                    ) : (
                                        <Package size={40} className="text-gray-600/40" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-lg font-black uppercase leading-tight truncate ${getRarityTextColor(userData?.historicalBest?.rarity || userData?.stats?.bestInInventory?.rarity || '')}`}>
                                        {userData?.historicalBest?.name || userData?.stats?.bestInInventory?.name || (language === 'ru' ? 'Пусто' : 'Empty')}
                                    </h4>
                                    <p className="text-[9px] text-[var(--foreground)]/40 font-bold uppercase tracking-widest mt-1">
                                        {userData?.historicalBest ? t.profile.historical_best_desc : (userData?.stats?.bestInInventory ? t.profile.current_best_desc : (language === 'ru' ? 'Открой свой первый кейс!' : 'Open your first case!'))}
                                    </p>

                                    {userData?.historicalBest || userData?.stats?.bestInInventory ? (
                                        <button
                                            onClick={() => {
                                                const itemName = userData.historicalBest?.name || userData?.stats?.bestInInventory?.name;
                                                const shareText = language === 'ru'
                                                    ? `Мой рекордный дроп: ${itemName}! 🏆`
                                                    : `My record drop: ${itemName}! 🏆`;

                                                try {
                                                    if (window.Telegram?.WebApp) {
                                                        const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'Open_My_Case_bot';
                                                        const referralLink = `https://t.me/${botUsername}/app?startapp=${userData.id}`;
                                                        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
                                                        window.Telegram.WebApp.openTelegramLink(shareUrl);
                                                    }
                                                } catch (e) {
                                                    console.error('Sharing failed', e);
                                                }
                                            }}
                                            className="mt-3 flex items-center gap-2 bg-[var(--accent)] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity active:scale-95"
                                        >
                                            <Share2 size={12} /> {t.profile.share_record}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push('/cases')}
                                            className="mt-3 flex items-center gap-2 bg-[var(--accent)] text-white text-[9px] font-black uppercase px-4 py-2 rounded-lg hover:opacity-80 transition-opacity active:scale-95 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                                        >
                                            <Package size={12} /> {t.common.open.toUpperCase()}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="dota-card p-4 flex flex-col gap-3 transition-colors border-l-2 border-l-purple-500">
                            <div className="flex items-center gap-3">
                                <Palette size={20} className="text-purple-500" />
                                <span className="font-bold text-[var(--foreground)]">{t.profile.theme}</span>
                            </div>
                            <div className="flex bg-black/40 p-1 rounded-lg">
                                <button
                                    onClick={() => setTheme('classic')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-md transition-all ${theme === 'classic' ? 'bg-[#4b5c40] text-[#cba500] shadow-lg' : 'text-[var(--foreground)]/20 hover:text-[var(--foreground)]/40'}`}
                                >
                                    Classic
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-md transition-all ${theme === 'dark' ? 'bg-[#c23c2a] text-white shadow-lg' : 'text-[var(--foreground)]/20 hover:text-[var(--foreground)]/40'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/settings')}
                            className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-l-2 border-l-blue-500"
                        >
                            <div className="flex items-center gap-3 text-white/80">
                                <Settings size={20} className="text-blue-500" />
                                <span className="font-bold text-[var(--foreground)]">{t.profile.settings}</span>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (window.Telegram?.WebApp) {
                                    window.Telegram.WebApp.openTelegramLink('https://t.me/Open_My_Case_bot');
                                } else {
                                    window.open('https://t.me/Open_My_Case_bot', '_blank');
                                }
                            }}
                            className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-l-2 border-l-green-600"
                        >
                            <div className="flex items-center gap-3 text-white/80">
                                <ExternalLink size={20} className="text-green-600" />
                                <span className="font-bold text-[var(--foreground)]">{t.settings.support}</span>
                            </div>
                        </button>

                        <button
                            className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors opacity-60"
                        >
                            <div className="flex items-center gap-3 text-white/80">
                                <Trophy size={20} className="text-yellow-600" />
                                <span className="font-bold text-[var(--foreground)]">{t.profile.achievements || t.nav.leaderboard}</span>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-yellow-600/50">{t.common.soon}</div>
                        </button>

                        {userData?.isAdmin && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="dota-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-l-2 border-l-orange-500"
                            >
                                <div className="flex items-center gap-3 text-white/80">
                                    <ShieldCheck size={20} className="text-orange-500" />
                                    <span className="font-bold text-[var(--foreground)]">{t.profile.admin || 'Admin Panel'}</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
