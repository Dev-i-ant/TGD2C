'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Share2, Wallet, TrendingUp, UserPlus, Check } from 'lucide-react';
import { getReferralData } from '../actions/referrals';
import { syncUser } from '../actions/user';

export default function FriendsPage() {
    const [referralData, setReferralData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'dota2_case_bot';

    useEffect(() => {
        async function load() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    let data = await getReferralData(user.id.toString());
                    if (!data) {
                        // Fallback sync if data missing
                        await syncUser({
                            telegramId: user.id.toString(),
                            username: user.username,
                            firstName: user.first_name,
                            lastName: user.last_name
                        });
                        data = await getReferralData(user.id.toString());
                    }
                    setReferralData(data);
                }
            }
            setIsLoading(false);
        }
        load();
    }, []);

    const referralLink = referralData?.referralCode
        ? `https://t.me/${botUsername}/app?startapp=${referralData.referralCode}`
        : '';

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (window.Telegram?.WebApp && referralLink) {
            const text = `Заходи и открывай кейсы Dota 2! При входе по моей ссылке получишь +500 BP бонусом! 🎁`;
            // Use share URL format that Telegram understands best
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        }
    };

    return (
        <div className="pb-24">
            <PageHeader title="Друзья" />

            <div className="p-6 flex flex-col gap-6">
                {/* Referral Invite Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dota-card p-6 bg-gradient-to-br from-[#1c242d] to-[#12161b] relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h3 className="text-white font-black uppercase text-lg tracking-tight leading-none mb-1">Приглашай друзей</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Зарабатывай 10% от их открытий</p>

                        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-4 mb-4">
                            <span className="text-gray-400 text-[10px] truncate font-mono">{referralLink || 'Генерация ссылки...'}</span>
                            <button
                                onClick={handleCopy}
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        <button
                            onClick={handleShare}
                            disabled={!referralLink}
                            className="dota-button w-full h-12 flex items-center justify-center gap-2 uppercase font-black text-xs tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Share2 size={16} /> Поделиться ссылкой
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="dota-card p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-blue-500">
                            <Users size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Приглашено</span>
                        </div>
                        <span className="text-xl font-black text-white">{referralData?.referralCount || 0}</span>
                    </div>
                    <div className="dota-card p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-yellow-500">
                            <Wallet size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Заработано</span>
                        </div>
                        <span className="text-xl font-black text-white">{referralData?.referralEarnings || 0} BP</span>
                    </div>
                </div>

                {/* Friends List */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] px-1">Твои партнеры</h3>

                    {isLoading ? (
                        <div className="flex flex-col gap-2 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
                        </div>
                    ) : (!referralData || referralData.referrals?.length === 0 ? (
                        <div className="dota-card p-12 flex flex-col items-center justify-center text-center gap-4 bg-transparent border-dashed">
                            <UserPlus size={32} className="text-gray-800" />
                            <p className="text-[10px] text-gray-600 font-bold uppercase">У тебя пока нет партнеров.<br />Пригласи первого друга!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {referralData.referrals.map((ref: any, idx: number) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={ref.id}
                                    className="dota-card p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 font-black text-[10px]">
                                            {ref.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-xs">{ref.username || 'Игрок'}</span>
                                            <span className="text-[8px] text-gray-600 font-bold uppercase">Вступил {new Date(ref.joinedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-yellow-500 font-black text-[10px]">+{ref.contribution} BP</span>
                                        <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Комиссия</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
