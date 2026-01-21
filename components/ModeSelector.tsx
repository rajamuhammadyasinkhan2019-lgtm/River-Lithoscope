
import React from 'react';
import { AppMode } from '../types';
import { GraduationCap, Briefcase, Compass, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<Props> = ({ 
  currentMode, 
  onModeChange, 
  sensitivity, 
  onSensitivityChange, 
  disabled 
}) => {
  const modes = [
    { id: AppMode.TEACHING, icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: AppMode.PROFESSIONAL, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: AppMode.EXPLORATION, icon: Compass, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  const getSensitivityLabel = (val: number) => {
    if (val < 30) return { text: "Speculative", icon: <Zap size={12} />, color: "text-amber-400" };
    if (val > 70) return { text: "Conservative", icon: <ShieldCheck size={12} />, color: "text-emerald-400" };
    return { text: "Balanced", icon: null, color: "text-slate-400" };
  };

  const label = getSensitivityLabel(sensitivity);

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              disabled={disabled}
              onClick={() => onModeChange(m.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                isActive 
                  ? `border-emerald-500 bg-slate-800 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10` 
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`p-2 rounded-lg mb-2 ${m.bg}`}>
                <Icon size={20} className={m.color} />
              </div>
              <span className={`text-[10px] md:text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {m.id.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="stone-card rounded-2xl p-4 border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Analysis Sensitivity
            </label>
            <span className={`text-[10px] font-medium flex items-center gap-1 ${label.color}`}>
              {label.icon} {label.text}
            </span>
          </div>
          <span className="text-sm font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {sensitivity}%
          </span>
        </div>
        
        <input
          type="range"
          min="10"
          max="90"
          step="5"
          value={sensitivity}
          disabled={disabled}
          onChange={(e) => onSensitivityChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[9px] font-bold text-slate-600 uppercase">Speculative</span>
          <span className="text-[9px] font-bold text-slate-600 uppercase">Strict</span>
        </div>
        <p className="text-[9px] text-slate-500 mt-3 leading-relaxed">
          {sensitivity < 30 
            ? "Exploratory setting: Flags subtle structural patterns and ambiguous mineral traces readily." 
            : sensitivity > 70 
              ? "Conservative setting: Only reports features with high visual corroboration and clear morphological evidence."
              : "Standard field calibration: Balanced interpretation of geological features and provenance markers."}
        </p>
      </div>
    </div>
  );
};
