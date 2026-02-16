
import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Pickaxe, 
  History, 
  Info, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Split, 
  Layout as LayoutIcon, 
  TextSelect, 
  Microscope, 
  BookOpen,
  Download
} from 'lucide-react';

interface Props {
  content: string;
  comparisonContent?: string;
  manualLog?: {
    gps?: { lat: number; lng: number };
    textureNotes?: string;
    mineralObservations?: string;
  };
}

export const ResultView: React.FC<Props> = ({ content, comparisonContent, manualLog }) => {
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  
  const sections = content.split(/\d\.\s+/).filter(Boolean);
  const comparisonSections = comparisonContent?.split(/\d\.\s+/).filter(Boolean) || [];
  
  const getIconForSection = (index: number) => {
    switch (index) {
      case 0: return <Info className="text-blue-400" />;
      case 1: return <MapPin className="text-emerald-400" />;
      case 2: return <History className="text-indigo-400" />;
      case 3: return <Pickaxe className="text-amber-400" />;
      case 4: return <BarChart3 className="text-rose-400" />;
      case 5: return <CheckCircle2 className="text-green-400" />;
      case 6: return <AlertCircle className="text-orange-400" />;
      default: return null;
    }
  };

  const sectionTitles = [
    "Identification Summary",
    "Drainage & River Context",
    "Transport & Weathering History",
    "Fossil / Gem / Mineral Assessment",
    "Economic Significance",
    "Confidence Level",
    "Exploration Recommendations"
  ];

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `riverlithoscope-analysis-${timestamp}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Manual Logs Display - Enhanced "Field Book" Style */}
      {(manualLog?.textureNotes || manualLog?.mineralObservations || manualLog?.gps) && (
        <div className="stone-card rounded-2xl overflow-hidden border-l-4 border-l-emerald-500 shadow-lg">
          <div className="bg-slate-800/50 px-6 py-3 flex items-center justify-between border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} /> Field Notebook Corroboration
            </h3>
            {manualLog.gps && (
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-400">
                <MapPin size={10} className="text-rose-400" /> {manualLog.gps.lat.toFixed(5)}, {manualLog.gps.lng.toFixed(5)}
              </div>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30">
            {manualLog.textureNotes && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                  <TextSelect size={12} /> Logged Texture
                </p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-slate-700 pl-3 py-1">
                  "{manualLog.textureNotes}"
                </p>
              </div>
            )}
            {manualLog.mineralObservations && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                  <Microscope size={12} /> Logged Observations
                </p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-slate-700 pl-3 py-1">
                  "{manualLog.mineralObservations}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {comparisonContent && (
        <div className="flex justify-center mb-4">
          <button 
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
              isCompareMode 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isCompareMode ? <LayoutIcon size={14} /> : <Split size={14} />}
            {isCompareMode ? 'Exit Comparison Mode' : 'Compare with Local Heuristic'}
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isCompareMode ? 'lg:grid-cols-2' : 'md:grid-cols-2'} gap-6`}>
        {sectionTitles.map((title, idx) => {
          const primaryText = sections[idx] || "No cloud data available.";
          const secondaryText = comparisonSections[idx] || "No heuristic data available.";
          
          if (!isCompareMode && idx >= sections.length) return null;

          return (
            <div key={idx} className={`space-y-4 ${
              !isCompareMode && (idx === 4 || idx === 6) ? 'md:col-span-2' : 
              isCompareMode ? 'col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4' : ''
            }`}>
              {isCompareMode ? (
                <>
                  <div className="stone-card rounded-2xl p-6 border-l-4 border-l-emerald-500/50 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/10 text-[8px] font-black text-emerald-400 uppercase">Cloud AI</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-800/50 rounded-lg">
                        {getIconForSection(idx)}
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight">{title}</h3>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                      {primaryText.replace(title + ':', '').trim()}
                    </div>
                  </div>
                  <div className="stone-card rounded-2xl p-6 border-l-4 border-l-amber-500/50 flex flex-col h-full relative overflow-hidden bg-slate-900/40">
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500/10 text-[8px] font-black text-amber-400 uppercase">Local Heuristic</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-800/50 rounded-lg opacity-50">
                        {getIconForSection(idx)}
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight opacity-50">{title}</h3>
                    </div>
                    <div className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap italic">
                      {secondaryText.replace(title + ':', '').trim()}
                    </div>
                  </div>
                </>
              ) : (
                <div className={`stone-card rounded-2xl p-6 border-l-4 ${
                  idx === 4 ? 'border-l-rose-500' : 
                  idx === 6 ? 'border-l-orange-500' : 
                  'border-l-emerald-500/50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      {getIconForSection(idx)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                      {title}
                    </h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {primaryText.replace(title + ':', '').trim()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="stone-card rounded-2xl overflow-hidden border-slate-700/50">
        <div className="flex items-center justify-between p-4 hover:bg-slate-800/5 transition-colors">
          <button 
            onClick={() => setIsRawExpanded(!isRawExpanded)}
            className="flex flex-1 items-center gap-3 text-left group"
          >
            <Terminal size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Intelligence Data Stream</span>
            {isRawExpanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Download Raw Analysis"
          >
            <Download size={12} />
            Export TXT
          </button>
        </div>
        
        {isRawExpanded && (
          <div className="p-4 pt-0 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-slate-950/50 rounded-xl p-4 mt-2 overflow-x-auto">
              <pre className="text-[10px] font-mono text-emerald-500/80 leading-relaxed whitespace-pre-wrap break-words">
                {content}
                {comparisonContent && `\n\n--- LOCAL HEURISTIC FALLBACK ---\n\n${comparisonContent}`}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      {content.includes("Expert App Developer") && (
        <div className="mt-8 pt-6 border-t border-slate-800 text-center opacity-40 text-[10px] italic">
          AI generated technical response validated by RiverLithoscope protocol.
        </div>
      )}
    </div>
  );
};
