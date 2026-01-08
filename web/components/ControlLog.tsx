import React from 'react';
import { SystemLog } from '../types';
import { AlertTriangle, Info, ShieldAlert, Cpu } from 'lucide-react';

interface ControlLogProps {
  logs: SystemLog[];
}

export const ControlLog: React.FC<ControlLogProps> = ({ logs }) => {
  const getIcon = (level: SystemLog['level']) => {
    switch (level) {
      case 'CRITICAL': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'AI_DECISION': return <Cpu className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col h-[300px]">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 rounded-t-xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">AI Karar & Sistem Günlüğü</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-8">Kayıt yok.</div>
        ) : (
          logs.slice().reverse().map((log) => (
            <div key={log.id} className="mb-2 p-2 rounded hover:bg-slate-700/30 border border-transparent hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                {getIcon(log.level)}
                <span className="text-xs text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {log.confidence && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    log.confidence > 0.9 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    Güven: %{(log.confidence * 100).toFixed(0)}
                  </span>
                )}
              </div>
              <p className="text-slate-300 pl-6">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};