'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Package, User, Users, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from '@/components/LanguageProvider';
import { useUser } from '@/components/UserContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { isAdmin } = useUser();

    if (!isAdmin) return null;

    const NAV_ITEMS = [
        { label: t.nav.home, path: '/', icon: Home },
        { label: t.nav.cases, path: '/cases', icon: Grid },
        { label: t.nav.games, path: '/games', icon: Gamepad2 },
        { label: t.friends.title, path: '/friends', icon: Users },
        { label: t.nav.profile, path: '/profile', icon: User }
    ];

    if (theme === 'dark') {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2 px-6">
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
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="max-w-md mx-auto">
                <div className="steam-bevel bg-[var(--background)] px-2 py-2 flex items-center justify-between shadow-2xl">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.path === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex flex-col items-center justify-center w-[18%] h-12 gap-1 active:translate-y-[1px] transition-none ${isActive ? 'steam-emboss bg-[var(--secondary)]' : 'steam-bevel bg-[var(--background)] opacity-60 hover:opacity-100'}`}
                            >
                                <item.icon
                                    size={18}
                                    className={`transition-none ${isActive ? 'text-[var(--accent)]' : 'text-[var(--foreground)]/40'}`}
                                />

                                <span className="steam-header-text text-[8px] transition-none">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
