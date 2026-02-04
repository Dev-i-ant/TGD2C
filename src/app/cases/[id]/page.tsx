'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles } from 'lucide-react';
import { openCaseAction, sellItemAction } from '../../actions/user';
import { getCaseById, getCaseRewards } from '../../admin/cases/actions';

const RARITY_COLORS: Record<string, string> = {
    'COMMON': 'bg-gray-500',
    'UNCOMMON': 'bg-green-500',
    'RARE': 'bg-blue-500',
    'MYTHICAL': 'bg-indigo-600',
    'LEGENDARY': 'bg-pink-600',
    'IMMORTAL': 'bg-orange-500',
    'ARCANA': 'bg-purple-600',
    'ANCIENT': 'bg-red-600',
};

// Roulette Constants
const ITEM_WIDTH = 112; // w-28 (112px)
const GAP = 8; // gap-2 (8px)
const ITEM_FULL_WIDTH = ITEM_WIDTH + GAP;
const WIN_INDEX = 100; // Index where the winner will be placed (must be < TOTAL_ITEMS)
const TOTAL_ITEMS = 120;

import { useTranslation } from '@/components/LanguageProvider';

export default function CaseOpenPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t, language } = useTranslation();
    const [caseData, setCaseData] = useState<any>(null);
    const [rewards, setRewards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpening, setIsOpening] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [wonReward, setWonReward] = useState<any>(null);
    const [rollItems, setRollItems] = useState<any[]>([]);
    const [rollKey, setRollKey] = useState(0);
    const [targetX, setTargetX] = useState(0);
    const [showWinEffect, setShowWinEffect] = useState(false);

    // Fetch Case Data & Rewards
    useEffect(() => {
        async function loadCase() {
            const data = await getCaseById(id as string);
            if (data) {
                setCaseData(data);
                const items = await getCaseRewards(id as string);
                setRewards(items);
                // Initial static roll
                generateStaticRoll(items);
                setIsLoading(false);
            } else {
                router.push('/cases');
            }
        }
        loadCase();
    }, [id]);

    const generateStaticRoll = (items: any[]) => {
        if (!items || items.length === 0) return;
        // Create a long enough list for seamless looping
        let loopItems = [...items];
        while (loopItems.length < 50) {
            loopItems = [...loopItems, ...items];
        }
        setRollItems([...loopItems, ...loopItems]); // Double the set for seamless reset
    };

    const handleOpen = async () => {
        if (isOpening || rewards.length === 0) return;

        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
            alert(t.common.error + ': Telegram user not found');
            return;
        }

        setIsOpening(true);
        setWonReward(null);
        setShowWinEffect(false);

        // 1. Call real action
        const result = await openCaseAction(tg.initDataUnsafe.user.id.toString(), id as string);

        if (!result.success) {
            alert(result.error);
            setIsOpening(false);
            return;
        }

        // 2. Prepare winning roll
        const winner = result.winner;
        const newRollItems = [];

        // Fill before winner
        for (let i = 0; i < WIN_INDEX; i++) {
            newRollItems.push(rewards[Math.floor(Math.random() * rewards.length)]);
        }
        // Place winner
        newRollItems.push(winner);
        // Fill after winner
        for (let i = WIN_INDEX + 1; i < TOTAL_ITEMS; i++) {
            newRollItems.push(rewards[Math.floor(Math.random() * rewards.length)]);
        }

        setRollItems(newRollItems);

        // 3. Calculate target position
        // Each item is 112px + 8px gap = 120px. 
        // 0 offset places the LEFT edge of item 0 at indicator.
        // To center item WIN_INDEX: move left by WIN_INDEX items + half of item width (56px).
        const randomOffset = Math.floor(Math.random() * 40) - 20;
        const exactPosition = -(WIN_INDEX * ITEM_FULL_WIDTH) - 56 + randomOffset;

        setTargetX(exactPosition);

        // Restart animation
        setRollKey(prev => prev + 1);

        // Show result modal after animation finishes
        setTimeout(() => {
            setShowWinEffect(true);
            setTimeout(() => {
                setWonReward(winner);
                setIsOpening(false);
            }, 800);
        }, 6000); // 6s animation
    };

    const handleSell = async () => {
        if (!wonReward || isSelling) return;

        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
            alert(t.common.error + ': user not found');
            return;
        }

        setIsSelling(true);
        const result = await sellItemAction(tg.initDataUnsafe.user.id.toString(), wonReward.id);

        if (result.success) {
            setWonReward(null);
            handleReset();
        } else {
            alert(result.error);
        }
        setIsSelling(false);
    };

    const handleReset = () => {
        setWonReward(null);
        setShowWinEffect(false);
        setTargetX(0);
        generateStaticRoll(rewards);
        setRollKey(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))]">
                <PageHeader title={t.common.loading + '...'} />
                <div className="p-6 flex flex-col gap-12 items-center animate-pulse">
                    <div className="w-48 h-48 bg-white/5 rounded-2xl" />
                    <div className="w-full h-36 bg-white/5 rounded-2xl" />
                    <div className="w-full h-16 bg-white/5 rounded-xl" />
                </div>
            </div>
        );
    }

    const idleScrollDistance = rollItems.length > 0 ? (rollItems.length / 2) * ITEM_FULL_WIDTH : 0;

    const animationProps = isOpening
        ? { x: targetX }
        : wonReward
            ? { x: targetX }
            : { x: [-(4 * ITEM_FULL_WIDTH), -(idleScrollDistance + (4 * ITEM_FULL_WIDTH))] };

    const transitionProps = isOpening
        ? { duration: 6, ease: [0.1, 0, 0.1, 1] as any }
        : wonReward
            ? { duration: 0 }
            : { duration: 70, ease: "linear", repeat: Infinity } as any;

    return (
        <div className="pb-24 overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top))]">
            <PageHeader title={caseData?.name || t.cases.open_case} backPath="/cases" hideTitle />

            <div className="p-4 flex flex-col gap-8 items-center">
                {/* Case Visual */}
                <section className="text-center">
                    <h2 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight mb-3">{caseData?.name}</h2>
                    <motion.div
                        animate={isOpening ? { rotate: [0, -2, 2, -2, 2, 0], scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.3 }}
                        className="w-32 h-32 steam-emboss p-2 flex items-center justify-center relative overflow-hidden mx-auto shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    >
                        <div className="absolute inset-0 bg-black/10" />
                        <Package size={64} className={`${caseData?.color?.replace('bg-', 'text-') || 'text-[var(--accent)]'} relative z-10 opacity-70`} />
                    </motion.div>
                </section>

                {/* Roulette UI */}
                <div className="w-full relative py-4">
                    {/* Center Indicator */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[var(--accent)] z-20 shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 steam-bevel bg-[var(--accent)] w-5 h-2" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 steam-bevel bg-[var(--accent)] w-5 h-2" />
                    </div>

                    <div className="w-full overflow-hidden steam-emboss h-36 flex items-center bg-[var(--background)] relative">
                        {/* Overlay to fade edges */}
                        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />

                        <motion.div
                            key={rollKey}
                            initial={{ x: -(4 * ITEM_FULL_WIDTH) }}
                            animate={animationProps}
                            transition={transitionProps}
                            className="flex gap-2 px-[50%] min-w-max items-center"
                        >
                            {rollItems.map((item, i) => {
                                const isWinner = showWinEffect && i === WIN_INDEX;
                                return (
                                    <motion.div
                                        key={i}
                                        animate={isWinner ? { scale: 1.15, filter: 'grayscale(0)' } : {}}
                                        className={`w-28 h-28 steam-bevel flex flex-col items-center justify-center gap-1 p-2 shrink-0 relative overflow-hidden transition-all duration-500 ${isWinner ? 'shadow-[0_0_25px_rgba(var(--accent-rgb),0.5)] border-[var(--accent)]' : ''}`}
                                    >
                                        {/* Item Image or Placeholder */}
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className={`w-16 h-16 object-contain transition-all ${isWinner ? 'grayscale-0' : 'grayscale-[0.5]'}`} />
                                        ) : (
                                            <div className="w-14 h-14 steam-emboss flex items-center justify-center">
                                                <Package size={24} className="text-[var(--accent)]/30" />
                                            </div>
                                        )}

                                        <span className="text-[9px] font-black uppercase text-[var(--foreground)]/80 text-center leading-tight truncate w-full relative z-10 tracking-widest">{item.name}</span>

                                        {/* Rarity Bar */}
                                        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${(RARITY_COLORS[item.rarity] || 'bg-gray-500')} ${isWinner ? 'opacity-100' : 'opacity-40'}`} />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                    <button
                        onClick={handleOpen}
                        disabled={isOpening}
                        className={`steam-bevel w-full h-14 text-sm uppercase font-black tracking-[0.2em] active:translate-y-[1px] transition-none ${isOpening ? 'opacity-50 grayscale' : ''}`}
                    >
                        {isOpening ? t.cases.opening.toUpperCase() : `${t.cases.activate.toUpperCase()} (${caseData?.price} ${t.common.bp})`}
                    </button>
                    {wonReward && (
                        <button
                            onClick={handleReset}
                            className="text-[9px] text-[var(--foreground)]/40 hover:text-[var(--foreground)] uppercase font-black tracking-widest text-center mt-2"
                        >
                            {t.cases.reset.toUpperCase()}
                        </button>
                    )}
                </div>

                <div className="w-full flex flex-col gap-2">
                    <div className="steam-bevel px-3 py-1 bg-[var(--secondary)] flex items-center justify-between">
                        <h3 className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-[0.2em]">{t.cases.contents.toUpperCase()}</h3>
                        <span className="text-[8px] text-[var(--foreground)]/40 font-black uppercase">{rewards.length} {t.leaderboard.items.toUpperCase()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {rewards.map((reward) => (
                            <div key={reward.id} className="steam-bevel p-2 flex flex-col gap-2">
                                <div className="w-full aspect-square steam-emboss flex items-center justify-center relative overflow-hidden p-2">
                                    {reward.image ? (
                                        <img src={reward.image} alt={reward.name} className="w-full h-full object-contain grayscale-[0.4] z-10" />
                                    ) : (
                                        <Package size={24} className="text-[var(--accent)]/20" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-[var(--foreground)] leading-tight uppercase truncate tracking-tighter">{reward.name}</p>
                                    <p className={`text-[7px] font-bold ${(RARITY_COLORS[reward.rarity] || 'bg-gray-500').replace('bg-', 'text-')} uppercase tracking-tighter`}>{reward.rarity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {wonReward && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="steam-bevel p-8 flex flex-col items-center text-center gap-6 max-w-[340px] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Sparkles className="text-[var(--accent)]" size={20} />
                                </div>
                                <h2 className="text-xs font-black text-[var(--foreground)]/40 uppercase tracking-[0.3em] leading-none">{t.cases.acquired.toUpperCase()}</h2>

                                <div className="w-48 h-48 steam-emboss p-2 flex items-center justify-center relative z-10">
                                    {wonReward.image ? (
                                        <img src={wonReward.image} alt={wonReward.name} className="w-full h-full object-contain grayscale-[0.2]" />
                                    ) : (
                                        <Package size={64} className="text-[var(--accent)]/30" />
                                    )}
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-sm font-black text-[var(--foreground)] mb-1 uppercase tracking-tight">{wonReward.name}</h3>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${(RARITY_COLORS[wonReward.rarity] || 'bg-gray-500').replace('bg-', 'text-')}`}>{wonReward.rarity}</p>
                                </div>

                                <div className="flex flex-col gap-2 w-full relative z-10">
                                    <button
                                        onClick={handleSell}
                                        disabled={isSelling}
                                        className="steam-bevel h-12 bg-[var(--background)] text-green-500 text-[10px] font-black uppercase tracking-widest active:translate-y-[1px] transition-none disabled:opacity-50"
                                    >
                                        {isSelling ? (t.common.processing.toUpperCase() + '...') : `${t.common.sell.toUpperCase()} (+${wonReward.sellPrice !== null ? wonReward.sellPrice : (Math.floor(wonReward.weight / 2) || 10)} ${t.common.bp})`}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="steam-bevel h-10 bg-[var(--background)] text-[var(--foreground)] text-[10px] font-black uppercase tracking-widest active:translate-y-[1px] transition-none"
                                    >
                                        {t.common.confirm.toUpperCase()}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
