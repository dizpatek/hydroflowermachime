import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  AlertCircle, 
  Cpu, 
  FlaskConical, 
  Waves, 
  Gauge, 
  BookOpen,
  Settings,
  ShieldCheck,
  RefreshCw,
  Power,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Types
enum GrowthPhase {
  SEEDLING = 'Fide',
  VEGETATIVE = 'Gelisim',
  FLOWERING = 'Ciceklenme'
}

enum SystemMode {
  OBSERVE = 'Gozlem',
  SUGGEST = 'Oneri',
  ACT = 'Otonom'
}

interface SensorData {
  timestamp: number;
  ph: number;
  tds: number;
  waterTemp: number;
  airTemp: number;
  humidity: number;
  waterLevel: 'OK' | 'LOW';
  flowRate: number;
}

interface SystemLog {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'AI_DECISION';
  message: string;
}

// Phase Parameters
const PHASE_PARAMS = {
  [GrowthPhase.SEEDLING]: { phMin: 5.8, phMax: 6.2, tdsMin: 300, tdsMax: 500, tempMin: 20, tempMax: 24 },
  [GrowthPhase.VEGETATIVE]: { phMin: 5.5, phMax: 6.5, tdsMin: 800, tdsMax: 1200, tempMin: 18, tempMax: 22 },
  [GrowthPhase.FLOWERING]: { phMin: 5.5, phMax: 6.5, tdsMin: 1200, tdsMax: 1600, tempMin: 18, tempMax: 24 },
};

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<GrowthPhase>(GrowthPhase.VEGETATIVE);
  const [systemMode, setSystemMode] = useState<SystemMode>(SystemMode.OBSERVE);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activePumps, setActivePumps] = useState({ circ: true, phUp: false, phDown: false, nute: false });

  // Generate mock data for visualization
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const params = PHASE_PARAMS[currentPhase];
      
      const newData: SensorData = {
        timestamp: now,
        ph: 5.8 + (Math.random() * 0.4),
        tds: params.tdsMin + (Math.random() * 100),
        waterTemp: params.tempMin + (Math.random() * 2),
        airTemp: 24 + (Math.random() * 1),
        humidity: 60 + (Math.random() * 10),
        waterLevel: 'OK',
        flowRate: 3.5 + (Math.random() * 0.5)
      };

      setCurrentData(newData);
      setHistory(prev => [...prev, newData].slice(-50));

      // AI Logic Simulation
      if (newData.ph > params.phMax) {
        addLog('AI_DECISION', 'pH yuksek tespit edildi. pH Down dozlamasi oneriliyor.');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPhase]);

  const addLog = (level: SystemLog['level'], message: string) => {
    setLogs(prev => [
      { id: Math.random().toString(36), timestamp: Date.now(), level, message },
      ...prev
    ].slice(0, 20));
  };

  if (!currentData) return <div className="flex items-center justify-center h-screen bg-slate-950 text-emerald-400 font-mono">SISTEM BASLATILIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-lg animate-pulse" />
              <div className="relative bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
                <Cpu className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                HydroFlower <span className="text-emerald-500 text-sm font-light px-2 py-0.5 border border-emerald-500/30 rounded-full">Pro AI</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-400/80">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Sistem Aktif • ESP32 Online
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
              {[SystemMode.OBSERVE, SystemMode.SUGGEST, SystemMode.ACT].map((m) => (
                <button
                  key={m}
                  onClick={() => setSystemMode(m)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    systemMode === m 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                      : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Metrics & Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Phase & Quick Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(GrowthPhase).map((phase) => (
              <motion.button
                key={phase}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPhase(phase)}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                  currentPhase === phase 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-tighter">Faz</span>
                <span className="text-lg font-bold">{phase}</span>
              </motion.button>
            ))}
          </div>

          {/* Sensor Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="pH Seviyesi" value={currentData.ph.toFixed(2)} unit="" icon={FlaskConical} color="emerald" trend="+0.02" />
            <MetricCard label="TDS Değeri" value={currentData.tds.toFixed(0)} unit="ppm" icon={Zap} color="blue" trend="-12" />
            <MetricCard label="Su Sıcaklığı" value={currentData.waterTemp.toFixed(1)} unit="°C" icon={Thermometer} color="cyan" />
            <MetricCard label="Hava Nem" value={currentData.humidity.toFixed(0)} unit="%" icon={Droplets} color="indigo" />
          </div>

          {/* Charts */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Denge Analizi (Son 3 Saat)
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">pH: STABLE</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">TDS: OPTIMAL</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="ph" stroke="#10b981" fillOpacity={1} fill="url(#colorPh)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Right Column: Logs & Management */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Actuator Panel */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Kontrol Paneli
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ControlButton label="Sirkülasyon" active={activePumps.circ} icon={Waves} color="emerald" />
              <ControlButton label="pH Denge" active={activePumps.phUp || activePumps.phDown} icon={Gauge} color="blue" />
              <ControlButton label="Besleme" active={activePumps.nute} icon={Zap} color="cyan" />
              <ControlButton label="UV Sterilize" active={false} icon={Activity} color="indigo" />
            </div>
          </section>

          {/* System Logs */}
          <section className="bg-slate-950/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-white font-bold text-sm">Sistem Günlüğü</h3>
              <RefreshCw className="w-4 h-4 text-slate-500 animate-spin-slow cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
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
                    <p className="text-xs text-slate-300 leading-relaxed">{log.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Device Power */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Power className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Akıllı Güç</div>
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Verimlilik %98.4</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">42W</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center text-slate-500 gap-6">
        <div className="flex items-center gap-6">
          <BookOpen className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Settings className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Activity className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
        </div>
        <div className="text-xs font-mono tracking-widest uppercase">
          Design & Code by <span className="text-emerald-500">Antigravity AI</span>
        </div>
      </footer>
    </div>
  );
}

// Sub-components
function MetricCard({ label, value, unit, icon: Icon, color, trend }: any) {
  const colors: any = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white tracking-tighter">{value}</span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ControlButton({ label, active, icon: Icon, color }: any) {
  const bgStyles: any = {
    emerald: active ? 'bg-emerald-500 border-emerald-400' : 'bg-white/5 border-white/10',
    blue: active ? 'bg-blue-500 border-blue-400' : 'bg-white/5 border-white/10',
    cyan: active ? 'bg-cyan-500 border-cyan-400' : 'bg-white/5 border-white/10',
    indigo: active ? 'bg-indigo-500 border-indigo-400' : 'bg-white/5 border-white/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group ${bgStyles[color]}`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-500 ${active ? 'text-black' : 'text-slate-400 group-hover:scale-110'}`} />
      <span className={`text-[10px] font-bold uppercase tracking-tight ${active ? 'text-black' : 'text-slate-500'}`}>
        {label}
      </span>
    </motion.button>
  );
}