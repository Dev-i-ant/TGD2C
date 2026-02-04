import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Dota 2 Case Opening TMA",
  description: "Open cases and win rewards for Dota 2",
};

import BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import TelegramProvider from "@/components/TelegramProvider";

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
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <TelegramProvider>
              <main className="max-w-md mx-auto min-h-screen relative pb-28">
                {children}
                <BottomNav />
              </main>
            </TelegramProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
