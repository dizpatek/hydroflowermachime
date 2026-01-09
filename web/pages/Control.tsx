import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Power, Droplets, Sun, Wind, Waves, AlertTriangle,
    Zap, Clock, Activity, StopCircle
} from 'lucide-react';
import { wsService } from '../services/websocket';
import axios from 'axios';

import { API_BASE_URL } from '../services/config';

interface ActuatorState {
    pumpMain: boolean;
    pumpPhUp: boolean;
    pumpPhDown: boolean;
    pumpNutrient: boolean;
    growLight: boolean;
    humidifier: boolean;
    fanSpeed: number;
}

export default function Control() {
    const navigate = useNavigate();
    const [autopilotActive, setAutopilotActive] = useState(false);
    const [actuatorState, setActuatorState] = useState<ActuatorState>({
        pumpMain: false,
        pumpPhUp: false,
        pumpPhDown: false,
        pumpNutrient: false,
        growLight: false,
        humidifier: false,
        fanSpeed: 0
    });
    const [lastActivity, setLastActivity] = useState<string>('');

    useEffect(() => {
        // Connect WebSocket
        wsService.connect();

        // Load autopilot status
        loadAutopilotStatus();

        // Listen for actuator updates
        const interval = setInterval(() => {
            setLastActivity(new Date().toLocaleTimeString('tr-TR'));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const loadAutopilotStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/cycle/current`);
            setAutopilotActive(res.data?.autopilotActive || false);
        } catch (error) {
            console.error('Failed to load autopilot status:', error);
        }
    };

    const controlActuator = (actuator: string, state: boolean, duration?: number) => {
        wsService.sendActuatorCommand({
            pump: actuator,
            state,
            duration
        });

        setLastActivity(new Date().toLocaleTimeString('tr-TR'));
    };

    const emergencyStop = () => {
        if (confirm('Tüm aktüatörleri durdurmak istediğinizden emin misiniz?')) {
            ['circ', 'phUp', 'phDown', 'nutrient', 'humidifier'].forEach(pump => {
                wsService.sendActuatorCommand({ pump, state: false });
            });
            wsService.sendActuatorCommand({ pump: 'fan', state: false, speed: 0 });

            setActuatorState({
                pumpMain: false,
                pumpPhUp: false,
                pumpPhDown: false,
                pumpNutrient: false,
                growLight: false,
                humidifier: false,
                fanSpeed: 0
            });

            setLastActivity(new Date().toLocaleTimeString('tr-TR'));
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-300">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
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
                        <Zap className="w-8 h-8 text-purple-400" />
                        Manuel Kontrol Paneli
                    </h1>
                    <p className="text-slate-400 mt-2">ESP32 bileşenlerini manuel olarak kontrol edin</p>
                </div>

                {/* Autopilot Warning */}
                {autopilotActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3"
                    >
                        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="text-yellow-400 font-bold">Autopilot Aktif</p>
                            <p className="text-yellow-400/70 text-sm">Manuel kontroller autopilot tarafından geçersiz kılınabilir</p>
                        </div>
                    </motion.div>
                )}

                {/* Last Activity */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm text-slate-400">Son Aktivite:</span>
                    </div>
                    <span className="text-white font-mono">{lastActivity || 'Henüz yok'}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pumps Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Droplets className="w-6 h-6 text-blue-400" />
                            <h3 className="font-bold text-white text-lg">Pompalar</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Main Pump */}
                            <PumpControl
                                name="Sirkülasyon Pompası"
                                icon={<Waves className="w-5 h-5" />}
                                state={actuatorState.pumpMain}
                                onToggle={(state) => {
                                    setActuatorState({ ...actuatorState, pumpMain: state });
                                    controlActuator('circ', state);
                                }}
                                color="blue"
                            />

                            {/* pH Up */}
                            <PumpControl
                                name="pH Up Pompası"
                                icon={<Droplets className="w-5 h-5" />}
                                state={actuatorState.pumpPhUp}
                                onDose={() => {
                                    controlActuator('phUp', true, 2000);
                                    setTimeout(() => setActuatorState({ ...actuatorState, pumpPhUp: false }), 2000);
                                }}
                                isDosing
                                doseDuration="2s"
                                color="emerald"
                            />

                            {/* pH Down */}
                            <PumpControl
                                name="pH Down Pompası"
                                icon={<Droplets className="w-5 h-5" />}
                                state={actuatorState.pumpPhDown}
                                onDose={() => {
                                    controlActuator('phDown', true, 2000);
                                    setTimeout(() => setActuatorState({ ...actuatorState, pumpPhDown: false }), 2000);
                                }}
                                isDosing
                                doseDuration="2s"
                                color="red"
                            />

                            {/* Nutrient */}
                            <PumpControl
                                name="Besin Pompası"
                                icon={<Droplets className="w-5 h-5" />}
                                state={actuatorState.pumpNutrient}
                                onDose={() => {
                                    controlActuator('nutrient', true, 3000);
                                    setTimeout(() => setActuatorState({ ...actuatorState, pumpNutrient: false }), 3000);
                                }}
                                isDosing
                                doseDuration="3s"
                                color="yellow"
                            />
                        </div>
                    </motion.div>

                    {/* Environment Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Grow Light */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Sun className="w-6 h-6 text-yellow-400" />
                                <h3 className="font-bold text-white text-lg">Işık</h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Grow Light</p>
                                    <p className="text-xs text-slate-500">Otomatik Program: 6:00 - 22:00</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newState = !actuatorState.growLight;
                                        setActuatorState({ ...actuatorState, growLight: newState });
                                        controlActuator('light', newState);
                                    }}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${actuatorState.growLight
                                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                        }`}
                                >
                                    {actuatorState.growLight ? 'AÇIK' : 'KAPALI'}
                                </button>
                            </div>
                        </div>

                        {/* Fan */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Wind className="w-6 h-6 text-cyan-400" />
                                <h3 className="font-bold text-white text-lg">Fan</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Hız</span>
                                    <span className="text-cyan-400 font-mono font-bold">{actuatorState.fanSpeed}/255</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={actuatorState.fanSpeed}
                                    onChange={(e) => {
                                        const speed = parseInt(e.target.value);
                                        setActuatorState({ ...actuatorState, fanSpeed: speed });
                                        controlActuator('fan', speed > 0, speed);
                                    }}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                                />
                            </div>
                        </div>

                        {/* Humidifier */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-6 h-6 text-indigo-400" />
                                <h3 className="font-bold text-white text-lg">Humidifier</h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-white font-medium">Nemlendirici</p>
                                <button
                                    onClick={() => {
                                        const newState = !actuatorState.humidifier;
                                        setActuatorState({ ...actuatorState, humidifier: newState });
                                        controlActuator('humidifier', newState);
                                    }}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${actuatorState.humidifier
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                        }`}
                                >
                                    {actuatorState.humidifier ? 'AÇIK' : 'KAPALI'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Emergency Stop */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={emergencyStop}
                    className="w-full mt-6 bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                >
                    <StopCircle className="w-6 h-6" />
                    ACİL DURDUR (Tüm Aktüatörler)
                </motion.button>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #22d3ee;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
                }
                .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #22d3ee;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
                }
            `}</style>
        </div>
    );
}

// Pump Control Component
function PumpControl({
    name,
    icon,
    state,
    onToggle,
    onDose,
    isDosing = false,
    doseDuration,
    color = 'blue'
}: {
    name: string;
    icon: React.ReactNode;
    state: boolean;
    onToggle?: (state: boolean) => void;
    onDose?: () => void;
    isDosing?: boolean;
    doseDuration?: string;
    color?: string;
}) {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    };

    return (
        <div className={`p-4 rounded-2xl border ${colors[color]}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors[color]}`}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">{name}</p>
                        {isDosing && doseDuration && (
                            <p className="text-xs text-slate-500">Dozaj: {doseDuration}</p>
                        )}
                    </div>
                </div>

                {isDosing ? (
                    <button
                        onClick={onDose}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        Dozla
                    </button>
                ) : (
                    <button
                        onClick={() => onToggle?.(!state)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${state
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}
                    >
                        {state ? 'AÇIK' : 'KAPALI'}
                    </button>
                )}
            </div>
        </div>
    );
}
