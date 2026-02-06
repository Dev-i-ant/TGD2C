'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Share2, Wallet, TrendingUp, UserPlus, Check } from 'lucide-react';
import { getReferralData } from '../actions/referrals';
import { syncUser } from '../actions/user';

import { useTranslation } from '@/components/LanguageProvider';

export default function FriendsPage() {
    const { t } = useTranslation();
    const [referralData, setReferralData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'Open_My_Case_bot';

    useEffect(() => {
        async function load() {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe?.user;
                const startParam = tg.initDataUnsafe?.start_param;

                if (user) {
                    let data = await getReferralData(user.id.toString());
                    if (!data) {
                        // Fallback sync if data missing
                        await syncUser({
                            telegramId: user.id.toString(),
                            username: user.username,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            photoUrl: user.photo_url,
                            referralCode: startParam
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
            const text = t.friends.share_text;
            // Use share URL format that Telegram understands best
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        }
    };

    return (
        <div className="pb-24">
            <PageHeader title={t.friends.title} hideTitle />

            <div className="p-6 flex flex-col gap-6">
                {/* Referral Invite Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="steam-bevel p-6 bg-[var(--background)] flex flex-col gap-4"
                >
                    <div>
                        <h3 className="text-[var(--foreground)] font-black uppercase text-xs tracking-[0.2em] mb-1">{t.friends.referral_program.toUpperCase()}</h3>
                        <p className="text-[9px] text-[var(--foreground)]/60 font-bold uppercase tracking-widest mb-4">{t.friends.invite_desc.toUpperCase()}</p>

                        <div className="steam-emboss bg-black/20 p-2 flex items-center justify-between gap-4 mb-4">
                            <span className="text-[var(--foreground)]/30 text-[9px] truncate font-mono uppercase tracking-tighter">{referralLink || t.friends.generate_link.toUpperCase()}</span>
                            <button
                                onClick={handleCopy}
                                className="text-[var(--accent)] hover:opacity-80 transition-none active:translate-y-[1px]"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                        <button
                            onClick={handleShare}
                            disabled={!referralLink}
                            className="steam-bevel w-full h-12 flex items-center justify-center gap-2 uppercase font-black text-[10px] tracking-[0.2em] disabled:opacity-50 active:translate-y-[1px] transition-none"
                        >
                            <Share2 size={16} /> {t.friends.share.toUpperCase()}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="steam-emboss p-4 flex flex-col gap-1 items-center justify-center">
                        <Users size={14} className="text-[var(--accent)] mb-1" />
                        <span className="text-xl font-black text-[var(--foreground)] leading-none">{referralData?.referralCount || 0}</span>
                        <span className="text-[9px] text-[var(--foreground)]/60 font-bold uppercase tracking-widest mt-1">{t.friends.recruited.toUpperCase()}</span>
                    </div>
                    <div className="steam-emboss p-4 flex flex-col gap-1 items-center justify-center">
                        <Wallet size={14} className="text-[var(--accent)] mb-1" />
                        <span className="text-xl font-black text-[var(--foreground)] leading-none">{referralData?.referralEarnings || 0}</span>
                        <span className="text-[9px] text-[var(--foreground)]/60 font-bold uppercase tracking-widest mt-1">{t.friends.revenue.toUpperCase()}_BP</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <h3 className="text-[var(--accent)] font-black uppercase text-[10px] tracking-[0.3em] px-1">{t.leaderboard.player.toUpperCase()}</h3>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="steam-emboss p-4 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] text-[var(--foreground)]/60 font-bold uppercase tracking-widest text-center">{t.friends.commission.toUpperCase()}</span>
                            <span className="text-xl font-black text-[var(--foreground)]">10%</span>
                        </div>
                        <div className="steam-emboss p-4 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] text-[var(--foreground)]/60 font-bold uppercase tracking-widest text-center">{t.friends.recruited.toUpperCase()}</span>
                            <span className="text-xl font-black text-[var(--foreground)]">{referralData?.referralCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Friends List */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[var(--accent)] font-black uppercase text-[10px] tracking-[0.3em] px-1">{t.friends.referral_link.toUpperCase()}</h3>

                    {isLoading ? (
                        <div className="flex flex-col gap-2 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
                        </div>
                    ) : (!referralData || referralData.referrals?.length === 0 ? (
                        <div className="steam-bevel p-8 flex flex-col items-center justify-center text-center gap-4 bg-black/10">
                            <UserPlus size={32} className="text-[var(--foreground)]/10" />
                            <p className="text-[9px] text-[var(--foreground)]/40 font-black uppercase tracking-widest">{t.friends.no_friends.toUpperCase()}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {referralData.referrals.map((ref: any, idx: number) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={ref.id}
                                    className="steam-bevel p-3 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 steam-emboss flex items-center justify-center text-[var(--foreground)]/20 font-black text-[10px]">
                                            {ref.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--foreground)] font-black text-[11px] uppercase tracking-tighter">{ref.username || t.leaderboard.player}</span>
                                            <span className="text-[7px] text-[var(--foreground)]/30 font-black uppercase tracking-widest">{new Date(ref.joinedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[var(--accent)] font-black text-xs leading-none">+{ref.contribution} {t.common.bp}</p>
                                        <p className="text-[7px] text-[var(--foreground)]/30 font-black uppercase tracking-widest mt-1">{t.friends.commission.toUpperCase()}</p>
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
