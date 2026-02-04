'use client';

import { useEffect } from 'react';

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // 1. Initialize Telegram WebApp features
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            // Request fullscreen (hides header completely on supported devices)
            if (tg.requestFullscreen) {
                tg.requestFullscreen();
            }

            // Set header color to match app background
            if (tg.setHeaderColor) {
                tg.setHeaderColor('#0b0e11');
            }
            if (tg.setBackgroundColor) {
                tg.setBackgroundColor('#0b0e11');
            }

            if (tg.disableVerticalSwipes) {
                tg.disableVerticalSwipes();
            }
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
