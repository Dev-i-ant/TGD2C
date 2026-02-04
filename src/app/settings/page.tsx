'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { Link2, Save, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
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
            <PageHeader title="Настройки" />

            <div className="p-6 flex flex-col gap-8">
                {/* Info Box */}
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 text-blue-400">
                    <ShieldCheck className="shrink-0" size={20} />
                    <p className="text-[10px] uppercase font-black leading-normal">Твоя ссылка на обмен нужна для автоматической отправки выигранных предметов в Steam.</p>
                </div>

                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Steam Trade URL</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                            <Link2 size={20} />
                        </div>
                        <input
                            type="text"
                            value={tradeUrl}
                            onChange={(e) => setTradeUrl(e.target.value)}
                            placeholder="https://steamcommunity.com/tradeoffer/new/..."
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-base focus:border-red-500/50 focus:bg-white/[0.08] transition-all outline-none"
                        />
                    </div>

                    <a
                        href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 font-bold uppercase"
                    >
                        Где найти мою ссылку? <ExternalLink size={10} />
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
                            <span>СОХРАНЕНО</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>СОХРАНИТЬ ИЗМЕНЕНИЯ</span>
                        </>
                    )}
                </button>

                {/* Note */}
                <p className="text-[10px] text-gray-600 text-center font-bold uppercase leading-relaxed px-4">
                    Внимание: Ссылка на обмен должна быть публичной, чтобы бот смог отправить вам предмет.
                </p>
            </div>
        </div>
    );
}
