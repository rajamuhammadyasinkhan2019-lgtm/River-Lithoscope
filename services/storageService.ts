
export interface FieldRecord {
  id: string;
  images: { base64: string; mimeType: string; url: string }[];
  mode: string;
  timestamp: number;
  result?: string; // Legacy support
  heuristicResult?: string;
  cloudResult?: string;
  isQueued: boolean;
  manualLog?: {
    gps?: { lat: number; lng: number };
    textureNotes?: string;
    mineralObservations?: string;
  };
}

const CACHE_KEY = 'riverlithoscope_records';

export const StorageService = {
  // Simple hash for image data to identify re-scans
  generateHash: (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  },

  getRecords: (): FieldRecord[] => {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRecord: (record: FieldRecord) => {
    const records = StorageService.getRecords();
    records.unshift(record);
    // Keep only last 20 records to manage storage
    localStorage.setItem(CACHE_KEY, JSON.stringify(records.slice(0, 20)));
  },

  updateRecord: (id: string, cloudResult: string) => {
    const records = StorageService.getRecords();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index].cloudResult = cloudResult;
      records[index].isQueued = false;
      localStorage.setItem(CACHE_KEY, JSON.stringify(records));
    }
  },

  deleteRecord: (id: string) => {
    const records = StorageService.getRecords();
    localStorage.setItem(CACHE_KEY, JSON.stringify(records.filter(r => r.id !== id)));
  }
};
