'use client';

import { useEffect, useState } from 'react';
import { Package, ClipboardList, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCases } from './admin/cases/actions';
import { syncUser } from './actions/user';

export default function Home() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState('Игрок');
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
          const result = await syncUser({
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name
          });
          if (result.success) {
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
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Привет, {username} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-gray-400 text-sm">Готов открыть пару кейсов?</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="text-red-500" />
          )}
        </div>
      </section>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dota-card p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={80} />
        </div>
        <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">Твой баланс</span>
        <div className="text-4xl font-black text-white flex items-center gap-2">
          {points} <span className="text-red-500 text-2xl">BP</span>
        </div>
        <button
          onClick={() => router.push('/history')}
          className="mt-4 text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
        >
          История транзакций
        </button>
      </motion.div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/cases"
          prefetch={true}
          className="dota-card p-6 flex flex-col items-center gap-3 hover:border-red-500/50 transition-colors pointer-events-auto active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center">
            <Package className="text-red-500" />
          </div>
          <span className="font-bold text-white uppercase text-xs tracking-widest">Кейсы</span>
        </Link>

        <Link
          href="/tasks"
          prefetch={true}
          className="dota-card p-6 flex flex-col items-center gap-3 hover:border-blue-500/50 transition-colors pointer-events-auto active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <ClipboardList className="text-blue-500" />
          </div>
          <span className="font-bold text-white uppercase text-xs tracking-widest">Задания</span>
        </Link>
      </div>

      {/* Featured Case teaser */}
      {featuredCase && (
        <section className="mt-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Рекомендуемое
          </h2>
          <div className="dota-card p-4 flex gap-4 items-center">
            <div className={`w-20 h-20 bg-gradient-to-t ${featuredCase.color}/40 to-transparent rounded-lg flex items-center justify-center border border-white/10`}>
              <Package size={40} className="text-white/40" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white uppercase text-sm tracking-tight">{featuredCase.name}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{featuredCase.rarity}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-red-500 font-black">{featuredCase.price} BP</span>
                <button
                  onClick={() => router.push(`/cases/${featuredCase.id}`)}
                  className="text-[10px] bg-red-600 px-4 py-1.5 rounded-lg uppercase font-black active:scale-95 transition-transform"
                >
                  Открыть
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
