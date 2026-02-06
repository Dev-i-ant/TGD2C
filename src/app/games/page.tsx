'use client';

import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/components/LanguageProvider';
import { motion } from 'framer-motion';
import { Gamepad2, Swords, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
    const { t } = useTranslation();

    const GAMES = [
        {
            id: 'battle',
            title: t.games.battle,
            desc: t.games.battle_desc,
            icon: Swords,
            path: '/games/battle',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            active: true
        },
        {
            id: 'crash',
            title: 'Crash',
            desc: 'Скоро...',
            icon: Trophy,
            path: '#',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            active: false
        }
    ];

    return (
        <div className="pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))]">
            <PageHeader title={t.games.title} backPath="/" />

            <div className="p-4 flex flex-col gap-4">
                {GAMES.map((game) => (
                    <Link
                        key={game.id}
                        href={game.path}
                        className={`steam-bevel p-6 flex items-center gap-6 relative overflow-hidden active:translate-y-[1px] transition-none ${!game.active ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                    >
                        <div className={`w-16 h-16 steam-emboss flex items-center justify-center ${game.bg}`}>
                            <game.icon className={game.color} size={32} />
                        </div>

                        <div className="flex-1">
                            <h3 className="steam-header-text text-sm text-[var(--foreground)] uppercase mb-1">{game.title}</h3>
                            <p className="steam-header-text text-[9px] text-[var(--foreground)]/40 leading-relaxed uppercase">{game.desc}</p>
                        </div>

                        {game.active && (
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">Live</span>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
