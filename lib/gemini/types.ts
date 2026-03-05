export interface QAResponse {
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
}

export interface VideoSummary {
  summary: string;
  keyPoints: string[];
  techniques: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface PracticeMenu {
  exercises: Array<{
    name: string;
    description: string;
    duration: string;
  }>;
}

export interface Quiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Tip {
  title: string;
  content: string;
  category: 'technique' | 'training' | 'mental' | 'equipment';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
