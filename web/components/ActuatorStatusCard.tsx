import React from 'react';
import { motion } from 'framer-motion';
import { Power, Clock } from 'lucide-react';

interface ActuatorStatusProps {
    name: string;
    icon: React.ReactNode;
    state: boolean;
    lastRun?: string;
    schedule?: string;
    speed?: number;
    color?: string;
}

export function ActuatorStatusCard({
    name,
    icon,
    state,
    lastRun,
    schedule,
    speed,
    color = 'blue'
}: ActuatorStatusProps) {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className={`p-4 rounded-2xl border ${colors[color]}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${colors[color]}`}>
                        {icon}
                    </div>
                    <span className="text-white font-medium text-sm">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className={`text-xs font-bold ${state ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {state ? 'AÇIK' : 'KAPALI'}
                    </span>
                </div>
            </div>

            {speed !== undefined && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Hız:</span>
                    <span className="text-cyan-400 font-mono">{speed}/255</span>
                </div>
            )}

            {lastRun && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>Son: {lastRun}</span>
                </div>
            )}

            {schedule && (
                <div className="text-xs text-slate-500 mt-2">
                    Program: {schedule}
                </div>
            )}
        </motion.div>
    );
}
