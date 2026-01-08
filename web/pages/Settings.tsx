import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wifi, Server, Gauge, Camera, Save, Shield } from 'lucide-react';
import axios from 'axios';

import { API_BASE_URL } from '../services/config';
const API_URL = `${API_BASE_URL}/api`;

export default function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('esp32');
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

    if (!config) {
        return (
            <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center">
                <div className="text-emerald-400 font-mono">Yükleniyor...</div>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-white">Ayarlar</h1>
                    <p className="text-slate-400 mt-2">Sistem ve ESP32 yapılandırması</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
                    {[
                        { id: 'esp32', label: 'ESP32 Ayarları', icon: Gauge },
                        { id: 'admin', label: 'Admin Paneli', icon: Shield }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-emerald-500 text-black'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ESP32 Settings Tab */}
                {activeTab === 'esp32' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
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
                                <p className="text-xs text-slate-500 mt-2">ESP32-CAM RTSP/HTTP adresi veya test için 'SIMULATION' yazın</p>
                            </div>
                        </div>

                        {/* Sensor Pins */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Gauge className="w-5 h-5 text-cyan-400" />
                                <h3 className="font-bold text-white">Sensör Pin Yapılandırması</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(JSON.parse(config.sensorPins || '{}')).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">{key}</label>
                                        <input
                                            type="number"
                                            value={value as number}
                                            onChange={(e) => {
                                                const pins = JSON.parse(config.sensorPins);
                                                pins[key] = parseInt(e.target.value);
                                                updateConfig('sensorPins', JSON.stringify(pins));
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                        </motion.button>
                    </motion.div>
                )}

                {/* Admin Panel Tab */}
                {activeTab === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6"
                    >
                        <h3 className="font-bold text-white mb-4">Admin İşlemleri</h3>
                        <div className="space-y-4">
                            <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl p-4 text-left transition-colors">
                                <div className="font-bold text-white">Veritabanı Yedekleme</div>
                                <div className="text-sm text-slate-400 mt-1">Tüm verileri yedekle</div>
                            </button>
                            <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl p-4 text-left transition-colors">
                                <div className="font-bold text-white">Sistem Loglarını Görüntüle</div>
                                <div className="text-sm text-slate-400 mt-1">Detaylı sistem günlüklerini incele</div>
                            </button>
                            <button className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-2xl p-4 text-left transition-colors">
                                <div className="font-bold text-red-400">Tüm Verileri Sıfırla</div>
                                <div className="text-sm text-red-400/70 mt-1">DİKKAT: Bu işlem geri alınamaz!</div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
