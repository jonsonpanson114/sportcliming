export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date;
}

export interface VideoSummaryData {
  keyPoints: string[];
  techniques: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null;
}

export interface Route {
  grade: string;
  attempts: number;
  success: boolean;
  notes: string;
}

export interface PracticeRecordInput {
  gymName?: string;
  duration?: number;
  practiceMenuId?: string;
  videoId?: string;
  routes: Route[];
  reflection?: string;
  nextGoal?: string;
}
