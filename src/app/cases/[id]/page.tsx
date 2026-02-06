'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles } from 'lucide-react';
import { openCaseAction, sellItemAction } from '../../actions/user';
import { getCaseById, getCaseRewards } from '../../admin/cases/actions';

import { RARITIES, RARITY_COLORS as GLOBAL_COLORS } from '@/lib/constants';

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
const ITEM_WIDTH = 96; // w-24 (96px)
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
    const [multiplier, setMultiplier] = useState(1);
    const [isOpening, setIsOpening] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [wonRewards, setWonRewards] = useState<any[] | null>(null);

    // Per-line states
    const [rollItemsList, setRollItemsList] = useState<any[][]>([]);
    const [targetXList, setTargetXList] = useState<number[]>([]);
    const [rollKeyList, setRollKeyList] = useState<number[]>([]);
    const [startOffsetsList, setStartOffsetsList] = useState<number[]>([]);
    const [showWinEffectList, setShowWinEffectList] = useState<boolean[]>([]);

    // Fetch Case Data & Rewards
    useEffect(() => {
        async function loadCase() {
            const data = await getCaseById(id as string);
            if (data) {
                setCaseData(data);
                const items = await getCaseRewards(id as string);
                // Sort Rare First
                const sortedItems = [...items].sort((a, b) => {
                    const rA = RARITIES.indexOf(a.rarity as any);
                    const rB = RARITIES.indexOf(b.rarity as any);
                    if (rA !== rB) return rB - rA;
                    return a.weight - b.weight;
                });
                setRewards(sortedItems);
                // Initial static roll
                generateStaticRoll(sortedItems, multiplier);
                setIsLoading(false);
            } else {
                router.push('/cases');
            }
        }
        loadCase();
    }, [id]);

    const generateStaticRoll = (items: any[], count: number) => {
        if (!items || items.length === 0) return;

        const newRollItemsList = [];
        const newTargetXList = [];
        const newRollKeyList = [];
        const newStartOffsetsList = [];
        const newShowWinEffectList = [];

        for (let i = 0; i < count; i++) {
            // Create a long enough list for seamless looping
            let loopItems = [...items];
            while (loopItems.length < 50) {
                loopItems = [...loopItems, ...items];
            }
            // Proper Fisher-Yates shuffle for different initial look
            const shuffled = [...loopItems];
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }

            newRollItemsList.push([...shuffled, ...shuffled]);
            newTargetXList.push(0);
            newRollKeyList.push(0);

            // Random start position for desync
            const idleScrollDistance = (shuffled.length * ITEM_FULL_WIDTH);
            newStartOffsetsList.push(Math.random() * idleScrollDistance);

            newShowWinEffectList.push(false);
        }

        setRollItemsList(newRollItemsList);
        setTargetXList(newTargetXList);
        setRollKeyList(newRollKeyList);
        setStartOffsetsList(newStartOffsetsList);
        setShowWinEffectList(newShowWinEffectList);
    };

    const handleOpen = async () => {
        if (isOpening || rewards.length === 0) return;

        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
            alert(t.common.error + ': Telegram user not found');
            return;
        }

        setIsOpening(true);
        setWonRewards(null);
        setShowWinEffectList(new Array(multiplier).fill(false));

        // 1. Call real action with multiplier
        const result = await openCaseAction(tg.initDataUnsafe.user.id.toString(), id as string, multiplier);

        if (!result.success) {
            alert(result.error);
            setIsOpening(false);
            return;
        }

        // 2. Prepare winning rolls for each line
        const winners = result.winners;
        const newRollItemsList: any[][] = [];
        const newTargetXList: number[] = [];

        if (winners) {
            for (let m = 0; m < multiplier; m++) {
                const winner = winners[m];
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

                newRollItemsList.push(newRollItems);

                // 3. Calculate target position
                const randomOffset = Math.floor(Math.random() * 40) - 20;
                const exactPosition = -(WIN_INDEX * ITEM_FULL_WIDTH) - (ITEM_WIDTH / 2) + randomOffset;
                newTargetXList.push(exactPosition);
            }
        }

        setRollItemsList(newRollItemsList);
        setTargetXList(newTargetXList);

        // Restart animation
        setRollKeyList(prev => prev.map(k => k + 1));

        // Show result modal after animation finishes
        setTimeout(() => {
            setShowWinEffectList(new Array(multiplier).fill(true));
            setTimeout(() => {
                setWonRewards(winners || []);
                setIsOpening(false);
            }, 800);
        }, 6000); // 6s animation
    };

    const handleSellAll = async () => {
        if (!wonRewards || isSelling) return;

        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
            alert(t.common.error + ': user not found');
            return;
        }

        setIsSelling(true);

        let successCount = 0;
        for (const reward of wonRewards) {
            const result = await sellItemAction(tg.initDataUnsafe.user.id.toString(), reward.id);
            if (result.success) successCount++;
        }

        if (successCount === wonRewards.length) {
            setWonRewards(null);
            handleReset();
        } else {
            handleReset();
        }
        setIsSelling(false);
    };

    const handleReset = () => {
        setWonRewards(null);
        setShowWinEffectList(new Array(multiplier).fill(false));
        setTargetXList(new Array(multiplier).fill(0));
        generateStaticRoll(rewards, multiplier);
        setRollKeyList(prev => prev.map(k => k + 1));
    };

    // Update lines when multiplier changes
    useEffect(() => {
        if (!isLoading && !isOpening && !wonRewards) {
            generateStaticRoll(rewards, multiplier);
        }
    }, [multiplier, isLoading]);

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

    const renderRoulette = (index: number) => {
        const rollItems = rollItemsList[index] || [];
        const targetX = targetXList[index] || 0;
        const rollKey = rollKeyList[index] || 0;
        const showWinEffect = showWinEffectList[index] || false;
        const startOffset = startOffsetsList[index] || 0;

        const idleScrollDistance = rollItems.length > 0 ? (rollItems.length / 2) * ITEM_FULL_WIDTH : 0;
        const baseOffset = -(4 * ITEM_FULL_WIDTH);

        const animationProps = isOpening
            ? { x: targetX }
            : wonRewards
                ? { x: targetX }
                : { x: [baseOffset - startOffset, baseOffset - startOffset - idleScrollDistance] };

        const transitionProps = isOpening
            ? { duration: 6, ease: [0.1, 0, 0.1, 1] as any }
            : wonRewards
                ? { duration: 0 }
                : { duration: 80, ease: "linear", repeat: Infinity } as any;

        return (
            <div key={index} className="w-full relative py-2">
                {/* Center Indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[var(--accent)] z-20 shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 steam-bevel bg-[var(--accent)] w-5 h-2" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 steam-bevel bg-[var(--accent)] w-5 h-2" />
                </div>

                <div className="w-full overflow-hidden steam-emboss h-32 flex items-center bg-[var(--background)] relative">
                    {/* Overlay to fade edges */}
                    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />

                    <motion.div
                        key={rollKey}
                        initial={{ x: isOpening || wonRewards ? baseOffset : baseOffset - startOffset }}
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
                                    className={`w-24 h-24 steam-bevel flex flex-col items-center justify-center gap-1 p-2 shrink-0 relative overflow-hidden transition-all duration-500 ${isWinner ? 'shadow-[0_0_25px_rgba(var(--accent-rgb),0.5)] border-[var(--accent)]' : ''}`}
                                >
                                    {/* Item Image or Placeholder */}
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className={`w-14 h-14 object-contain transition-all ${isWinner ? 'grayscale-0' : 'grayscale-[0.5]'}`} />
                                    ) : (
                                        <div className="w-12 h-12 steam-emboss flex items-center justify-center">
                                            <Package size={20} className="text-[var(--accent)]/30" />
                                        </div>
                                    )}

                                    <span className="text-[8px] font-black uppercase text-[var(--foreground)]/80 text-center leading-tight truncate w-full relative z-10 tracking-widest">{item.name}</span>

                                    {/* Rarity Bar */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${(RARITY_COLORS[item.rarity] || 'bg-gray-500')} ${isWinner ? 'opacity-100' : 'opacity-40'}`} />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        );
    };

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
                        className="w-40 h-40 steam-emboss p-2 flex items-center justify-center relative overflow-hidden mx-auto shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    >
                        <div className="absolute inset-0 bg-black/10" />
                        {caseData?.image ? (
                            <img src={caseData.image} alt={caseData.name} className="w-full h-full object-contain relative z-10 scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                        ) : (
                            <Package size={64} className={`${caseData?.color?.replace('bg-', 'text-') || 'text-[var(--accent)]'} relative z-10 opacity-70`} />
                        )}
                    </motion.div>
                </section>

                {/* Roulette UI List */}
                <div className="w-full flex flex-col -gap-2">
                    {Array.from({ length: multiplier }).map((_, i) => renderRoulette(i))}
                </div>

                {/* Multiplier Selector */}
                <div className="w-full flex items-center justify-center gap-2 -mt-4 mb-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <button
                            key={num}
                            onClick={() => !isOpening && !wonRewards && setMultiplier(num)}
                            disabled={isOpening || !!wonRewards}
                            className={`steam-bevel w-10 h-10 text-[10px] font-black transition-all ${multiplier === num ? 'bg-[var(--accent)] text-white' : 'bg-[var(--secondary)] text-[var(--foreground)]/40'}`}
                        >
                            x{num}
                        </button>
                    ))}
                </div>

                <div className="w-full flex flex-col gap-2 px-4">
                    <button
                        onClick={handleOpen}
                        disabled={isOpening}
                        className={`steam-bevel w-full h-14 text-sm uppercase font-black tracking-[0.2em] active:translate-y-[1px] transition-none ${isOpening ? 'opacity-50 grayscale' : ''}`}
                    >
                        {isOpening ? t.cases.opening.toUpperCase() : `${t.cases.activate.toUpperCase()} (${caseData?.price * multiplier} ${t.common.bp})`}
                    </button>
                    {wonRewards && (
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
                    {wonRewards && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="steam-bevel p-8 flex flex-col items-center text-center gap-6 max-w-[90%] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Sparkles className="text-[var(--accent)]" size={20} />
                                </div>
                                <h2 className="text-xs font-black text-[var(--foreground)]/40 uppercase tracking-[0.3em] leading-none">{t.cases.acquired.toUpperCase()}</h2>

                                <div className={`grid ${wonRewards.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full max-h-[50vh] overflow-y-auto px-2 custom-scrollbar`}>
                                    {wonRewards.map((reward, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="w-24 h-24 steam-emboss p-2 flex items-center justify-center relative">
                                                {reward.image ? (
                                                    <img src={reward.image} alt={reward.name} className="w-full h-full object-contain grayscale-[0.2]" />
                                                ) : (
                                                    <Package size={32} className="text-[var(--accent)]/30" />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[8px] font-black text-[var(--foreground)] mb-0.5 uppercase tracking-tight truncate w-24">{reward.name}</h3>
                                                <p className={`text-[6px] font-black uppercase tracking-widest ${(RARITY_COLORS[reward.rarity] || 'bg-gray-500').replace('bg-', 'text-')}`}>{reward.rarity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2 w-full relative z-10 mt-4">
                                    <button
                                        onClick={handleSellAll}
                                        disabled={isSelling}
                                        className="steam-bevel h-12 bg-[var(--background)] text-green-500 text-[10px] font-black uppercase tracking-widest active:translate-y-[1px] transition-none disabled:opacity-50"
                                    >
                                        {isSelling ? (t.common.processing.toUpperCase() + '...') : `${t.common.sell.toUpperCase()} (+${wonRewards.reduce((acc, r) => acc + (r.sellPrice !== null ? r.sellPrice : (Math.floor(r.weight / 2) || 10)), 0)} ${t.common.bp})`}
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
