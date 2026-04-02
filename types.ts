export interface CactiNodeMapping {
  id: string;
  tags: string[];
  clientName: string;
  description: string;
  bandwidth: string;
}

export interface ScrapedNode {
  mapping: CactiNodeMapping;
  imageUrl: string; // Base64 of the cropped graph
  originalTitle: string;
}

export interface ReportDateRange {
  start: string; // YYYY-MM-DDTHH:mm
  end: string;   // YYYY-MM-DDTHH:mm
}

export enum AppStep {
  AUTH = 'AUTH',
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  SELECTION = 'SELECTION',
  GENERATING = 'GENERATING',
  FINISHED = 'FINISHED'
}