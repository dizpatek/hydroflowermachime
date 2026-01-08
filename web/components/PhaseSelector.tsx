import React from 'react';
import { GrowthPhase } from '../types';
import { Sprout, Flower, Leaf, Droplets } from 'lucide-react';

interface PhaseSelectorProps {
  currentPhase: GrowthPhase;
  onChangePhase: (phase: GrowthPhase) => void;
  dayCount: number;
}

export const PhaseSelector: React.FC<PhaseSelectorProps> = ({ currentPhase, onChangePhase, dayCount }) => {
  const phases = Object.values(GrowthPhase);

  const getIcon = (phase: GrowthPhase) => {
    switch (phase) {
      case GrowthPhase.GERMINATION: return Sprout;
      case GrowthPhase.SEEDLING: return Sprout;
      case GrowthPhase.VEGETATIVE: return Leaf;
      case GrowthPhase.EARLY_FLOWER: return Flower;
      case GrowthPhase.LATE_FLOWER: return Flower;
      case GrowthPhase.FLUSH: return Droplets;
      default: return Leaf;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Büyüme Protokolü</h3>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-mono">
          Gün: {dayCount}
        </span>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {phases.map((phase) => {
          const isActive = currentPhase === phase;
          const Icon = getIcon(phase);
          
          return (
            <button
              key={phase}
              onClick={() => onChangePhase(phase)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Icon size={16} />
              <span className="whitespace-nowrap">{phase.split(':')[1]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};