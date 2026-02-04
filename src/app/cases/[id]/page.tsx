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
const WIN_INDEX = 70; // Index where the winner will be placed (must be < TOTAL_ITEMS)
const TOTAL_ITEMS = 80;

export default function CaseOpenPage() {
    const { id } = useParams();
    const router = useRouter();
    const [caseData, setCaseData] = useState<any>(null);
    const [rewards, setRewards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpening, setIsOpening] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [wonReward, setWonReward] = useState<any>(null);
    const [rollItems, setRollItems] = useState<any[]>([]);
    const [rollKey, setRollKey] = useState(0);
    const [targetX, setTargetX] = useState(0);

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
        // Create a long enough list for seamless looping (at least screen width + buffer)
        // Repeat items 4 times or enough to fill ~50 items
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
            // For testing outside Telegram, uncomment below for fake user
            // tg = { initDataUnsafe: { user: { id: 12345 } } }; 
            alert('Пожалуйста, откройте приложение через Telegram');
            return;
        }

        setIsOpening(true);
        setWonReward(null);

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
        // Algorithm: 
        // Start position: Center of Container aligned with Left edge of first item (due to px-[50%])
        // To center Item 0: Move left by ITEM_WIDTH / 2
        // To center Item N: Move left by (N * ITEM_FULL_WIDTH) + (ITEM_WIDTH / 2)
        // Add Random offset: +/- 40px to land randomly within the item box
        const randomOffset = Math.floor(Math.random() * 80) - 40;
        const exactPosition = -(WIN_INDEX * ITEM_FULL_WIDTH) - (ITEM_WIDTH / 2) + randomOffset;

        setTargetX(exactPosition);

        // Restart animation
        setRollKey(prev => prev + 1);

        // Show result modal after animation finishes (wait slightly longer than animation duration)
        setTimeout(() => {
            setWonReward(winner);
            setIsOpening(false);
        }, 6500); // 6s animation + 0.5s buffer
    };

    const handleSell = async () => {
        if (!wonReward || isSelling) return;

        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
            alert('Ошибка: пользователь не найден');
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
        setTargetX(0);
        generateStaticRoll(rewards);
        setRollKey(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="pb-24">
                <PageHeader title="Загрузка..." />
                <div className="p-6 flex flex-col gap-12 items-center animate-pulse">
                    <div className="w-48 h-48 bg-white/5 rounded-2xl" />
                    <div className="w-full h-36 bg-white/5 rounded-2xl" />
                    <div className="w-full h-16 bg-white/5 rounded-xl" />
                </div>
            </div>
        );
    }

    // Determine animation based on state
    // Idle state: Scroll from 0 to -(half of items width)
    const idleScrollDistance = rollItems.length > 0 ? (rollItems.length / 2) * ITEM_FULL_WIDTH : 0;

    const animationProps = isOpening
        ? { x: targetX } // Opening: go to target
        : wonReward
            ? { x: targetX } // Won: stay at target
            : { x: [0, -idleScrollDistance] }; // Idle: infinite loop

    const transitionProps = isOpening
        ? { duration: 6, ease: [0.1, 0, 0.1, 1] as any }
        : wonReward
            ? { duration: 0 }
            : { duration: 70, ease: "linear", repeat: Infinity } as any;

    return (
        <div className="pb-24 overflow-hidden">
            <PageHeader title={caseData?.name || 'Открытие кейса'} />

            <div className="p-6 flex flex-col gap-12 items-center">
                {/* Case Visual */}
                <motion.div
                    animate={isOpening ? { rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className={`w-48 h-48 bg-gradient-to-t ${caseData?.color || 'from-[var(--primary)]'}/30 to-transparent rounded-sm flex items-center justify-center border border-[var(--border)] shadow-[0_0_50px_rgba(var(--primary),0.1)]`}
                >
                    <Package size={100} className={caseData?.color?.replace('bg-', 'text-') || 'text-[var(--accent)]'} />
                </motion.div>

                {/* Roulette UI */}
                <div className="w-full relative py-8">
                    {/* Center Indicator */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-[var(--accent)] z-20 shadow-[0_0_5px_var(--accent)]">
                        <div className="absolute -top-1 -left-[4px] border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[var(--accent)]"></div>
                        <div className="absolute -bottom-1 -left-[4px] border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-bottom-[6px] border-b-[var(--accent)]"></div>
                    </div>

                    <div className="w-full overflow-hidden dota-card h-36 flex items-center bg-[var(--background)] border-x-0 relative shadow-inner">
                        <motion.div
                            key={rollKey}
                            initial={{ x: 0 }}
                            animate={animationProps}
                            transition={transitionProps}
                            className="flex gap-2 px-[50%] min-w-max"
                        >
                            {rollItems.map((item, i) => (
                                <div key={i} className={`w-28 h-28 rounded-sm ${(RARITY_COLORS[item.rarity] || 'bg-[var(--secondary)]')}/10 border border-[var(--border)] flex flex-col items-center justify-center gap-2 p-2 shrink-0 relative overflow-hidden`}>
                                    {/* Item Image or Placeholder */}
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain drop-shadow-lg" />
                                    ) : (
                                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-t ${(RARITY_COLORS[item.rarity] || 'bg-gray-500')} to-transparent shadow-lg flex items-center justify-center`}>
                                            <Package size={24} className="text-white/50" />
                                        </div>
                                    )}

                                    <span className="text-[9px] font-black uppercase text-[var(--accent)] text-center leading-tight truncate w-full relative z-10">{item.name}</span>

                                    {/* Rarity Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${(RARITY_COLORS[item.rarity] || 'bg-gray-500')}/20 to-transparent opacity-50`} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full flex flex-col gap-4">
                    <button
                        onClick={handleOpen}
                        disabled={isOpening}
                        className={`dota-button w-full h-16 text-xl uppercase font-bold text-[var(--accent)] tracking-widest ${isOpening ? 'opacity-50 grayscale' : ''}`}
                    >
                        {isOpening ? 'ОТКРЫВАЕМ...' : `ОТКРЫТЬ ЗА ${caseData?.price || 100} BP`}
                    </button>
                    {wonReward && (
                        <button
                            onClick={handleReset}
                            className="text-xs text-gray-400 underline uppercase font-bold tracking-widest text-center"
                        >
                            Сбросить рулетку
                        </button>
                    )}
                </div>

                {/* Possible Rewards List */}
                <div className="w-full flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                        <h3 className="text-sm font-bold text-[var(--accent)] uppercase tracking-widest">Содержимое кейса</h3>
                        <span className="text-[10px] text-[var(--primary)] font-bold uppercase">{rewards.length} предметов</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {rewards.map((reward) => (
                            <div key={reward.id} className="dota-card p-3 flex flex-col gap-2 bg-white/[0.02]">
                                <div className={`w-full aspect-square rounded-lg ${RARITY_COLORS[reward.rarity] || 'bg-gray-500'}/20 flex items-center justify-center relative overflow-hidden`}>
                                    {reward.image ? (
                                        <img src={reward.image} alt={reward.name} className="w-2/3 h-2/3 object-contain drop-shadow-lg z-10" />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-md bg-gradient-to-t ${RARITY_COLORS[reward.rarity] || 'bg-gray-500'} to-transparent`} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white leading-tight uppercase truncate">{reward.name}</p>
                                    <p className={`text-[8px] font-bold ${(RARITY_COLORS[reward.rarity] || 'bg-gray-500').replace('bg-', 'text-')} uppercase`}>{reward.rarity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Win Modal Overlay */}
                <AnimatePresence>
                    {wonReward && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.5, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                className="dota-card p-8 flex flex-col items-center text-center gap-6 max-w-xs border-t-4 border-t-[var(--accent)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[var(--accent)]/5" />
                                <div className="absolute top-0 right-0 p-4">
                                    <Sparkles className="text-[var(--accent)] animate-pulse" />
                                </div>
                                <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest leading-none relative z-10">Ты выиграл!</h2>

                                <div className={`w-32 h-32 rounded-2xl ${RARITY_COLORS[wonReward.rarity] || 'bg-gray-500'} shadow-[0_0_40px_${(RARITY_COLORS[wonReward.rarity] || 'bg-gray-500').replace('bg-', '')}] flex items-center justify-center relative z-10`}>
                                    {wonReward.image ? (
                                        <img src={wonReward.image} alt={wonReward.name} className="w-24 h-24 object-contain drop-shadow-2xl" />
                                    ) : (
                                        <Package size={64} className="text-white" />
                                    )}
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{wonReward.name}</h3>
                                    <p className={`font-bold ${(RARITY_COLORS[wonReward.rarity] || 'bg-gray-500').replace('bg-', 'text-')}`}>{wonReward.rarity}</p>
                                </div>
                                <div className="flex gap-2 w-full relative z-10">
                                    <button
                                        onClick={handleSell}
                                        disabled={isSelling}
                                        className="dota-button flex-1 bg-red-900/50 border-red-500/30 text-[10px]"
                                    >
                                        {isSelling ? '...' : `ПРОДАТЬ (+${Math.floor(wonReward.weight / 2) || 10} BP)`}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="dota-button flex-[1.5]"
                                    >
                                        ЗАБРАТЬ
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
