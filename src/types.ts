export interface Podcast {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl?: string; // Optional audio URL for transcription
  host: string;
  date: string;
  duration?: string; // Optional duration
  category: string;
}

export interface Summary {
  id: string;
  podcastId: string;
  content: string;
  format: 'bullet-points' | 'paragraph' | 'key-takeaways' | 'executive-summary';
  length: 'short' | 'medium' | 'long';
  characterCount: number;
  createdAt: string;
  podcast: Podcast;
}

export interface SummaryOptions {
  format: 'bullet-points' | 'paragraph' | 'key-takeaways' | 'executive-summary';
  characterLimit: number;
}

export interface SummarizationProgress {
  stage: 'analyzing' | 'processing' | 'transcribing' | 'summarizing' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  estimatedTimeMs?: number;
}
