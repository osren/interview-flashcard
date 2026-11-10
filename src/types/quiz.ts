import type { ModuleType } from './card';

/**
 * 一道由卡片派生出来的单选题。
 *
 * 设计要点：题目是卡片的「派生视图」，不是新的数据源。
 * - cardId 指回原卡片，结果页可以跳回去看原题
 * - cardVersion 是卡片 question+answer 的指纹，卡片被编辑过就重新生成
 * - generatedAt 用于多端合并时取较新的一份
 */
export interface QuizItem {
  /** 题目标识，与源卡片一一对应：`quiz:${cardId}` */
  id: string;
  cardId: string;
  module: ModuleType;
  chapterId: string;
  /** 源卡片的问题，用于结果页回链展示 */
  question: string;
  /** 题干 */
  stem: string;
  /** 选项，2~4 个 */
  options: string[];
  /** 正确项下标 */
  answerIndex: number;
  /** 解析：为什么选它、其他项错在哪 */
  explanation: string;
  /** 考点，一句话 */
  point: string;
  /** 卡片内容指纹，用于判断题目是否过期 */
  cardVersion: string;
  generatedAt: number;
}

/** 一次作答记录。id 由 sessionId + itemId 拼成，多端合并时用于并集去重 */
export interface QuizAttempt {
  id: string;
  sessionId: string;
  itemId: string;
  cardId: string;
  correct: boolean;
  selectedIndex: number;
  at: number;
}

/** 单题作答详情（前端内存态，不落库） */
export interface QuizAnswerDetail {
  item: QuizItem;
  selectedIndex: number;
  correct: boolean;
}

/** 单题掌握度：0 新题 / 1 弱 / 2 中 / 3 强 */
export interface QuizMastery {
  cardId: string;
  strength: number;
  /** 下次到期时间戳（毫秒），小于等于当前时间就算「今天该复习」 */
  dueAt: number;
  /** 最近一次作答时间 */
  lastAt: number;
  /** 最近一次是否正确，用于把「刚答错的」排到前面 */
  lastCorrect: boolean;
}

/** 一轮测验的结果 */
export interface QuizRoundResult {
  total: number;
  correct: number;
  /** 正确率，0~100 的整数 */
  accuracy: number;
  details: QuizAnswerDetail[];
}
