'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { useTheme } from '@/components/ThemeProvider';

import TelegramBackButton from '../TelegramBackButton';

interface PageHeaderProps {
    title: string;
    backPath?: string;
    hideTitle?: boolean;
    isAdmin?: boolean;
    onBack?: () => void;
}

export default function PageHeader({ title, backPath, hideTitle = false, isAdmin = false, onBack }: PageHeaderProps) {
    const { theme } = useTheme();

    return (
        <div className={`flex flex-col gap-4 py-2 px-4 sticky top-0 z-50 mb-4 mx-2 ${isAdmin ? 'pt-[calc(7.5rem+env(safe-area-inset-top))]' : 'pt-[calc(3.5rem+env(safe-area-inset-top))]'}`}>
            <div className="flex items-center gap-4">
                {(backPath || onBack) && (
                    <TelegramBackButton backPath={backPath} onBack={onBack} />
                )}
                {!hideTitle && <h1 className="steam-header-text text-[var(--foreground)] flex-1">{title}</h1>}
                {hideTitle && <div className="flex-1" />}
            </div>
        </div>
    );
}
