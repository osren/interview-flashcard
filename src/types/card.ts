// 卡片状态
export type CardStatus = 'unvisited' | 'forgotten' | 'fuzzy' | 'mastered';

// 难度等级
export type Difficulty = 'easy' | 'medium' | 'hard';

// 模块类型
export type ModuleType = 'core' | 'projects' | 'algorithms' | 'custom' | 'ai' | 'interview' | 'mpx';

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
  /**
   * 答案图解 URL（仅存 URL，不存图片文件）
   *
   * 展示约定（前端 AnswerImageViewer 统一处理）：
   * - 卡片背面：宽度自适应（w-full），保持图片原始比例
   * - 全屏：Portal 挂 body + 背景遮罩，按 1316×740 比例适配浏览器宽度
   * - 交互：点击遮罩 / Esc / 关闭按钮退出
   * - 格式：优先 PNG；CDN 可用 ?eo-img.format=webp 等参数
   */
  answerImage?: string;
}

// 卡片进度
export interface CardProgress {
  status: CardStatus;
  lastReviewed?: number;
  reviewCount: number;
}
