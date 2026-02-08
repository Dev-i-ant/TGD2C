'use client';

import { motion } from 'framer-motion';
import { Hammer, Lock, UserPlus } from 'lucide-react';
import { useTranslation } from './LanguageProvider';

export default function MaintenanceStub() {
    const { t, language } = useTranslation();

    const isRu = language === 'ru';

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center gap-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 steam-emboss flex items-center justify-center bg-[var(--accent)]/10"
            >
                <Hammer className="text-[var(--accent)]" size={48} />
            </motion.div>

            <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-black steam-header-text uppercase tracking-wider text-[var(--foreground)]">
                    {isRu ? 'Бот в разработке' : 'Bot Under Construction'}
                </h1>
                <p className="steam-header-text text-sm text-[var(--foreground)]/60 leading-relaxed">
                    {isRu
                        ? 'Мы работаем над улучшением сервиса. Сейчас доступ открыт только для участников демо-теста.'
                        : 'We are working on improving the service. Access is currently limited to demo testers only.'}
                </p>
            </div>

            <div className="steam-bevel p-6 bg-[var(--secondary)]/50 border-[var(--accent)]/20 border flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 steam-emboss flex items-center justify-center shrink-0">
                        <UserPlus className="text-[var(--accent)]" size={20} />
                    </div>
                    <div>
                        <h3 className="steam-header-text text-[10px] uppercase font-black text-[var(--foreground)]">
                            {isRu ? 'Хотите поучаствовать?' : 'Want to participate?'}
                        </h3>
                        <p className="steam-header-text text-[9px] text-[var(--foreground)]/40 mt-0.5">
                            {isRu ? 'Запросите доступ у администратора' : 'Request access from the administrator'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 steam-emboss flex items-center justify-center shrink-0">
                        <Lock className="text-[var(--accent)]" size={20} />
                    </div>
                    <div>
                        <h3 className="steam-header-text text-[10px] uppercase font-black text-[var(--foreground)]">
                            {isRu ? 'Админ-контроль' : 'Admin Control'}
                        </h3>
                        <p className="steam-header-text text-[9px] text-[var(--foreground)]/40 mt-0.5">
                            {isRu ? 'После назначения вы получите полный доступ' : 'You will get full access after being assigned'}
                        </p>
                    </div>
                </div>
            </div>

            <a
                href="https://t.me/Dev_i_ant"
                target="_blank"
                className="steam-bevel bg-[var(--accent)] text-white px-8 py-3 uppercase font-black text-xs active:translate-y-[1px] transition-none shadow-[0_0_20px_rgba(150,135,50,0.2)]"
            >
                {isRu ? 'Связаться с разработчиком' : 'Contact Developer'}
            </a>
        </div>
    );
}
