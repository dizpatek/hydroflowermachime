import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Info, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/config';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'critical' | 'success';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
        // In a real app, listen to WebSocket for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notifications`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const clearAll = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/notifications`);
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to clear notifications');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertOctagon className="w-5 h-5 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors relative"
            >
                <Bell className="w-5 h-5 text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#0a0f18]">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
                        >
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                                <h3 className="font-bold text-white">Bildirimler</h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Tümünü Temizle
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-800">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-white/5 transition-colors ${notification.read ? 'opacity-60' : 'bg-blue-500/5'}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="mt-1 flex-shrink-0">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className={`text-sm font-medium ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="text-blue-400 hover:text-blue-300 p-1"
                                                                    title="Okundu işaretle"
                                                                >
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-600 mt-2 block">
                                                            {new Date(notification.createdAt).toLocaleString('tr-TR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Bildiriminiz yok</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
