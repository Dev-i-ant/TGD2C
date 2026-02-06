'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Trophy, SwatchBook, Swords, Package, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getActiveBattles, createBattleAction, getBattleHistory } from '@/app/actions/battle';
import { getCases } from '@/app/admin/cases/actions';

export default function BattleListPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [battles, setBattles] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [cases, setCases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Creation State
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [isCrazyMode, setIsCrazyMode] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        async function load() {
            const [battleData, historyData, caseData] = await Promise.all([
                getActiveBattles(),
                getBattleHistory(),
                getCases()
            ]);
            setBattles(battleData);
            setHistory(historyData);
            setCases(caseData);
            setIsLoading(false);
        }
        load();

        // Refresh every 5 seconds for lobby feel
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async () => {
        if (selectedCases.length === 0 || isCreating) return;

        setIsCreating(true);
        const tg = (window as any).Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
            alert('User not found');
            setIsCreating(false);
            return;
        }

        const result = await createBattleAction(
            tg.initDataUnsafe.user.id.toString(),
            selectedCases,
            maxPlayers,
            isCrazyMode
        );

        if (result.success) {
            router.push(`/games/battle/${result.battleId}`);
        } else {
            alert(result.error);
        }
        setIsCreating(false);
    };

    const addCase = (id: string) => {
        setSelectedCases(prev => [...prev, id]);
    }

    const removeCaseById = (id: string) => {
        setSelectedCases(prev => {
            const index = prev.lastIndexOf(id);
            if (index === -1) return prev;
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    }

    const groupedSelected = selectedCases.reduce((acc: any[], id) => {
        const existing = acc.find(item => item.id === id);
        if (existing) {
            existing.count++;
        } else {
            acc.push({ id, count: 1 });
        }
        return acc;
    }, []);

    const totalBattlePrice = selectedCases.reduce((sum, id) => {
        const c = cases.find(v => v.id === id);
        return sum + (c?.price || 0);
    }, 0);

    if (isLoading) return <div className="p-10 text-center animate-pulse">{t.common.loading}...</div>;

    return (
        <div className="pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))]">
            <PageHeader title={t.games.battle} backPath="/games" />

            <div className="p-4 flex flex-col gap-4">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="steam-bevel p-4 w-full bg-[var(--accent)] text-white flex items-center justify-center gap-2 active:translate-y-[1px] transition-none"
                >
                    <Plus size={18} />
                    <span className="steam-header-text text-[10px] font-black uppercase tracking-[0.2em]">{t.games.create_battle}</span>
                </button>

                <div className="flex flex-col gap-2">
                    <div className="steam-bevel px-3 py-1 bg-[var(--secondary)]">
                        <h2 className="steam-header-text text-[9px] text-[var(--foreground)] opacity-50 uppercase tracking-widest">{t.games.active_battles}</h2>
                    </div>

                    {battles.length === 0 ? (
                        <div className="p-10 text-center steam-header-text text-[10px] opacity-20 uppercase">Никто не сражается...</div>
                    ) : (
                        battles.map((battle) => (
                            <div key={battle.id} className="steam-bevel p-4 flex items-center justify-between gap-4 relative">
                                {battle.isCrazyMode && (
                                    <div className="absolute -top-1 right-2 bg-indigo-600 text-white text-[7px] font-black px-2 py-0.5 uppercase tracking-widest steam-bevel-sm rotate-1">
                                        Crazy Mode
                                    </div>
                                )}
                                <div className="flex -space-x-3">
                                    {battle.participants.map((p: any, i: number) => (
                                        <div key={i} className="w-8 h-8 steam-emboss bg-[var(--background)] flex items-center justify-center overflow-hidden border border-black/20 relative shadow-lg">
                                            {p.user?.photoUrl ? (
                                                <img src={p.user.photoUrl} className="w-full h-full object-cover" />
                                            ) : p.user?.username ? (
                                                <div className="text-[10px] font-black text-[var(--accent)] uppercase">{p.user.username[0]}</div>
                                            ) : (
                                                <Users size={14} className="opacity-20" />
                                            )}
                                        </div>
                                    ))}
                                    {Array.from({ length: battle.maxParticipants - battle.participants.length }).map((_, i) => (
                                        <div key={i} className="w-8 h-8 steam-emboss bg-black/10 flex items-center justify-center border border-dashed border-white/10 opacity-30">
                                            <span className="text-[10px]">+</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1 flex flex-col gap-1 items-end pr-4 border-r border-white/5">
                                    <div className="flex gap-1 overflow-x-auto max-w-[120px] hide-scrollbar items-center">
                                        {battle.cases.reduce((acc: any[], curr: any) => {
                                            const last = acc[acc.length - 1];
                                            if (last && last.case.id === curr.case.id) {
                                                last.count++;
                                            } else {
                                                acc.push({ case: curr.case, count: 1 });
                                            }
                                            return acc;
                                        }, []).map((g: any, i: number) => (
                                            <div key={i} className="flex items-center gap-0.5 relative shrink-0">
                                                <img src={g.case.image} className="w-4 h-4 object-contain opacity-80" />
                                                {g.count > 1 && (
                                                    <span className="text-[7px] font-black text-[var(--foreground)] bg-[var(--accent)] px-1 steam-bevel-sm">x{g.count}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--accent)]">{battle.totalPrice} {t.common.bp}</span>
                                </div>

                                <button
                                    onClick={() => router.push(`/games/battle/${battle.id}`)}
                                    className="steam-bevel h-12 px-4 bg-[var(--secondary)] text-[var(--foreground)] uppercase font-black text-[9px] active:translate-y-[1px] transition-none"
                                >
                                    {t.games.join}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Battle History */}
                <div className="flex flex-col gap-2 mt-4">
                    <div className="steam-bevel px-3 py-1 bg-[var(--secondary)] flex items-center gap-2">
                        <Trophy size={12} className="text-yellow-500 opacity-50" />
                        <h2 className="steam-header-text text-[9px] text-[var(--foreground)] opacity-50 uppercase tracking-widest">Кейс баттлы: История</h2>
                    </div>

                    {history.length === 0 ? (
                        <div className="p-10 text-center steam-header-text text-[10px] opacity-10 uppercase tracking-widest">История пуста...</div>
                    ) : (
                        history.map((battle) => (
                            <div key={battle.id} className="steam-bevel p-3 flex items-center justify-between gap-4 grayscale-[0.6] opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer relative" onClick={() => router.push(`/games/battle/${battle.id}`)}>
                                {battle.isCrazyMode && (
                                    <div className="absolute top-0 right-2 bg-indigo-900/40 text-indigo-400 text-[6px] font-black px-1.5 py-0.5 uppercase tracking-widest steam-bevel-sm">
                                        Crazy
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {(() => {
                                            const v = battle.participants.find((p: any) => p.id === battle.winnerId);
                                            return (
                                                <div className="w-10 h-10 steam-emboss bg-[var(--background)] flex items-center justify-center overflow-hidden border border-black/20 ring-1 ring-yellow-500/30 relative shadow-lg">
                                                    {v?.user?.photoUrl ? (
                                                        <img src={v.user.photoUrl} className="w-full h-full object-cover" />
                                                    ) : v?.user?.username ? (
                                                        <div className="text-xs font-black uppercase text-yellow-500">{v.user.username[0]}</div>
                                                    ) : (
                                                        <Users size={16} className="opacity-10" />
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        <div className="absolute -top-2.5 -right-1.5 text-yellow-500 rotate-12 drop-shadow-md">
                                            <Crown size={14} fill="currentColor" stroke="#000" strokeWidth={1} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black opacity-30 uppercase tracking-widest leading-none mb-0.5">Победитель</span>
                                        <span className="text-[10px] font-black text-white/90 uppercase truncate max-w-[80px]">
                                            {battle.participants.find((p: any) => p.id === battle.winnerId)?.user?.username || 'Bot'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-l border-white/5 pl-4 flex-1">
                                    <div className="flex gap-1.5 items-center">
                                        {battle.cases.reduce((acc: any[], curr: any) => {
                                            const last = acc[acc.length - 1];
                                            if (last && last.case.id === curr.case.id) {
                                                last.count++;
                                            } else {
                                                acc.push({ case: curr.case, count: 1 });
                                            }
                                            return acc;
                                        }, []).map((g: any, i: number) => (
                                            <div key={i} className="flex items-center gap-0.5 relative shrink-0">
                                                <img src={g.case.image} className="w-6 h-6 object-contain drop-shadow-md" />
                                                {g.count > 1 && (
                                                    <span className="text-[8px] font-black text-white bg-[var(--accent)] px-1 steam-bevel-sm">x{g.count}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black opacity-30 uppercase tracking-widest leading-none mb-0.5">Стоимость</span>
                                        <span className="text-[11px] font-black text-[var(--accent)] whitespace-nowrap">{battle.totalPrice} BP</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
                                    <Trophy size={14} className="text-yellow-600/40" />
                                    <span className="text-[7px] font-black uppercase tracking-tighter opacity-40">Завершен</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Battle Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="steam-bevel p-6 w-full max-w-sm flex flex-col gap-4"
                        >
                            <h2 className="steam-header-text text-xs text-[var(--foreground)] uppercase mb-2 tracking-[0.2em]">{t.games.create_battle}</h2>

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] uppercase font-black opacity-40">Число игроков</label>
                                <div className="flex gap-2">
                                    {[2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setMaxPlayers(num)}
                                            className={`steam-bevel flex-1 h-10 steam-header-text text-[10px] ${maxPlayers === num ? 'bg-[var(--accent)] text-white' : 'bg-[var(--secondary)] text-white/40'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] uppercase font-black opacity-40">Выбранные кейсы ({selectedCases.length})</label>
                                    <span className="text-[9px] font-black text-[var(--accent)] uppercase">{totalBattlePrice} BP</span>
                                </div>

                                {/* Selected Rounds List */}
                                <div className="h-24 steam-emboss bg-black/20 flex gap-2 items-center px-4 overflow-x-auto hide-scrollbar">
                                    {selectedCases.length === 0 ? (
                                        <span className="text-[8px] uppercase font-black opacity-20 w-full text-center">Выбери кейс ниже...</span>
                                    ) : (
                                        groupedSelected.map((g, i) => {
                                            const c = cases.find(v => v.id === g.id);
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => removeCaseById(g.id)}
                                                    className="w-14 h-14 steam-bevel bg-[var(--secondary)] shrink-0 flex items-center justify-center p-1 relative group cursor-pointer"
                                                >
                                                    <img src={c?.image} className="w-full h-full object-contain" />
                                                    {g.count > 1 && (
                                                        <div className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-[8px] font-black px-1.5 py-0.5 steam-bevel-sm shadow-xl z-10">
                                                            x{g.count}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-black">×</div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto px-1 custom-scrollbar mt-2">
                                    {cases.map(c => {
                                        const count = selectedCases.filter(id => id === c.id).length;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => addCase(c.id)}
                                                className="steam-bevel p-2 flex flex-col items-center gap-2 relative bg-[var(--secondary)] opacity-80 hover:opacity-100 active:scale-95 transition-all"
                                            >
                                                {count > 0 && (
                                                    <div className="absolute top-1 right-1 bg-[var(--accent)] text-white text-[7px] font-black px-1 py-0.5 steam-bevel-sm z-10">
                                                        {count}
                                                    </div>
                                                )}
                                                <img src={c.image} className="w-10 h-10 object-contain" />
                                                <span className="text-[8px] font-black uppercase text-center truncate w-full">{c.name}</span>
                                                <span className="text-[7px] font-black text-[var(--accent)]">{c.price} BP</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 p-3 steam-emboss bg-indigo-500/5 border border-indigo-500/10">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] uppercase font-black text-indigo-400">Crazy Mode</label>
                                    <button
                                        onClick={() => setIsCrazyMode(!isCrazyMode)}
                                        className={`w-10 h-5 steam-bevel transition-all relative ${isCrazyMode ? 'bg-indigo-500' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 bottom-1 w-3 bg-white transition-all ${isCrazyMode ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[7px] leading-tight opacity-40 uppercase font-black tracking-tight">В этом режиме побеждает тот, кто собрал самый дешевый инвентарь к концу баттла.</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleCreate}
                                    disabled={selectedCases.length === 0 || isCreating}
                                    className="steam-bevel h-12 bg-[var(--accent)] text-white uppercase font-black text-[10px] tracking-[0.2em] transition-none disabled:opacity-50"
                                >
                                    {isCreating ? 'Создание...' : t.common.confirm}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedCases([]);
                                    }}
                                    className="steam-header-text text-[8px] uppercase opacity-40 py-2"
                                >
                                    {t.common.cancel}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
