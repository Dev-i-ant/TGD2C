'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, ClipboardList, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getTasks, deleteTask, createTask, updateTask } from '../../actions/tasks';
import Link from 'next/link';

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points: 100,
        type: 'SUBSCRIPTION',
        channelId: ''
    });

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        setIsLoading(true);
        const data = await getTasks();
        setTasks(data);
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Удалить это задание?')) return;
        const result = await deleteTask(id);
        if (result.success) {
            loadTasks();
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = editingTask
            ? await updateTask(editingTask.id, formData)
            : await createTask(formData);

        if (result.success) {
            setIsModalOpen(false);
            setEditingTask(null);
            setFormData({ title: '', description: '', points: 100, type: 'SUBSCRIPTION', channelId: '' });
            loadTasks();
        } else {
            alert(result.error);
        }
    }

    const openModal = (task?: any) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                points: task.points,
                type: task.type,
                channelId: task.channelId || ''
            });
        } else {
            setEditingTask(null);
            setFormData({ title: '', description: '', points: 100, type: 'SUBSCRIPTION', channelId: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="pb-24">
            <PageHeader title="Задания" backPath="/admin" isAdmin />

            <div className="p-6 flex flex-col gap-6">
                <button
                    onClick={() => openModal()}
                    className="dota-card p-4 bg-red-600/10 border-red-500/20 flex items-center justify-center gap-3 group active:scale-95 transition-all hover:bg-red-600/20"
                >
                    <Plus size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="text-red-500 font-black uppercase text-xs tracking-[0.2em]">Добавить новое задание</span>
                </button>

                {isLoading ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="dota-card p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed bg-transparent">
                        <ClipboardList size={48} className="text-gray-800" />
                        <div>
                            <p className="text-white font-bold uppercase text-sm">Заданий пока нет</p>
                            <p className="text-gray-600 text-[10px] mt-1 uppercase font-bold">Нажмите +, чтобы создать первое задание</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {tasks.map((task) => (
                            <motion.div
                                layout
                                key={task.id}
                                className="dota-card p-4 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <ClipboardList size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm uppercase">{task.title}</span>
                                        <span className="text-yellow-500 text-[10px] font-black uppercase">+{task.points} BP</span>
                                        <span className="text-gray-500 text-[9px] uppercase font-bold mt-0.5">{task.type}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(task)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#1c242d] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <h3 className="text-white font-black uppercase tracking-tight">
                                    {editingTask ? 'Редактировать задание' : 'Новое задание'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Заголовок</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-black/40 border border-gray-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                                        placeholder="Напр: Подпишись на канал"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Описание</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-black/40 border border-gray-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors h-24 resize-none"
                                        placeholder="Что нужно сделать?"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Награда (BP)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.points}
                                            onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                            className="bg-black/40 border border-gray-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Тип</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="bg-black/40 border border-gray-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                                        >
                                            <option value="SUBSCRIPTION">Подписка</option>
                                            <option value="SOCIAL">Соцсети</option>
                                            <option value="DAILY">Ежедневное</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.type === 'SUBSCRIPTION' && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">ID канала / Ссылка</label>
                                        <input
                                            type="text"
                                            value={formData.channelId}
                                            onChange={e => setFormData({ ...formData, channelId: e.target.value })}
                                            className="bg-black/40 border border-gray-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                                            placeholder="@channel_handle"
                                        />
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="dota-button mt-4 h-14 uppercase font-black text-sm tracking-widest"
                                >
                                    {editingTask ? 'Сохранить изменения' : 'Создать задание'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
