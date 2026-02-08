'use client';

import { useEffect, useState } from 'react';
import { Package, ClipboardList, Wallet, Sparkles, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCases } from './admin/cases/actions';
import { syncUser } from './actions/user';
import { checkDailyRewardAvailable } from './actions/tasks';
import { useTranslation } from '@/components/LanguageProvider';
import MaintenanceStub from '@/components/MaintenanceStub';
import { useUser } from '@/components/UserContext';

export default function Home() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { user: ctxUser, points: ctxPoints, isAdmin: ctxAdmin, isLoading: ctxLoading } = useUser();
  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState(t.common.connecting);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [featuredCase, setFeaturedCase] = useState<any>(null);
  const [isPrizeAvailable, setIsPrizeAvailable] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  useEffect(() => {
    setIsClient(true);

    async function init() {
      try {
        // 1. Fetch Cases
        const cases = await getCases();
        if (cases && cases.length > 0) {
          setFeaturedCase(cases[0]);
        }

        // 2. State from Context
        const u = ctxUser as any;
        if (u) {
          setPoints(ctxPoints || u.points || 0);
          setIsAdmin(ctxAdmin || u.isAdmin || false);

          // Robust photo mapping
          setPhotoUrl(u.photoUrl || u.photo_url || null);

          // Robust name construction
          const dbUsername = u.username && u.username !== 'undefined' ? u.username : null;
          const fName = (u.firstName || u.first_name || '').toString();
          const lName = (u.lastName || u.last_name || '').toString();
          const cleanFName = fName && fName !== 'undefined' ? fName : '';
          const cleanLName = lName && lName !== 'undefined' ? lName : '';
          const fullName = (cleanFName + (cleanLName ? ' ' + cleanLName : '')).trim();

          setUsername(dbUsername || fullName || 'User');

          // 3. Check Prize availability
          const prizeAvailable = await checkDailyRewardAvailable((u.telegramId || u.id || '').toString());
          setIsPrizeAvailable(prizeAvailable);
          setIsLoadingPoints(false);
        } else if (!ctxLoading) {
          setIsLoadingPoints(false);
        }
      } catch (err) {
        console.error('[Home] Init error:', err);
        setIsLoadingPoints(false);
      }
    }

    init();
  }, [ctxUser, ctxPoints, ctxAdmin, ctxLoading]);

  if (!isClient) return null;

  // RootLayout handles MaintenanceStub for non-admins now

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 pt-[calc(6.5rem+env(safe-area-inset-top))]">
      {/* Header / Profile */}
      <section className="flex items-center justify-between steam-bevel p-4 mx-0">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black text-[var(--foreground)] steam-header-text">
              {username}
            </h1>
            {isPrizeAvailable && (
              <button
                onClick={() => router.push('/tasks')}
                className="steam-bevel bg-[var(--accent)] text-white px-3 py-1 uppercase font-black text-[9px] active:translate-y-[1px] transition-none animate-in fade-in zoom-in"
              >
                🏆 {language === 'ru' ? 'твой приз' : 'your prize'}
              </button>
            )}
          </div>
          <p className="steam-header-text text-[var(--foreground)]/40 text-[9px] mt-0.5 opacity-50">{t.common.status_online}</p>
        </div>
        <div className="w-10 h-10 steam-emboss p-1 flex items-center justify-center overflow-hidden shrink-0 ml-4">
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
        <div className={`text-3xl font-black text-[var(--foreground)] flex items-center gap-2 relative z-10 ${isLoadingPoints ? 'animate-pulse opacity-40' : ''}`}>
          {isLoadingPoints ? '...' : points} <span className="text-[var(--accent)] text-xl">{t.common.bp}</span>
        </div>
        <button
          onClick={() => router.push('/history')}
          className="steam-bevel mt-4 steam-header-text text-[9px] px-4 py-1.5 transition-none relative z-10 bg-[var(--secondary)] text-[var(--foreground)] active:bg-[var(--background)]"
        >
          {t.home.view_transactions}
        </button>
      </motion.div>

      {/* Grid Menu */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/cases"
          prefetch={true}
          className="steam-bevel p-4 flex flex-col items-center gap-3 active:translate-y-[1px] transition-none"
        >
          <div className="w-8 h-8 steam-emboss flex items-center justify-center">
            <Package className="text-[var(--accent)]" size={16} />
          </div>
          <span className="steam-header-text text-[9px] text-[var(--foreground)]">{t.nav.cases}</span>
        </Link>

        <Link
          href="/games"
          prefetch={true}
          className="steam-bevel p-4 flex flex-col items-center gap-3 active:translate-y-[1px] transition-none"
        >
          <div className="w-8 h-8 steam-emboss flex items-center justify-center">
            <Gamepad2 className="text-[var(--accent)]" size={16} />
          </div>
          <span className="steam-header-text text-[9px] text-[var(--foreground)]">{t.nav.games}</span>
        </Link>

        <Link
          href="/tasks"
          prefetch={true}
          className="steam-bevel p-4 flex flex-col items-center gap-3 active:translate-y-[1px] transition-none"
        >
          <div className="w-8 h-8 steam-emboss flex items-center justify-center">
            <ClipboardList className="text-[var(--accent)]" size={16} />
          </div>
          <span className="steam-header-text text-[9px] text-[var(--foreground)]">{t.nav.tasks}</span>
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
            <div className={`w-18 h-18 steam-emboss flex items-center justify-center relative overflow-hidden shrink-0 p-1`}>
              <div className="absolute inset-0 bg-white/5" />
              {featuredCase.image ? (
                <img src={featuredCase.image} alt={featuredCase.name} className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
              ) : (
                <Package size={32} className="text-[var(--accent)]/40 relative z-10" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="steam-header-text text-[var(--foreground)] text-xs tracking-tight">{featuredCase.name}</h3>
              <p className="steam-header-text text-[8px] text-[var(--foreground)]/40">{featuredCase.rarity}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[var(--accent)] font-black text-sm">{featuredCase.price} {t.common.bp}</span>
                <button
                  onClick={() => router.push(`/cases/${featuredCase.id}`)}
                  className="steam-bevel bg-[var(--accent)] text-white px-4 py-1.5 uppercase font-black text-[9px] active:translate-y-[1px] transition-none shadow-[0_0_15px_rgba(150,135,50,0.3)]"
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
