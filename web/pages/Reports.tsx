import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
    ArrowLeft, Calendar, Download, Activity, Droplets,
    Thermometer, Sun, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/config';

export default function Reports() {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [timeRange]);

    const fetchReports = async () => {
        // In a real app, pass timeRange as query param
        try {
            const res = await axios.get(`${API_BASE_URL}/api/sensors/history?limit=${timeRange === '24h' ? 288 : 1000}`);
            // Filter/Aggregation logic would normally happen on backend
            // for now just using raw data
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        const headers = ["Timestamp", "pH", "TDS", "Water Temp", "Air Temp", "Humidity"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + data.map(row => {
                return [
                    new Date(row.timestamp).toISOString(),
                    row.ph,
                    row.tds,
                    row.waterTemp,
                    row.airTemp,
                    row.humidity
                ].join(",");
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hydroflower_report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-300">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Dashboard'a Dön
                        </button>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-indigo-400" />
                            Raporlar ve Analizler
                        </h1>
                        <p className="text-slate-400 mt-2">Sistem performansını ve büyüme verilerini inceleyin</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-1 rounded-lg flex">
                            {(['24h', '7d', '30d'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${timeRange === range
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                >
                                    {range === '24h' ? '24 Saat' : range === '7d' ? '7 Gün' : '30 Gün'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={downloadReport}
                            className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition-colors"
                            title="CSV İndir"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* pH Chart */}
                    <ChartCard title="pH Değerleri" icon={Droplets} color="emerald">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#64748b"
                                />
                                <YAxis domain={[5, 7]} stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    labelFormatter={(t) => new Date(t).toLocaleString('tr-TR')}
                                />
                                <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* TDS Chart */}
                    <ChartCard title="TDS (ppm)" icon={Activity} color="yellow">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTds" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#64748b"
                                />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    labelFormatter={(t) => new Date(t).toLocaleString('tr-TR')}
                                />
                                <Area type="monotone" dataKey="tds" stroke="#eab308" fillOpacity={1} fill="url(#colorTds)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Temperature Chart */}
                    <ChartCard title="Sıcaklık (°C)" icon={Thermometer} color="red">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#64748b"
                                />
                                <YAxis domain={[15, 35]} stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    labelFormatter={(t) => new Date(t).toLocaleString('tr-TR')}
                                />
                                <Line type="monotone" dataKey="waterTemp" name="Su" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="airTemp" name="Hava" stroke="#f97316" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Humidity Chart */}
                    <ChartCard title="Nem (%)" icon={Droplets} color="blue">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#64748b"
                                />
                                <YAxis domain={[0, 100]} stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    labelFormatter={(t) => new Date(t).toLocaleString('tr-TR')}
                                />
                                <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHum)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}

function ChartCard({ children, title, icon: Icon, color }: any) {
    const colors: any = {
        emerald: 'text-emerald-400',
        yellow: 'text-yellow-400',
        red: 'text-red-400',
        blue: 'text-blue-400'
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Icon className={`w-5 h-5 ${colors[color]}`} />
                <h3 className="font-bold text-white">{title}</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
                {children}
            </div>
        </div>
    );
}
