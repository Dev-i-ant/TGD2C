'use client';

import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Users, ExternalLink } from 'lucide-react';

const DEMO_TASKS = [
    { id: '1', title: 'Подписка на канал', reward: 50, icon: Send, description: 'Подпишись на наш основной канал новостей' },
    { id: '2', title: 'Пригласить друга', reward: 100, icon: Users, description: 'Получай бонусы за каждого активного игрока' },
    { id: '3', title: 'Ежедневный вход', reward: 10, icon: CheckCircle2, description: 'Заходи в игру каждый день и забирай награду' },
];

export default function TasksPage() {
    return (
        <div className="pb-24">
            <PageHeader title="Задания" />

            <div className="flex flex-col gap-4 p-6">
                {DEMO_TASKS.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className="dota-card p-4 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <task.icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{task.title}</h3>
                            <p className="text-xs text-white/40 line-clamp-1">{task.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <span className="text-blue-500 font-bold">+{task.reward}</span>
                            <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-1.5 rounded-lg transition-colors border border-blue-500/20">
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
