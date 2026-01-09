import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Wifi, Server, Gauge, Camera, Save, Shield,
    Thermometer, Droplets, Zap, Clock, Activity, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

import { API_BASE_URL } from '../services/config';
const API_URL = `${API_BASE_URL}/api`;

export default function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('hardware');
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await axios.get(`${API_URL}/esp32/config`);
            setConfig(res.data);
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(`${API_URL}/esp32/config`, config);
            alert('Ayarlar kaydedildi!');
        } catch (error) {
            alert('Kaydetme başarısız!');
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = (field: string, value: any) => {
        setConfig({ ...config, [field]: value });
    };

    const updateJsonConfig = (field: string, key: string, value: any) => {
        const currentJson = JSON.parse(config[field] || '{}');
        currentJson[key] = parseInt(value);
        setConfig({ ...config, [field]: JSON.stringify(currentJson) });
    };

    if (!config) {
        return (
            <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center">
                <div className="text-emerald-400 font-mono">Yükleniyor...</div>
            </div>
        );
    }

    const tabs = [
        { id: 'hardware', label: 'Donanım', icon: Wifi },
        { id: 'calibration', label: 'Kalibrasyon', icon: Activity },
        { id: 'pins', label: 'Pin Şeması', icon: Zap },
        { id: 'admin', label: 'Yönetim', icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-300">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Geri Dön
                    </button>
                    <h1 className="text-3xl font-bold text-white">Gelişmiş Ayarlar</h1>
                    <p className="text-slate-400 mt-2">Sistem yapılandırması ve kalibrasyon</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-emerald-500 text-black'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Hardware Tab */}
                    {activeTab === 'hardware' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* WiFi Configuration */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Wifi className="w-5 h-5 text-emerald-400" />
                                    <h3 className="font-bold text-white">WiFi Yapılandırması</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">SSID</label>
                                        <input
                                            type="text"
                                            value={config.wifiSSID}
                                            onChange={(e) => updateConfig('wifiSSID', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
                                        <input
                                            type="password"
                                            value={config.wifiPassword}
                                            onChange={(e) => updateConfig('wifiPassword', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MQTT Configuration */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Server className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-bold text-white">MQTT Broker</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Broker Adresi</label>
                                        <input
                                            type="text"
                                            value={config.mqttBroker}
                                            onChange={(e) => updateConfig('mqttBroker', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Port</label>
                                        <input
                                            type="number"
                                            value={config.mqttPort}
                                            onChange={(e) => updateConfig('mqttPort', parseInt(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Camera Configuration */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Camera className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-bold text-white">Kamera Ayarları</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Kamera URL</label>
                                    <input
                                        type="text"
                                        value={config.cameraUrl}
                                        onChange={(e) => updateConfig('cameraUrl', e.target.value)}
                                        placeholder="http://192.168.1.100:81/stream"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Calibration Tab */}
                    {activeTab === 'calibration' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* pH Calibration */}
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Droplets className="w-5 h-5 text-cyan-400" />
                                        <h3 className="font-bold text-white">pH Kalibrasyonu</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-sm font-medium mb-2">Adım 1: pH 7.0 Tamponu</p>
                                            <p className="text-xs text-slate-400 mb-3">Sensörü saf suyla yıkayın ve pH 7.0 tampon çözeltisine daldırın.</p>
                                            <button className="w-full py-2 bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg text-sm transition-colors text-slate-300">
                                                pH 7.0 Olarak Ayarla
                                            </button>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-sm font-medium mb-2">Adım 2: pH 4.0 Tamponu</p>
                                            <p className="text-xs text-slate-400 mb-3">Sensörü tekrar yıkayın ve pH 4.0 tampon çözeltisine daldırın.</p>
                                            <button className="w-full py-2 bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg text-sm transition-colors text-slate-300">
                                                pH 4.0 Olarak Ayarla
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* TDS Calibration */}
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Activity className="w-5 h-5 text-yellow-400" />
                                        <h3 className="font-bold text-white">TDS Kalibrasyonu</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-sm font-medium mb-2">1413 µS/cm Tamponu</p>
                                            <p className="text-xs text-slate-400 mb-3">Sensörü 1413 µS/cm kalibrasyon sıvısına daldırın.</p>
                                            <button className="w-full py-2 bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg text-sm transition-colors text-slate-300">
                                                Kalibre Et
                                            </button>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-sm font-medium mb-2">Sıcaklık Offset</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    defaultValue="0.0"
                                                    className="w-20 bg-black/30 border border-slate-600 rounded-lg px-2 py-1 text-center"
                                                />
                                                <span className="self-center text-sm text-slate-400">°C</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Pins Tab */}
                    {activeTab === 'pins' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* Sensor Pins */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Gauge className="w-5 h-5 text-orange-400" />
                                    <h3 className="font-bold text-white">Sensör Pinleri</h3>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Object.entries(JSON.parse(config.sensorPins || '{}')).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">{key}</label>
                                            <input
                                                type="number"
                                                value={value as number}
                                                onChange={(e) => updateJsonConfig('sensorPins', key, e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pump/Actuator Pins */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <h3 className="font-bold text-white">Aktüatör Pinleri</h3>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Object.entries(JSON.parse(config.pumpPins || '{}')).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">{key}</label>
                                            <input
                                                type="number"
                                                value={value as number}
                                                onChange={(e) => updateJsonConfig('pumpPins', key, e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Admin Tab */}
                    {activeTab === 'admin' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-bold text-white">Yönetim Araçları</h3>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/backup')}
                                        className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl p-4 text-left transition-colors flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="font-bold">Yedekleme Merkezi</div>
                                            <div className="text-xs opacity-70 mt-1">Veritabanı yedekle/geri yükle</div>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <button className="w-full bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/20 rounded-xl p-4 text-left transition-colors">
                                        <div className="font-bold">Sistem Logları</div>
                                        <div className="text-xs opacity-70 mt-1">Hata ve işlem kayıtları</div>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <h3 className="font-bold text-red-500">Tehlikeli Bölge</h3>
                                </div>
                                <div className="space-y-3">
                                    <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl p-4 text-left transition-colors">
                                        <div className="font-bold">Fabrika Ayarlarına Dön</div>
                                        <div className="text-xs opacity-70 mt-1">Tüm ayarları ve verileri sil</div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Save Button (Global) */}
                    <div className="fixed bottom-8 right-8 z-50">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold p-4 rounded-full shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-6 h-6" />
                            <span className="pr-2">Kaydet</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
