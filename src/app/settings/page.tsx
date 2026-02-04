'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Link2, Save, ExternalLink, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';

export default function SettingsPage() {
    const { t, language, setLanguage } = useTranslation();
    const [tradeUrl, setTradeUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="pb-24">
            <PageHeader title={t.settings.title} />

            <div className="p-6 flex flex-col gap-8">
                {/* Language Switcher */}
                <div className="flex flex-col gap-4">
                    <label className="steam-header-text text-xs text-[var(--accent)] px-2">{t.settings.language}</label>
                    <div className="steam-bevel p-1 bg-black/20 flex gap-1">
                        <button
                            onClick={() => setLanguage('ru')}
                            className={`flex-1 py-3 text-xs font-black uppercase transition-all ${language === 'ru' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            РУССКИЙ
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex-1 py-3 text-xs font-black uppercase transition-all ${language === 'en' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            ENGLISH
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl p-4 flex gap-3 text-[var(--accent)]">
                    <ShieldCheck className="shrink-0" size={20} />
                    <p className="text-[10px] uppercase font-black leading-normal">{t.settings.trade_url_hint}</p>
                </div>

                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <label className="steam-header-text text-xs text-[var(--accent)] px-2">{t.settings.trade_url_label}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 group-focus-within:text-[var(--accent)] transition-colors">
                            <Link2 size={20} />
                        </div>
                        <input
                            type="text"
                            value={tradeUrl}
                            onChange={(e) => setTradeUrl(e.target.value)}
                            placeholder="https://steamcommunity.com/tradeoffer/new/..."
                            className="w-full h-14 bg-[var(--background)] border border-[var(--border)] rounded-xl pl-12 pr-4 text-[var(--foreground)] text-base focus:border-[var(--accent)]/50 focus:bg-[var(--secondary)]/50 transition-all outline-none placeholder:text-[var(--foreground)]/20"
                        />
                    </div>

                    <a
                        href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors flex items-center justify-center gap-1.5 font-bold uppercase"
                    >
                        {t.settings.find_url} <ExternalLink size={10} />
                    </a>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`dota-button h-16 w-full flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 grayscale' : ''}`}
                >
                    {isSaving ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : status === 'success' ? (
                        <>
                            <ShieldCheck size={20} />
                            <span>{t.settings.saved}</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>{t.settings.save_changes}</span>
                        </>
                    )}
                </button>

                {/* Note */}
                <p className="text-[10px] text-[var(--foreground)]/30 text-center font-bold uppercase leading-relaxed px-4">
                    {t.settings.public_note}
                </p>
            </div>
        </div>
    );
}
