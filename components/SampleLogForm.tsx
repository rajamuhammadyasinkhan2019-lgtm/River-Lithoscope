
import React, { useState } from 'react';
import { MapPin, TextSelect, Microscope, Crosshair, Loader2, Trash2, BookOpen } from 'lucide-react';

interface Props {
  onLogChange: (log: { gps?: { lat: number; lng: number }; textureNotes?: string; mineralObservations?: string }) => void;
}

export const SampleLogForm: React.FC<Props> = ({ onLogChange }) => {
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [texture, setTexture] = useState('');
  const [minerals, setMinerals] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleGpsCapture = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGps(newGps);
        setIsLocating(false);
        onLogChange({ gps: newGps, textureNotes: texture, mineralObservations: minerals });
      },
      () => {
        setIsLocating(false);
        alert("Could not capture GPS. Please ensure permissions are granted.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const updateTexture = (val: string) => {
    setTexture(val);
    onLogChange({ gps: gps || undefined, textureNotes: val, mineralObservations: minerals });
  };

  const updateMinerals = (val: string) => {
    setMinerals(val);
    onLogChange({ gps: gps || undefined, textureNotes: texture, mineralObservations: val });
  };

  const clearForm = () => {
    setGps(null);
    setTexture('');
    setMinerals('');
    onLogChange({});
  };

  return (
    <div className="stone-card rounded-2xl p-6 border-emerald-500/20 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <BookOpen size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Field Log Entry</h3>
            <p className="text-[10px] text-slate-500 font-medium">Capture ground-truth observations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button
            onClick={handleGpsCapture}
            disabled={isLocating}
            className={`flex items-center gap-2 text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all ${
              gps 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
            }`}
          >
            {isLocating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
            {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'Log Location'}
          </button>
          {(gps || texture || minerals) && (
            <button 
              onClick={clearForm}
              className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors"
              title="Clear Log"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
            <TextSelect size={12} className="text-emerald-500/70" /> 
            Physical Matrix / Texture
          </label>
          <textarea
            value={texture}
            onChange={(e) => updateTexture(e.target.value)}
            placeholder="Describe sorting, grain shape, fracture patterns..."
            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none h-24 resize-none transition-all placeholder:text-slate-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
            <Microscope size={12} className="text-emerald-500/70" /> 
            Mineralogical Indicators
          </label>
          <textarea
            value={minerals}
            onChange={(e) => updateMinerals(e.target.value)}
            placeholder="Note specific luster, cleavage, inclusions, or metallic flakes..."
            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none h-24 resize-none transition-all placeholder:text-slate-700"
          />
        </div>
      </div>
      
      <p className="text-[9px] text-slate-600 italic">
        * These details will be injected into the Gemini context window to improve diagnostic accuracy.
      </p>
    </div>
  );
};
