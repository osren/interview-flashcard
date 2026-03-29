// 卡片状态
export type CardStatus = 'unvisited' | 'forgotten' | 'fuzzy' | 'mastered';

// 难度等级
export type Difficulty = 'easy' | 'medium' | 'hard';

// 模块类型
export type ModuleType = 'core' | 'projects' | 'algorithms';

// 卡片数据结构
export interface FlashCard {
  id: string;
  module: ModuleType;
  chapterId: string;
  category?: string;
  question: string;
  answer: string;
  tags: string[];
  status: CardStatus;
  difficulty?: Difficulty;
  codeExample?: string;
  extendQuestion?: string;
}

// 卡片进度
export interface CardProgress {
  status: CardStatus;
  lastReviewed?: number;
  reviewCount: number;
}
