import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Database, Download, Upload, Trash2,
    FileJson, RefreshCw, CheckCircle, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/config';
import { motion } from 'framer-motion';

interface BackupFile {
    id: string;
    filename: string;
    size: number;
    createdAt: string;
}

export default function Backup() {
    const navigate = useNavigate();
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/backups`);
            setBackups(res.data);
        } catch (error) {
            console.error('Failed to fetch backups', error);
        }
    };

    const createBackup = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await axios.post(`${API_BASE_URL}/api/backups`);
            await fetchBackups();
            setMessage({ type: 'success', text: 'Yedek başarıyla oluşturuldu' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Yedek oluşturulamadı' });
        } finally {
            setLoading(false);
        }
    };

    const downloadBackup = async (filename: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/backups/${filename}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const deleteBackup = async (id: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/backups/${id}`);
            setBackups(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    // Note: Restore functionality is complex to implement safely in a web UI without downtime.
    // We will focus on Export/Import logic where users can download JSON and potentially re-upload to seed.

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-300">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Dashboard'a Dön
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Database className="w-8 h-8 text-indigo-400" />
                            Yedekleme Merkezi
                        </h1>
                        <p className="text-slate-400 mt-2">Sistem verilerini yedekleyin ve yönetin</p>
                    </div>
                    <button
                        onClick={createBackup}
                        disabled={loading}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Yeni Yedek Oluştur
                    </button>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        {message.text}
                    </motion.div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                        <h2 className="font-bold text-white">Yedek Geçmişi</h2>
                        <span className="text-xs text-slate-500">JSON Formatında</span>
                    </div>

                    <div className="divide-y divide-slate-800">
                        {backups.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <FileJson className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Henüz yedek bulunmuyor</p>
                            </div>
                        ) : (
                            backups.map(backup => (
                                <div key={backup.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                            <FileJson className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{backup.filename}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span>{(backup.size / 1024).toFixed(1)} KB</span>
                                                <span>•</span>
                                                <span>{new Date(backup.createdAt).toLocaleString('tr-TR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => downloadBackup(backup.filename)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            title="İndir"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteBackup(backup.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 items-start">
                    <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200 text-sm">Önemli Bilgi</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            Yedeklemeler sistemdeki tüm sensör verilerini, ayarları ve kullanıcıları içerir.
                            Verilerinizi düzenli olarak indirmeyi unutmayın.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
