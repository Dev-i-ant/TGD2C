'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Swords, Users, Trophy, ChevronRight, LogOut, Bot, Crown } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { getBattleDetail, addBotToBattleAction, joinBattleAction, cancelBattleAction } from '@/app/actions/battle';

// Roulette Constants (consistent with single open but smaller)
const ITEM_WIDTH = 80;
const GAP = 4;
const ITEM_FULL_WIDTH = ITEM_WIDTH + GAP;
const WIN_INDEX = 30;
const TOTAL_ITEMS = 40;

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

export default function BattleRoomPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [battle, setBattle] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Refs for socket listeners to avoid stale closures
    const battleRef = useRef<any>(null);

    // Game State
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentRound, setCurrentRound] = useState(-1);
    const [roundResults, setRoundResults] = useState<any[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [winner, setWinner] = useState<any>(null);

    // Animation States per participant
    const [rollItemsList, setRollItemsList] = useState<any[][]>([]);
    const [targetXList, setTargetXList] = useState<number[]>([]);
    const [rollKeyList, setRollKeyList] = useState<number[]>([]);

    useEffect(() => {
        const socketInstance = io();
        setSocket(socketInstance);

        async function load() {
            const data = await getBattleDetail(id as string);
            if (data) {
                setBattle(data);
                battleRef.current = data;
                setIsLoading(false);

                if (data.status === 'FINISHED') {
                    setIsFinished(true);
                    setWinner(data.participants.find((p: any) => p.id === data.winnerId));
                }
            } else {
                router.push('/games/battle');
            }
        }
        load();

        socketInstance.emit('join-battle', id);

        socketInstance.on('battle-started', () => {
            load();
        });

        socketInstance.on('countdown', ({ seconds }) => {
            setCountdown(seconds);
            if (seconds === 0) {
                setTimeout(() => setCountdown(null), 1000);
            }
        });

        socketInstance.on('round-finished', ({ roundIndex, results }) => {
            setCurrentRound(roundIndex);
            setRoundResults(prev => [...prev, ...results]);

            // Get items from the active case for filler
            const activeCase = battleRef.current?.cases[roundIndex]?.case;
            const caseRewards = activeCase?.rewards || [];

            // Trigger animation for all participants
            const newRollItemsList: any[][] = [];
            const newTargetXList: number[] = [];

            results.forEach((res: any) => {
                const newRollItems = [];

                // Identify high-tier items for "Near-Miss" effect
                const highTierRarities = ['MYTHICAL', 'LEGENDARY', 'ANCIENT', 'IMMORTAL', 'ARCANA'];
                const rareItems = caseRewards.filter((i: any) => highTierRarities.includes(i.rarity));

                for (let i = 0; i < TOTAL_ITEMS; i++) {
                    if (i === WIN_INDEX) {
                        newRollItems.push(res.reward);
                    } else {
                        // Near-miss logic: index +/- 1 or 2
                        const distance = Math.abs(i - WIN_INDEX);
                        const isNearMiss = distance === 1 || distance === 2;

                        if (isNearMiss && rareItems.length > 0 && Math.random() < 0.7) {
                            // High chance to put a rare item near the winning index
                            newRollItems.push(rareItems[Math.floor(Math.random() * rareItems.length)]);
                        } else {
                            // Standard random filler
                            const randomFiller = caseRewards.length > 0
                                ? caseRewards[Math.floor(Math.random() * caseRewards.length)]
                                : { name: '?', rarity: 'RARE' };
                            newRollItems.push(randomFiller);
                        }
                    }
                }
                newRollItemsList.push(newRollItems);

                const randomOffset = Math.floor(Math.random() * 20) - 10;
                newTargetXList.push(-(WIN_INDEX * ITEM_FULL_WIDTH) - (ITEM_WIDTH / 2) + randomOffset);
            });

            setRollItemsList(newRollItemsList);
            setTargetXList(newTargetXList);
            setRollKeyList(prev => [...Array(results.length)].map((_, i) => (prev[i] || 0) + 1));

            // DELAY participant total value update to match animation (6s)
            setTimeout(() => {
                setBattle((prev: any) => {
                    if (!prev) return prev;
                    const newParticipants = [...prev.participants];
                    results.forEach((res: any) => {
                        const pIndex = newParticipants.findIndex(p => p.id === res.participantId);
                        if (pIndex !== -1) {
                            newParticipants[pIndex].totalValue += res.value;
                        }
                    });
                    const updated = { ...prev, participants: newParticipants };
                    battleRef.current = updated;
                    return updated;
                });
            }, 6000);
        });

        socketInstance.on('battle-finished', ({ winner: winnerData, isTie }) => {
            // Server already waits 6.5s for animation, so we show results immediately
            setIsFinished(true);
            const winnerId = typeof winnerData === 'string' ? winnerData : winnerData?.id;
            const foundWinner = battleRef.current?.participants.find((p: any) => p.id === winnerId);
            setWinner(foundWinner || winnerData);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, [id]);

    const handleAddBot = async () => {
        const res = await addBotToBattleAction(id as string);
        if (res.success) {
            const data = await getBattleDetail(id as string);
            setBattle(data);
            battleRef.current = data;
        }
    };

    const handleJoin = async () => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) return;

        const res = await joinBattleAction(tg.initDataUnsafe.user.id.toString(), id as string);
        if (res.success) {
            const data = await getBattleDetail(id as string);
            setBattle(data);
            battleRef.current = data;
        } else {
            alert(res.error);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Отменить баттл? Средства будут возвращены всем игрокам.')) return;

        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) return;

        const res = await cancelBattleAction(id as string, tg.initDataUnsafe.user.id.toString());
        if (res.success) {
            router.push('/games/battle');
        } else {
            alert(res.error);
        }
    };

    if (isLoading || !battle) return <div className="p-10 text-center animate-pulse">{t.common.loading}...</div>;

    const renderParticipantSlot = (p: any, index: number) => {
        const rollItems = rollItemsList[index] || [];
        const targetX = targetXList[index] || 0;
        const rollKey = rollKeyList[index] || 0;
        const isWinner = winner?.id === p.id;

        const isIdle = rollItems.length === 0;
        const activeCaseIdx = Math.min(Math.max(0, currentRound), battle.cases.length - 1);
        const activeCase = battle.cases[activeCaseIdx]?.case;
        const caseRewards = activeCase?.rewards || [];

        let demoItems = [...caseRewards];
        if (demoItems.length === 0) {
            demoItems = Array.from({ length: 20 }).map((_, i) => ({ id: `demo-${i}`, name: '?', rarity: 'RARE' }));
        } else {
            while (demoItems.length < 20) {
                demoItems = [...demoItems, ...caseRewards];
            }
        }

        return (
            <div key={p.id} className="flex h-24 steam-bevel bg-[var(--secondary)]/10 overflow-visible mt-2">
                {/* Left: User Info (1/3) */}
                <div className="w-1/3 p-2 flex flex-col justify-between border-r border-white/5 bg-[var(--secondary)]/20 relative overflow-visible">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-10 h-10 steam-emboss flex items-center justify-center bg-[var(--background)] overflow-hidden relative shadow-inner">
                                {p.isBot ? (
                                    <Bot size={20} className="text-[var(--accent)]" />
                                ) : (
                                    p.user?.photoUrl ? (
                                        <img src={p.user.photoUrl} className="w-full h-full object-cover" />
                                    ) : p.user?.username ? (
                                        <div className="text-xs font-black text-[var(--accent)] uppercase">{p.user.username[0]}</div>
                                    ) : (
                                        <Users size={16} className="opacity-20" />
                                    )
                                )}
                            </div>
                            {isWinner && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-[100] text-yellow-500 animate-bounce">
                                    <Crown size={24} fill="currentColor" stroke="#000" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black uppercase truncate text-white/80">
                                {p.isBot ? 'Bot' : (p.user?.username || 'Player')}
                            </span>
                            <span className="text-[11px] font-black text-[var(--accent)]">{p.totalValue} BP</span>
                        </div>
                    </div>

                    {isWinner && (
                        <div className={`absolute bottom-0 left-0 right-0 ${battle?.isCrazyMode ? 'bg-indigo-600 shadow-[0_-5px_15px_rgba(79,70,229,0.3)]' : 'bg-green-600 shadow-[0_-5px_15px_rgba(22,163,74,0.3)]'} text-white text-[8px] font-black uppercase tracking-[0.2em] py-1 text-center`}>
                            {battle?.isCrazyMode ? 'CRAZY WINNER' : 'WINNER'}
                        </div>
                    )}
                </div>

                {/* Right: Roulette (2/3) */}
                <div className="flex-1 relative overflow-hidden bg-black/40 flex items-center">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[var(--accent)] z-20 opacity-30 shadow-[0_0_8px_var(--accent)]" />

                    <motion.div
                        key={isIdle ? 'idle' : rollKey}
                        initial={isIdle ? { x: 0 } : { x: 0 }}
                        animate={isIdle
                            ? { x: [0, -(demoItems.length * (ITEM_WIDTH + GAP))] }
                            : { x: targetX }
                        }
                        transition={isIdle
                            ? { duration: demoItems.length * 1.5, ease: "linear", repeat: Infinity }
                            : { duration: 6, ease: [0.1, 0, 0.1, 1] }
                        }
                        className="flex gap-1 px-[50%] items-center"
                    >
                        {(isIdle ? [...demoItems, ...demoItems] : rollItems).map((item, i) => {
                            // Ensure each item has a unique visual look if identical items are dropped
                            const itemKey = `${i}-${item.id}`;
                            return (
                                <div key={itemKey} className="w-20 h-20 steam-bevel shrink-0 flex flex-col items-center justify-center p-1 relative overflow-hidden bg-[var(--background)]/40 grayscale-[0.5] hover:grayscale-0 transition-all">
                                    {item.image ? (
                                        <img src={item.image} className="w-12 h-12 object-contain" />
                                    ) : (
                                        <Package size={20} className="opacity-5" />
                                    )}
                                    <span className="text-[6px] font-black uppercase text-center truncate w-full mt-1 text-white/40">{item.name}</span>
                                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${RARITY_COLORS[item.rarity] || 'bg-gray-500'}`} />
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        );
    };

    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    const currentUserTgId = tg?.initDataUnsafe?.user?.id?.toString();
    const isCurrentUserWinner = winner && (
        (winner.userId === currentUserTgId) || (winner.user?.telegramId === currentUserTgId) || (winner.id === currentUserTgId)
    );

    return (
        <div className="pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))] min-h-screen">
            <PageHeader title={t.games.battle} backPath="/games/battle" hideTitle />

            <div className="p-4 flex flex-col gap-6 relative">
                {battle.isCrazyMode && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-black px-4 py-1 uppercase tracking-[0.2em] steam-bevel rounded-b-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] z-[50] flex items-center gap-2 border border-indigo-400/30 whitespace-nowrap">
                        <Swords size={12} className="animate-pulse" />
                        Crazy Mode: Побеждает беднейший!
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Раунд</span>
                        <span className="text-sm font-black text-[var(--foreground)]">{Math.max(0, currentRound + 1)} / {battle.cases.length}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Общая сумма кейсов</span>
                        <span className="text-sm font-black text-[var(--accent)]">{battle.totalPrice * battle.maxParticipants} BP</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {battle.participants.map((p: any, i: number) => renderParticipantSlot(p, i))}

                    {Array.from({ length: battle.maxParticipants - battle.participants.length }).map((_, i) => {
                        const isAlreadyJoined = battle.participants.some((p: any) => p.userId === currentUserTgId);
                        const isCreator = battle.creatorId === currentUserTgId;

                        return (
                            <div key={`empty-${i}`} className="flex h-24 steam-bevel overflow-hidden bg-black/10">
                                <div className="w-1/3 p-2 flex flex-col items-center justify-center gap-2 bg-black/20">
                                    {!isAlreadyJoined && (
                                        <button
                                            onClick={handleJoin}
                                            className="steam-bevel w-full h-8 bg-[var(--accent)] text-white text-[8px] font-black uppercase"
                                        >
                                            Вступить
                                        </button>
                                    )}
                                    <button
                                        onClick={handleAddBot}
                                        className="text-[7px] font-black uppercase opacity-40 hover:opacity-100 flex items-center gap-1"
                                    >
                                        <Bot size={10} /> Бот
                                    </button>
                                    {isCreator && (
                                        <button
                                            onClick={handleCancel}
                                            className="text-[7px] font-black uppercase text-red-500/60 hover:text-red-500 mt-1"
                                        >
                                            Отменить
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 relative overflow-hidden bg-black/5 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                        <Users size={24} />
                                        <span className="text-[7px] font-black uppercase tracking-[0.2em]">{t.games.waiting_players}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4 items-center mt-8 pb-10"
                    >


                        <button
                            onClick={() => router.push('/games/battle')}
                            className="steam-bevel w-full h-16 bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center gap-3 uppercase font-black text-[12px] tracking-[0.2em] active:translate-y-[1px] shadow-2xl mt-4 border border-white/10 hover:bg-[var(--secondary)]/80 transition-all"
                        >
                            <LogOut size={20} />
                            {t.games.exit_game}
                        </button>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {countdown !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center"
                    >
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="text-8xl font-black text-[var(--accent)] drop-shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]"
                        >
                            {countdown === 0 ? 'START' : countdown}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
