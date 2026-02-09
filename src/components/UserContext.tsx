'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncUser } from '@/app/actions/user';
import { SUPER_ADMINS } from '@/lib/constants';

interface UserContextType {
    isAdmin: boolean;
    points: number;
    isLoading: boolean;
    user: any | null;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [points, setPoints] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);

    const refreshUser = async () => {
        if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp) {
            setIsLoading(false);
            return;
        }

        const tg = (window as any).Telegram.WebApp;
        const tgUser = tg.initDataUnsafe?.user;

        if (tgUser) {
            const isSuperAdmin = SUPER_ADMINS.includes(tgUser.id.toString());
            const initialUser = {
                telegramId: tgUser.id.toString(),
                username: tgUser.username,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                photoUrl: tgUser.photo_url,
                points: points || 0,
                isAdmin: isSuperAdmin || isAdmin
            };
            if (isSuperAdmin) setIsAdmin(true);
            setUser(initialUser);

            try {
                const result = await syncUser({
                    telegramId: tgUser.id.toString(),
                    username: tgUser.username,
                    firstName: tgUser.first_name,
                    lastName: tgUser.last_name,
                    photoUrl: tgUser.photo_url,
                });

                if (result.success && result.user) {
                    setIsAdmin(result.user.isAdmin);
                    setPoints(result.user.points);
                    // Priority 2: Full state from database
                    setUser(result.user);
                }
            } catch (error) {
                console.error('[UserContext] Failed to sync user:', error);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ isAdmin, points, isLoading, user, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
