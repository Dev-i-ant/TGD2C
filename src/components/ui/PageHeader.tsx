'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
    title: string;
    backPath?: string;
}

export default function PageHeader({ title, backPath }: PageHeaderProps) {
    return (
        <div className="flex items-center gap-4 py-4 px-6 border-b border-[var(--border)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-50 pt-[calc(6rem+env(safe-area-inset-top))]">
            {backPath && (
                <Link
                    href={backPath}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--foreground)] hover:bg-white/10 active:scale-90 transition-all"
                >
                    <ChevronLeft size={20} />
                </Link>
            )}
            <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
        </div>
    );
}
