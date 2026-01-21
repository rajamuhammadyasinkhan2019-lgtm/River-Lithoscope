
import React from 'react';
import { FieldRecord } from '../services/storageService';
import { AppMode } from '../types';

interface Props {
  records: FieldRecord[];
}

export const FieldStatistics: React.FC<Props> = ({ records }) => {
  if (records.length === 0) return null;

  // Process data: Group by date and mode
  const dataMap: Record<string, Record<string, number>> = {};
  
  // Sort records by timestamp ascending
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);

  sortedRecords.forEach(record => {
    const date = new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!dataMap[date]) {
      dataMap[date] = {
        [AppMode.TEACHING]: 0,
        [AppMode.PROFESSIONAL]: 0,
        [AppMode.EXPLORATION]: 0
      };
    }
    dataMap[date][record.mode]++;
  });

  const dates = Object.keys(dataMap);
  const maxTotal = Math.max(...dates.map(d => 
    dataMap[d][AppMode.TEACHING] + dataMap[d][AppMode.PROFESSIONAL] + dataMap[d][AppMode.EXPLORATION]
  ), 1);

  const colors = {
    [AppMode.TEACHING]: '#60a5fa', // blue-400
    [AppMode.PROFESSIONAL]: '#34d399', // emerald-400
    [AppMode.EXPLORATION]: '#fbbf24' // amber-400
  };

  return (
    <div className="stone-card rounded-2xl p-6 mb-8 border-emerald-500/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Temporal Mode Distribution</h3>
        <div className="flex gap-4">
          {Object.entries(colors).map(([mode, color]) => (
            <div key={mode} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">{mode.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-48 w-full flex items-end gap-2 md:gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {dates.map((date) => {
          const vals = dataMap[date];
          const total = vals[AppMode.TEACHING] + vals[AppMode.PROFESSIONAL] + vals[AppMode.EXPLORATION];
          
          return (
            <div key={date} className="flex-1 min-w-[40px] flex flex-col items-center gap-2">
              <div className="w-full relative flex flex-col justify-end h-32 bg-slate-800/30 rounded-t-lg overflow-hidden group">
                <div 
                  className="w-full transition-all duration-500 bg-amber-400" 
                  style={{ height: `${(vals[AppMode.EXPLORATION] / maxTotal) * 100}%` }}
                  title={`Exploration: ${vals[AppMode.EXPLORATION]}`}
                />
                <div 
                  className="w-full transition-all duration-500 bg-emerald-400" 
                  style={{ height: `${(vals[AppMode.PROFESSIONAL] / maxTotal) * 100}%` }}
                  title={`Professional: ${vals[AppMode.PROFESSIONAL]}`}
                />
                <div 
                  className="w-full transition-all duration-500 bg-blue-400" 
                  style={{ height: `${(vals[AppMode.TEACHING] / maxTotal) * 100}%` }}
                  title={`Teaching: ${vals[AppMode.TEACHING]}`}
                />
                
                {/* Tooltip on hover */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{date}</span>
            </div>
          );
        })}
      </div>
      
      {dates.length === 0 && (
        <div className="h-40 flex items-center justify-center text-slate-600 italic text-sm">
          Insufficient data for temporal visualization.
        </div>
      )}
    </div>
  );
};
