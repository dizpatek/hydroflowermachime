import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Thermometer, Droplets, Zap, Cpu, FlaskConical, Waves,
    Gauge, Settings, Power, Eye, PlayCircle, PauseCircle, LogOut,
    Camera, TrendingUp, AlertTriangle, CheckCircle, Lock, X, Sliders,
    Sprout, BarChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { wsService } from '../services/websocket';
import axios from 'axios';
import { ActuatorPanel } from '../components/ActuatorPanel';
import { NotificationCenter } from '../components/NotificationCenter';

import { API_BASE_URL } from '../services/config';
const API_URL = `${API_BASE_URL}/api`;

export default function Dashboard() {
    const navigate = useNavigate();
    const [sensorData, setSensorData] = useState<any[]>([]);
    const [currentData, setCurrentData] = useState<any>(null);
    const [autopilotActive, setAutopilotActive] = useState(false);
    const [healthCheck, setHealthCheck] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [modalAction, setModalAction] = useState<'start' | 'stop'>('start');
    const [password, setPassword] = useState('');
    const [cameraConnected, setCameraConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Connect WebSocket
        wsService.connect();

        wsService.onSensorUpdate((data) => {
            setCurrentData(data);
            setSensorData(prev => [...prev, data].slice(-50));
        });

        wsService.onAutopilotStatus((status) => {
            setAutopilotActive(status.active);
        });

        // Load initial data
        loadData();

        return () => wsService.disconnect();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [historyRes, cycleRes, healthRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/sensors/history?limit=50`),
                axios.get(`${API_URL}/cycle/current`),
                axios.get(`${API_URL}/health/latest`),
                axios.get(`${API_URL}/logs?limit=20`)
            ]);

            setSensorData(historyRes.data || []);
            if (historyRes.data && historyRes.data.length > 0) {
                setCurrentData(historyRes.data[historyRes.data.length - 1]);
            } else {
                // Set default data if no history exists
                setCurrentData({
                    ph: 7.0,
                    tds: 0,
                    waterTemp: 22.0,
                    humidity: 50.0,
                    timestamp: new Date().toISOString()
                });
            }
            setAutopilotActive(cycleRes.data?.autopilotActive || false);
            setHealthCheck(healthRes.data);
            setLogs(logsRes.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            // Even on error, set default data to show the UI
            setCurrentData({
                ph: 0,
                tds: 0,
                waterTemp: 0,
                humidity: 0,
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAutopilotToggle = (action: 'start' | 'stop') => {
        setModalAction(action);
        setShowPasswordModal(true);
    };

    const confirmAutopilot = async () => {
        try {
            await axios.post(`${API_URL}/autopilot/${modalAction}`, { password });
            setShowPasswordModal(false);
            setPassword('');
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'İşlem başarısız');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading && !currentData) {
        return (
            <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="text-emerald-400 font-mono animate-pulse">Sistem Yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-300">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                            <Cpu className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">HydroFlower Pro AI</h1>
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-400">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {wsService.isConnected() ? 'ONLINE' : 'OFFLINE'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Autopilot Control */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAutopilotToggle(autopilotActive ? 'stop' : 'start')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${autopilotActive
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                                }`}
                        >
                            {autopilotActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                            {autopilotActive ? 'OTOPİLOT AKTİF' : 'OTOPİLOT BAŞLAT'}
                        </motion.button>

                        <NotificationCenter />
                        <button
                            onClick={() => navigate('/control')}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors flex items-center gap-2"
                            title="Manuel Kontrol"
                        >
                            <Sliders className="w-5 h-5" />
                            <span className="hidden md:inline">Kontrol</span>
                        </button>
                        <button
                            onClick={() => navigate('/reports')}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors flex items-center gap-2"
                            title="Raporlar"
                        >
                            <BarChart className="w-5 h-5" />
                            <span className="hidden md:inline">Raporlar</span>
                        </button>
                        <button
                            onClick={() => navigate('/growth-phase')}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors flex items-center gap-2"
                            title="Büyüme Fazı"
                        >
                            <Sprout className="w-5 h-5" />
                            <span className="hidden md:inline">Fazlar</span>
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors"
                            title="Ayarlar"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

                {/* Left Column: Metrics & Charts */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Sensor Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard label="pH" value={currentData.ph.toFixed(2)} icon={FlaskConical} color="emerald" />
                        <MetricCard label="TDS" value={currentData.tds.toFixed(0)} unit="ppm" icon={Zap} color="blue" />
                        <MetricCard label="Su Sıcaklığı" value={currentData.waterTemp.toFixed(1)} unit="°C" icon={Thermometer} color="cyan" />
                        <MetricCard label="Nem" value={currentData.humidity.toFixed(0)} unit="%" icon={Droplets} color="indigo" />
                    </div>

                    {/* Actuator Status Panel */}
                    <ActuatorPanel />

                    {/* Charts */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            Sensör Verileri (Son 3 Saat)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sensorData}>
                                    <defs>
                                        <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis stroke="#94a3b8" fontSize={11} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }}
                                        itemStyle={{ color: '#10b981' }}
                                    />
                                    <Area type="monotone" dataKey="ph" stroke="#10b981" fillOpacity={1} fill="url(#colorPh)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Health Check Results */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                Son AI Sağlık Kontrolü
                            </h3>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await axios.post(`${API_URL}/health/analyze`);
                                        setHealthCheck(res.data);
                                    } catch (err) {
                                        alert('Analiz başlatılamadı. Kamera ayarlarını kontrol edin.');
                                    }
                                }}
                                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                                <Camera className="w-3 h-3" />
                                Analiz Et
                            </button>
                        </div>

                        {healthCheck ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <div className="text-4xl font-bold text-emerald-400">{healthCheck.healthScore}/100</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Sağlık Skoru</div>
                                </div>
                                <div className="md:col-span-2 bg-white/5 rounded-2xl p-4">
                                    <p className="text-sm text-slate-300">{healthCheck.analysis}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                Henüz sağlık kontrolü yapılmadı.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Camera & Logs */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Camera Feed */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-400" />
                                <span className="font-bold text-white text-sm">Canlı Kamera</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${cameraConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="text-[10px] font-bold tracking-wider uppercase text-red-400">
                                    {cameraConnected ? 'LIVE' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                        <div className="relative aspect-video bg-black">
                            <img
                                src="/plant-placeholder.png"
                                alt="Plant Camera Feed"
                                className="w-full h-full object-cover opacity-90"
                            />
                            {!cameraConnected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                    <div className="text-center">
                                        <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                                        <p className="text-slate-400 text-sm">Kamera bağlanıyor...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Logs */}
                    <div className="bg-slate-950/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-white font-bold text-sm">Sistem Günlüğü</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            {logs.map((log) => (
                                <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${log.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                            log.level === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                log.level === 'AI_DECISION' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {log.level}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300">{log.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Password Confirmation Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Şifre Onayı</h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-slate-400 text-sm mb-6">
                                Otopilotu {modalAction === 'start' ? 'başlatmak' : 'durdurmak'} için şifrenizi girin.
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="Şifrenizi girin"
                                        onKeyPress={(e) => e.key === 'Enter' && confirmAutopilot()}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={confirmAutopilot}
                                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition-colors"
                                    >
                                        Onayla
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Metric Card Component
function MetricCard({ label, value, unit = '', icon: Icon, color }: any) {
    const colors: any = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">{label}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tighter">{value}</span>
                <span className="text-xs text-slate-500">{unit}</span>
            </div>
        </motion.div>
    );
}
