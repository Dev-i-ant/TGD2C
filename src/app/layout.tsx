import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

// Using system fonts to avoid build failures in restricted networks

export const metadata: Metadata = {
  title: "back-loot.ru",
  description: "Верни свою удачу — кейсы Dota 2",
};

import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import TelegramProvider from "@/components/TelegramProvider";
import { UserProvider } from "@/components/UserContext";
import AppContent from "./AppContent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <TelegramProvider>
              <UserProvider>
                <main className="max-w-md mx-auto min-h-screen relative">
                  <AppContent>
                    {children}
                  </AppContent>
                </main>
              </UserProvider>
            </TelegramProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
