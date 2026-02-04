'use client';

import { useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    useEffect(() => {
        // Match Telegram UI colors with ThemeProvider / globals.css
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const bgColor = theme === 'classic' ? '#1b1e1b' : '#0b0e11';

            if (tg.setHeaderColor) tg.setHeaderColor(bgColor);
            if (tg.setBackgroundColor) tg.setBackgroundColor(bgColor);
        }
    }, [theme]);

    useEffect(() => {
        // 1. Initialize Telegram WebApp features
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        // Safe checks for newer Telegram API versions (>= 7.x)
        try {
            if (tg.isVersionAtLeast('7.0')) {
                if (tg.requestFullscreen) tg.requestFullscreen();
                if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
            }
        } catch (e) {
            console.warn('Advanced Telegram features not supported on this version', e);
        }

        // 2. Strictly block pinch-to-zoom gestures
        const preventZoom = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        const preventGesture = (e: any) => {
            e.preventDefault();
        };

        // Passive: false is required to actually preventDefault
        document.addEventListener('touchstart', preventZoom, { passive: false });
        document.addEventListener('touchmove', preventZoom, { passive: false });
        // @ts-ignore
        document.addEventListener('gesturestart', preventGesture, { passive: false });
        // @ts-ignore
        document.addEventListener('gesturechange', preventGesture, { passive: false });
        // @ts-ignore
        document.addEventListener('gestureend', preventGesture, { passive: false });

        return () => {
            document.removeEventListener('touchstart', preventZoom);
            document.removeEventListener('touchmove', preventZoom);
            document.removeEventListener('gesturestart', preventGesture);
            document.removeEventListener('gesturechange', preventGesture);
            document.removeEventListener('gestureend', preventGesture);
        };
    }, []);

    return <>{children}</>;
}
