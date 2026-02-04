'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Package, User } from 'lucide-react';
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
        label: 'Инвентарь',
        path: '/inventory',
        icon: Package
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
            <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 pb-6 pt-2 px-6">
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
                                        className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <item.icon
                                    size={24}
                                    className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'
                                        }`}
                                />

                                <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -top-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]"
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
