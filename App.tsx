
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ModeSelector } from './components/ModeSelector';
import { ResultView } from './components/ResultView';
import { FieldStatistics } from './components/FieldStatistics';
import { SampleLogForm } from './components/SampleLogForm';
import { AppMode, UploadedImage } from './types';
import { analyzeGeology } from './services/geminiService';
import { StorageService, FieldRecord } from './services/storageService';
import { runLocalHeuristic } from './services/heuristicEngine';
import { Camera, Upload, X, Loader2, Sparkles, AlertTriangle, Book, History as HistoryIcon, Wifi, WifiOff, RotateCcw, Trash2, BarChart2 } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.PROFESSIONAL);
  const [sensitivity, setSensitivity] = useState(60);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeRecord, setActiveRecord] = useState<FieldRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [manualLog, setManualLog] = useState<{ gps?: { lat: number; lng: number }; textureNotes?: string; mineralObservations?: string }>({});

  useEffect(() => {
    setRecords(StorageService.getRecords());
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setError(null);
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const newImage: UploadedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          base64,
          mimeType: file.type
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const runAnalysis = async () => {
    if (images.length === 0) {
      setError("Please capture or upload images for analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const recordId = Math.random().toString(36).substr(2, 9);
    const heuristicResult = await runLocalHeuristic(images[0].url);
    
    const newRecord: FieldRecord = {
      id: recordId,
      images: images.map(img => ({ base64: img.base64, mimeType: img.mimeType, url: img.url })),
      mode: mode,
      timestamp: Date.now(),
      heuristicResult: heuristicResult,
      isQueued: !isOnline,
      manualLog: Object.keys(manualLog).length > 0 ? manualLog : undefined
    };

    try {
      if (isOnline) {
        const analysisText = await analyzeGeology(
          images.map(img => ({ base64: img.base64, mimeType: img.mimeType })),
          mode,
          sensitivity,
          manualLog
        );
        newRecord.cloudResult = analysisText;
        StorageService.saveRecord(newRecord);
      } else {
        newRecord.isQueued = true;
        StorageService.saveRecord(newRecord);
        setError("Offline mode. Local heuristic generated. Analysis saved for cloud sync.");
      }
      setActiveRecord(newRecord);
      setRecords(StorageService.getRecords());
    } catch (err: any) {
      setError(err.message || "Geological computation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const syncRecord = async (record: FieldRecord) => {
    if (!isOnline) return;
    setIsAnalyzing(true);
    try {
      const analysisText = await analyzeGeology(
        record.images.map(img => ({ base64: img.base64, mimeType: img.mimeType })),
        record.mode as AppMode,
        sensitivity,
        record.manualLog
      );
      StorageService.updateRecord(record.id, analysisText);
      const updatedRecords = StorageService.getRecords();
      setRecords(updatedRecords);
      const updatedRecord = updatedRecords.find(r => r.id === record.id);
      if (updatedRecord && activeRecord?.id === record.id) {
        setActiveRecord(updatedRecord);
      }
    } catch (err) {
      setError("Sync failed. Connection might be unstable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImages([]);
    setActiveRecord(null);
    setError(null);
    setManualLog({});
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
              Source-to-Sink Analysis
              {!isOnline && <span className="text-amber-500"><WifiOff size={24} /></span>}
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              {isOnline ? 'Full Multimodal Intelligence Active' : 'Limited Offline Edge-Heuristics Active'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-all ${
                showStats ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Toggle Statistics"
            >
              <BarChart2 size={20} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                showHistory ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Book size={18} />
              Field Notebook ({records.length})
            </button>
          </div>
        </div>

        {showStats && <FieldStatistics records={records} />}

        {showHistory && (
          <div className="mb-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon size={14} /> Recent Field Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {records.length === 0 && <p className="text-slate-600 italic text-sm p-4 stone-card rounded-xl">No records yet. Start a field analysis!</p>}
              {records.map(record => (
                <div key={record.id} className="stone-card rounded-xl p-4 flex gap-4 group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                    <img src={record.images[0].url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-300 truncate">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </p>
                      <button onClick={() => {
                        StorageService.deleteRecord(record.id);
                        setRecords(StorageService.getRecords());
                      }} className="text-slate-600 hover:text-rose-400">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">{record.mode}</p>
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => { setActiveRecord(record); setShowHistory(false); }}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                      >
                        View Record
                      </button>
                      {record.isQueued && isOnline && (
                        <button 
                          onClick={() => syncRecord(record)}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Wifi size={10} /> Sync
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeRecord ? (
          <div className="space-y-6">
            <ModeSelector 
              currentMode={mode} 
              onModeChange={setMode} 
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              disabled={isAnalyzing} 
            />

            <div className={`stone-card rounded-3xl p-8 border-dashed border-2 transition-colors ${
              images.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700'
            }`}>
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-800/30 text-emerald-400">
                    <Camera size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Capture Geological Data</h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-xs">
                    Always runs local heuristics. Gemini cloud analysis provides deep geological insights.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <label className="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                      <Camera size={20} /> Field Photo
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} multiple />
                    </label>
                    <label className="flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-600 active:scale-95">
                      <Upload size={20} /> Map / Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} multiple />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Captured Specimens</h3>
                    <button 
                      onClick={reset}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors py-1 px-2 rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 size={14} />
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-700">
                        <img src={img.url} className="w-full h-full object-cover" alt="Field specimen" />
                        <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer text-slate-500 hover:text-emerald-400 transition-all">
                      <Upload size={24} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} multiple />
                    </label>
                  </div>

                  <SampleLogForm onLogChange={setManualLog} />

                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all text-lg shadow-xl active:scale-[0.98] ${
                      isOnline ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        {isOnline ? 'COMPUTING LITHOLOGY...' : 'RUNNING FIELD HEURISTICS...'}
                      </>
                    ) : (
                      <>
                        {isOnline ? <Sparkles size={24} /> : <Book size={24} />}
                        {isOnline ? 'START CLOUD ANALYSIS' : 'SAVE & PREVIEW OFFLINE'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                isOnline ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  activeRecord.cloudResult ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                }`}>
                  {activeRecord.cloudResult ? activeRecord.mode.toUpperCase() : 'OFFLINE HEURISTIC'}
                </span>
                {activeRecord.isQueued && isOnline && (
                  <button 
                    onClick={() => syncRecord(activeRecord)}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline"
                  >
                    <RotateCcw size={12} /> Sync with Gemini
                  </button>
                )}
              </div>
              <button onClick={reset} className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
                <X size={16} /> New Session
              </button>
            </div>

            <ResultView 
              content={activeRecord.cloudResult || activeRecord.heuristicResult || activeRecord.result || ""} 
              comparisonContent={activeRecord.cloudResult ? activeRecord.heuristicResult : undefined}
              manualLog={activeRecord.manualLog}
            />

            <div className="text-center">
              <button onClick={reset} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-all border border-slate-700 shadow-lg">
                Perform New Field Study
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 stone-card rounded-2xl p-6 border-slate-800/50">
           <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
             <AlertTriangle size={14} /> Geological Safety & Ethics
           </h4>
           <ul className="text-xs text-slate-500 space-y-2 leading-relaxed">
             <li>• <b>Analysis Threshold:</b> The sensitivity slider adjusts the internal heuristic filter. High sensitivity allows for more speculative reporting of features.</li>
             <li>• <b>Permissions:</b> Always follow local mining and collection laws. Obtain necessary permits.</li>
             <li>• <b>Environment:</b> Respect conservation areas. Avoid disturbing sensitive river ecosystems.</li>
             <li>• <b>Safety:</b> Maintain safety protocols in high-energy river environments (flash flood awareness).</li>
           </ul>
        </div>
      </div>
    </Layout>
  );
};

export default App;
