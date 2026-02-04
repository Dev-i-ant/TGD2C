'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'classic' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('classic');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load theme from local storage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Default to classic
            document.documentElement.setAttribute('data-theme', 'classic');
        }
        setMounted(true);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
