'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Package, User, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    {
        label: 'Главная',
        path: '/',
        icon: Home
    },
    {
        label: 'Кейсы',
        path: '/cases',
        icon: Grid
    },
    {
        label: 'Друзья',
        path: '/friends',
        icon: Users
    },
    {
        label: 'Профиль',
        path: '/profile',
        icon: User
    }
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Gradient Fade Top */}
            <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

            <div className="bg-[var(--background)]/95 backdrop-blur-md border-t border-[var(--border)] pb-6 pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between max-w-md mx-auto relative">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.path === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="relative flex flex-col items-center justify-center w-16 h-14 gap-1 group"
                            >
                                {/* Active Indicator Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute inset-0 bg-[var(--accent)]/10 blur-xl rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <item.icon
                                    size={24}
                                    className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--primary)] group-hover:text-[var(--primary)]/80'
                                        }`}
                                />

                                <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--primary)] group-hover:text-[var(--foreground)]'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -top-1 w-1 h-1 bg-[var(--accent)] rounded-full shadow-[0_0_5px_var(--accent)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
