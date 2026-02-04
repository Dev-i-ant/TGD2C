'use client';

import { useEffect, useState } from 'react';
import { Package, ClipboardList, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCases } from './admin/cases/actions';
import { syncUser } from './actions/user';
import { useTranslation } from '@/components/LanguageProvider';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState(t.common.loading);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [featuredCase, setFeaturedCase] = useState<any>(null);

  useEffect(() => {
    async function init() {
      // 1. Fetch Cases
      const cases = await getCases();
      if (cases && cases.length > 0) {
        setFeaturedCase(cases[0]);
      }

      // 2. Sync User with DB
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;
        if (user) {
          setPhotoUrl(user.photo_url || null);

          // Failsafe: check both initData and URL search params
          const urlParams = new URLSearchParams(window.location.search);
          const referralCode = tg.initDataUnsafe?.start_param || urlParams.get('startapp') || urlParams.get('start');

          const result = await syncUser({
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            referralCode: referralCode
          });
          if (result.success && result.user) {
            setPoints(result.user.points);
            setUsername(`${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`);
          }
        }
      }
    }
    init();
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 pt-[calc(7rem+env(safe-area-inset-top))]">
      {/* Header / Profile */}
      <section className="flex items-center justify-between steam-bevel p-4 mx-0">
        <div>
          <h1 className="text-sm font-black text-[var(--foreground)] steam-header-text">
            {username}
          </h1>
          <p className="steam-header-text text-[var(--foreground)]/40 text-[9px] mt-0.5 opacity-50">{t.common.status_online}</p>
        </div>
        <div className="w-10 h-10 steam-emboss p-1 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={username} className="w-full h-full object-cover grayscale-[0.2]" />
          ) : (
            <div className="bg-[var(--accent)]/20 w-full h-full flex items-center justify-center">
              <Sparkles className="text-[var(--accent)]" size={20} />
            </div>
          )}
        </div>
      </section>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="steam-emboss p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none flex gap-1 items-end p-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-1 bg-[var(--accent)]" style={{ height: `${Math.random() * 100}%` }} />
          ))}
        </div>
        <span className="steam-header-text text-[var(--foreground)]/40 text-[9px] relative z-10">{t.home.network_balance}</span>
        <div className="text-3xl font-black text-[var(--foreground)] flex items-center gap-2 relative z-10">
          {points} <span className="text-[var(--accent)] text-xl">{t.common.bp}</span>
        </div>
        <button
          onClick={() => router.push('/history')}
          className="steam-bevel mt-4 steam-header-text text-[9px] px-4 py-1.5 transition-none relative z-10"
        >
          {t.home.view_transactions}
        </button>
      </motion.div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/cases"
          prefetch={true}
          className="steam-bevel p-6 flex flex-col items-center gap-3 active:translate-y-[1px] transition-none"
        >
          <div className="w-10 h-10 steam-emboss flex items-center justify-center">
            <Package className="text-[var(--accent)]" size={20} />
          </div>
          <span className="steam-header-text text-[10px] text-[var(--foreground)]">{t.nav.cases}</span>
        </Link>

        <Link
          href="/tasks"
          prefetch={true}
          className="steam-bevel p-6 flex flex-col items-center gap-3 active:translate-y-[1px] transition-none"
        >
          <div className="w-10 h-10 steam-emboss flex items-center justify-center">
            <ClipboardList className="text-[var(--accent)]" size={20} />
          </div>
          <span className="steam-header-text text-[10px] text-[var(--foreground)]">{t.nav.tasks}</span>
        </Link>
      </div>

      {featuredCase && (
        <section className="flex flex-col gap-2">
          <div className="steam-bevel px-3 py-1 bg-[var(--secondary)]">
            <h2 className="steam-header-text text-[9px] text-[var(--foreground)] px-1">
              {t.home.recommended}
            </h2>
          </div>
          <div className="steam-bevel p-2 flex gap-4 items-center">
            <div className={`w-16 h-16 steam-emboss flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/5" />
              <Package size={32} className="text-[var(--accent)]/40 relative z-10" />
            </div>
            <div className="flex-1">
              <h3 className="steam-header-text text-[var(--foreground)] text-xs tracking-tight">{featuredCase.name}</h3>
              <p className="steam-header-text text-[8px] text-[var(--foreground)]/40">{featuredCase.rarity}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[var(--accent)] font-black text-sm">{featuredCase.price} {t.common.bp}</span>
                <button
                  onClick={() => router.push(`/cases/${featuredCase.id}`)}
                  className="steam-bevel bg-[var(--background)] text-[var(--foreground)] px-4 py-1.5 uppercase font-black text-[9px] active:translate-y-[1px] transition-none"
                >
                  {t.common.open}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
