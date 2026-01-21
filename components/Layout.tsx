
import React, { useState, useEffect } from 'react';
import { Waves, Mountain, Gem, Wifi, WifiOff } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col geology-gradient text-slate-100">
      <header className="sticky top-0 z-50 stone-card border-b border-slate-700/50 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
              <Waves className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-white">
                RIVER<span className="text-emerald-400 italic">LITHOSCOPE</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-medium">
                AI Geological Advisor
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
              isOnline ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Cloud Active' : 'Field Mode'}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      <footer className="mt-auto border-t border-slate-800 bg-slate-950/50 p-6 text-center">
        <div className="max-w-7xl mx-auto text-xs md:text-sm text-slate-500 flex flex-col gap-2">
          <p>Expert App Developer: <span className="text-slate-300 font-semibold">Muhammad Yasin Khan</span></p>
          <p>Powered By: <span className="text-emerald-500/80 font-semibold">Google Gemini 3 Flash Preview</span></p>
          <p className="mt-2 opacity-50">&copy; {new Date().getFullYear()} RiverLithoscope. For educational and advisory use only.</p>
        </div>
      </footer>
    </div>
  );
};
