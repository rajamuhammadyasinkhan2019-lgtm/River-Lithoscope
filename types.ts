
export enum AppMode {
  TEACHING = 'Teaching Mode',
  PROFESSIONAL = 'Professional Mode',
  EXPLORATION = 'Exploration Mode'
}

export interface AnalysisResult {
  summary: string;
  drainageContext: string;
  transportHistory: string;
  fossilGemAssessment: string;
  economicSignificance: string;
  confidence: number;
  recommendations: string;
  fullRawText: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  base64: string;
  mimeType: string;
}
