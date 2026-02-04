'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { useTheme } from '@/components/ThemeProvider';

interface PageHeaderProps {
    title: string;
    backPath?: string;
}

export default function PageHeader({ title, backPath }: PageHeaderProps) {
    const { theme } = useTheme();

    return (
        <div className="steam-bevel flex items-center gap-4 py-2 px-4 sticky top-0 z-50 pt-[calc(1rem+env(safe-area-inset-top))] mb-4 mx-2 mt-2">
            {backPath && (
                <Link
                    href={backPath}
                    className="steam-bevel w-6 h-6 flex items-center justify-center text-[var(--foreground)] active:translate-y-[1px] transition-none bg-[var(--background)]"
                >
                    <ChevronLeft size={16} />
                </Link>
            )}
            <h1 className="steam-header-text text-[var(--foreground)] flex-1">{title}</h1>
            {theme === 'classic' && (
                <div className="flex gap-1">
                    <div className="steam-bevel w-5 h-5 bg-[var(--background)] flex items-center justify-center text-[10px] font-bold text-[var(--foreground)] opacity-40">_</div>
                    <div className="steam-bevel w-5 h-5 bg-[var(--background)] flex items-center justify-center text-[10px] font-bold text-[var(--foreground)] opacity-40">[]</div>
                    <div className="steam-bevel w-5 h-5 bg-[var(--background)] flex items-center justify-center text-[10px] font-bold text-[var(--foreground)] opacity-40 text-red-500/50">X</div>
                </div>
            )}
        </div>
    );
}
