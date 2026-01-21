
import React, { useState } from 'react';
import { MapPin, TextSelect, Microscope, Crosshair, Loader2 } from 'lucide-react';

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
      { enableHighAccuracy: true }
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

  return (
    <div className="stone-card rounded-2xl p-5 border-emerald-500/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <TextSelect size={14} className="text-emerald-400" />
          Field Observations
        </h3>
        <button
          onClick={handleGpsCapture}
          disabled={isLocating}
          className="flex items-center gap-2 text-[10px] font-bold py-1 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
        >
          {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
          {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'Capture GPS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <TextSelect size={10} /> Texture & Grain Notes
          </label>
          <textarea
            value={texture}
            onChange={(e) => updateTexture(e.target.value)}
            placeholder="e.g. Gritty, well-sorted, visible quartz veins..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:border-emerald-500/50 outline-none h-16 resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <Microscope size={10} /> Specific Mineral Observations
          </label>
          <textarea
            value={minerals}
            onChange={(e) => updateMinerals(e.target.value)}
            placeholder="e.g. Pyrite clusters, mica flakes, heavy minerals..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:border-emerald-500/50 outline-none h-16 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
