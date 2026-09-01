import { CardProgress } from './card';

export interface LearningProgress {
  cardProgress: Record<string, CardProgress>;
  totalMastered: number;
  totalCards: number;
  lastVisited?: {
    cardId: string;
    timestamp: number;
  };
}

export interface FilterOptions {
  module?: 'core' | 'projects' | 'algorithms';
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'unvisited' | 'remembered' | 'review';
  search?: string;
}
