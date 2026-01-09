import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Sprout, Leaf, Flower2, Droplets, Thermometer,
    Sun, Calendar, CheckCircle, AlertTriangle, ArrowRight, History, Activity
} from 'lucide-react';
import { PHASE_PARAMETERS } from '../constants';
import { GrowthPhase } from '../types';
import axios from 'axios';
import { API_BASE_URL } from '../services/config';

export default function GrowthPhasePage() {
    const navigate = useNavigate();
    const [currentPhase, setCurrentPhase] = useState<GrowthPhase | null>(null);
    const [selectedPhase, setSelectedPhase] = useState<GrowthPhase>(GrowthPhase.VEGETATIVE);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPhaseData();
    }, []);

    const fetchPhaseData = async () => {
        try {
            const [currentRes, historyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/cycle/current`),
                axios.get(`${API_BASE_URL}/api/cycle/history`) // Backend endpoint needed
            ]);

            if (currentRes.data?.phase) {
                setCurrentPhase(currentRes.data.phase);
                setSelectedPhase(currentRes.data.phase);
            }
            if (historyRes.data) {
                setHistory(historyRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch phase data', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhaseChange = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/cycle/phase`, { phase: selectedPhase });
            setCurrentPhase(selectedPhase);
            fetchPhaseData(); // Refresh history
        } catch (error) {
            console.error('Failed to update phase', error);
        }
    };

    const phases = [
        { id: GrowthPhase.GERMINATION, label: 'Çimlenme', icon: Sprout, color: 'text-emerald-400' },
        { id: GrowthPhase.SEEDLING, label: 'Fide', icon: Sprout, color: 'text-green-400' },
        { id: GrowthPhase.VEGETATIVE, label: 'Vejetatif', icon: Leaf, color: 'text-green-500' },
        { id: GrowthPhase.EARLY_FLOWER, label: 'Erken Çiçek', icon: Flower2, color: 'text-pink-400' },
        { id: GrowthPhase.LATE_FLOWER, label: 'Geç Çiçek', icon: Flower2, color: 'text-pink-500' },
        { id: GrowthPhase.FLUSH, label: 'Flush (Yıkama)', icon: Droplets, color: 'text-blue-400' },
    ];

    const currentParams = PHASE_PARAMETERS[selectedPhase];

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-300">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Dashboard'a Dön
                    </button>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-emerald-400" />
                        Büyüme Fazı Yönetimi
                    </h1>
                    <p className="text-slate-400 mt-2">Bitkinizin yaşam döngüsünü yönetin ve parametreleri optimize edin</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Phase Selector */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-bold text-white mb-4">Faz Seçimi</h2>
                        {phases.map((phase) => {
                            const Icon = phase.icon;
                            const isActive = selectedPhase === phase.id;
                            const isCurrent = currentPhase === phase.id;

                            return (
                                <motion.button
                                    key={phase.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => setSelectedPhase(phase.id)}
                                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${isActive
                                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                            <Icon className={`w-5 h-5 ${phase.color}`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">{phase.label}</div>
                                            {isCurrent && (
                                                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Aktif Faz
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isActive && <ArrowRight className="w-5 h-5 text-emerald-500" />}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Middle Column: Parameters & Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Selected Phase Detail */}
                        <motion.div
                            key={selectedPhase}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {phases.find(p => p.id === selectedPhase)?.label} Hedefleri
                                    </h2>
                                    <p className="text-slate-400">Bu faz için ideal büyüme parametreleri</p>
                                </div>

                                {currentPhase !== selectedPhase ? (
                                    <button
                                        onClick={handlePhaseChange}
                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Bu Faza Geç
                                    </button>
                                ) : (
                                    <div className="px-6 py-3 bg-white/5 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Şu an aktif
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ParamCard
                                    label="pH Aralığı"
                                    value={`${currentParams.phMin} - ${currentParams.phMax}`}
                                    icon={Droplets}
                                    color="blue"
                                />
                                <ParamCard
                                    label="TDS (ppm)"
                                    value={`${currentParams.tdsMin} - ${currentParams.tdsMax}`}
                                    icon={Activity}
                                    color="yellow"
                                />
                                <ParamCard
                                    label="Su Sıcaklığı"
                                    value={`${currentParams.tempWaterMin} - ${currentParams.tempWaterMax}°C`}
                                    icon={Thermometer}
                                    color="red"
                                />
                                <ParamCard
                                    label="Nem"
                                    value={`${currentParams.humidityMin} - ${currentParams.humidityMax}%`}
                                    icon={Droplets}
                                    color="indigo"
                                />
                                <ParamCard
                                    label="Işık Döngüsü"
                                    value={currentParams.lightCycle}
                                    icon={Sun}
                                    color="orange"
                                />
                            </div>

                            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-300">
                                    <strong>İpucu:</strong> Faz değişikliği autopilot hedeflerini otomatik olarak güncelleyecektir. Lütfen besin tankını yeni faza uygun şekilde hazırladığınızdan emin olun.
                                </div>
                            </div>
                        </motion.div>

                        {/* History Section */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <History className="w-6 h-6 text-slate-400" />
                                <h3 className="text-xl font-bold text-white">Faz Geçmişi</h3>
                            </div>

                            <div className="relative border-l-2 border-slate-700 ml-3 space-y-8 pl-8 py-2">
                                {history.length > 0 ? history.map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-slate-800 border-4 border-slate-600" />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <h4 className="text-white font-bold">{phases.find(p => p.id === item.phase)?.label || item.phase}</h4>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(item.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                                                </p>
                                            </div>
                                            <div className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                                                {Math.ceil((new Date(item.endDate || new Date()).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24))} Gün
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-slate-500 italic">Henüz geçmiş kaydı yok.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ParamCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <div className={`inline-flex p-2 rounded-lg mb-2 ${colors[color]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className="text-lg font-bold text-white">{value}</div>
        </div>
    );
}
