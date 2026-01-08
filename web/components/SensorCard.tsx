import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  min?: number;
  max?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const SensorCard: React.FC<SensorCardProps> = ({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  min, 
  max 
}) => {
  let statusColor = "text-emerald-400";
  let bgStatus = "bg-emerald-500/10 border-emerald-500/20";
  
  // Logic for numeric values
  if (typeof value === 'number' && min !== undefined && max !== undefined) {
    if (value < min || value > max) {
      statusColor = "text-red-400";
      bgStatus = "bg-red-500/10 border-red-500/20";
    } else if (value < min * 1.05 || value > max * 0.95) {
      statusColor = "text-yellow-400";
      bgStatus = "bg-yellow-500/10 border-yellow-500/20";
    }
  }

  // Logic for string status values
  if (typeof value === 'string') {
    const valUpper = value.toUpperCase();
    const criticalValues = ['LOW', 'DÜŞÜK', 'CRITICAL', 'KRİTİK', 'HATA', 'ERROR', 'STOPPED', 'DURDU'];
    const warningValues = ['WARNING', 'UYARI', 'HIGH', 'YÜKSEK', 'CHECK', 'KONTROL'];
    
    if (criticalValues.some(v => valUpper.includes(v))) {
      statusColor = "text-red-400";
      bgStatus = "bg-red-500/10 border-red-500/20";
    } else if (warningValues.some(v => valUpper.includes(v))) {
      statusColor = "text-yellow-400";
      bgStatus = "bg-yellow-500/10 border-yellow-500/20";
    }
  }

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${bgStatus} transition-all duration-300`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${statusColor}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-mono ${statusColor}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-slate-500 text-xs">{unit}</span>
      </div>
      {(min !== undefined && max !== undefined) && (
        <div className="mt-2 text-xs text-slate-500 flex justify-between">
          <span>Min: {min}</span>
          <span>Max: {max}</span>
        </div>
      )}
    </div>
  );
};