'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TelegramBackButtonProps {
    backPath?: string;
    onBack?: () => void;
}

export default function TelegramBackButton({ backPath, onBack }: TelegramBackButtonProps) {
    const router = useRouter();

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg || !tg.BackButton) return;

        const backButton = tg.BackButton;

        const handleClick = () => {
            if (onBack) {
                onBack();
            } else if (backPath) {
                router.push(backPath);
            } else {
                router.back();
            }
        };

        backButton.show();
        backButton.onClick(handleClick);

        return () => {
            backButton.hide();
            backButton.offClick(handleClick);
        };
    }, [router, backPath, onBack]);

    return null;
}
