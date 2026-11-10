import { describe, expect, it, vi } from 'vitest';
import type { FlashCard, QuizAttempt, QuizItem, QuizMastery } from '@/types';
import type { LearningSyncPayload } from '../learning-sync';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {},
  isSupabaseConfigured: false,
}));

vi.mock('@/store/useCardStore', () => ({
  useCardStore: { getState: () => ({}) },
}));

vi.mock('@/store/useStreakStore', () => ({
  useStreakStore: { getState: () => ({ checkInDates: {} }) },
}));

vi.mock('@/store/useQuizStore', () => ({
  MAX_STORED_ATTEMPTS: 200,
  useQuizStore: { getState: () => ({ items: {}, attempts: [], mastery: {} }) },
}));

import { mergeLearningPayload } from '../learning-sync';

const card = (id: string): FlashCard => ({
  id,
  module: 'core' as FlashCard['module'],
  chapterId: 'javascript',
  question: `题目 ${id}`,
  answer: '答案',
  tags: [],
  status: 'unvisited',
  category: '基础',
});

const payload = (overrides: Partial<LearningSyncPayload> = {}): LearningSyncPayload => ({
  cardStatuses: {},
  cardProgress: {},
  customCards: [],
  modifiedCards: {},
  hiddenCards: {},
  favorites: [],
  checkInDates: {},
  quizItems: {},
  quizAttempts: [],
  quizMastery: {},
  ...overrides,
});

describe('mergeLearningPayload', () => {
  it('云端还留着的卡，不会因为本地删掉而复活', () => {
    const local = payload({
      customCards: [],
      hiddenCards: { 'ai-1': { hidden: true, at: 1000 } },
    });
    const remote = payload({ customCards: [card('ai-1')], favorites: [card('ai-1')] });

    const merged = mergeLearningPayload(local, remote);
    expect(merged.customCards).toHaveLength(0);
    expect(merged.favorites).toHaveLength(0);
    expect(merged.hiddenCards['ai-1'].hidden).toBe(true);
  });

  it('本地恢复（时间更新）能压过云端的隐藏记录', () => {
    const local = payload({ hiddenCards: { 'core-1': { hidden: false, at: 2000 } } });
    const remote = payload({ hiddenCards: { 'core-1': { hidden: true, at: 1000 } } });

    expect(mergeLearningPayload(local, remote).hiddenCards['core-1'].hidden).toBe(false);
  });

  it('本地的旧记录不会覆盖云端更新的记录', () => {
    const local = payload({ hiddenCards: { 'core-1': { hidden: true, at: 1000 } } });
    const remote = payload({ hiddenCards: { 'core-1': { hidden: false, at: 2000 } } });

    expect(mergeLearningPayload(local, remote).hiddenCards['core-1'].hidden).toBe(false);
  });

  it('两端互不相干的删除记录都会保留（删除是单调的）', () => {
    const local = payload({ hiddenCards: { 'a': { hidden: true, at: 100 } } });
    const remote = payload({ hiddenCards: { 'b': { hidden: true, at: 200 } } });

    const merged = mergeLearningPayload(local, remote);
    expect(Object.keys(merged.hiddenCards).sort()).toEqual(['a', 'b']);
  });

  it('旧版本云端数据没有 hiddenCards 字段也能合并', () => {
    const local = payload({ customCards: [card('ai-1')] });
    const remote = payload();

    expect(mergeLearningPayload(local, remote).customCards).toHaveLength(1);
  });

  it('同一张卡的题目两端都有时，取生成时间较新的一份', () => {
    const quizItem = (generatedAt: number, stem: string): QuizItem => ({
      id: 'quiz:core-1',
      cardId: 'core-1',
      module: 'core',
      chapterId: 'javascript',
      question: '题目',
      stem,
      options: ['甲', '乙'],
      answerIndex: 0,
      explanation: '解析',
      point: '考点',
      cardVersion: 'v1',
      generatedAt,
    });

    const local = payload({ quizItems: { 'core-1': quizItem(2000, '本地新题') } });
    const remote = payload({ quizItems: { 'core-1': quizItem(1000, '云端旧题') } });

    expect(mergeLearningPayload(local, remote).quizItems['core-1'].stem).toBe('本地新题');
  });

  it('作答记录按 id 并集去重，两端做的题都留得下来', () => {
    const attempt = (id: string, at: number): QuizAttempt => ({
      id,
      sessionId: 's',
      itemId: 'quiz:core-1',
      cardId: 'core-1',
      correct: true,
      selectedIndex: 0,
      at,
    });

    const local = payload({ quizAttempts: [attempt('s1:quiz:core-1', 1000)] });
    const remote = payload({
      quizAttempts: [attempt('s1:quiz:core-1', 1000), attempt('s2:quiz:core-1', 2000)],
    });

    const merged = mergeLearningPayload(local, remote);
    expect(merged.quizAttempts).toHaveLength(2);
    // 新的排前面，方便结果页和后续掌握度直接取最近记录
    expect(merged.quizAttempts[0].at).toBe(2000);
  });

  it('掌握度会升降级，合并时只能取较新的一条，不能并集', () => {
    const mastery = (strength: number, lastAt: number): QuizMastery => ({
      cardId: 'core-1',
      strength,
      dueAt: lastAt + 1000,
      lastAt,
      lastCorrect: strength > 0,
    });

    const local = payload({ quizMastery: { 'core-1': mastery(3, 3000) } });
    const remote = payload({ quizMastery: { 'core-1': mastery(1, 1000) } });

    expect(mergeLearningPayload(local, remote).quizMastery['core-1'].strength).toBe(3);
  });
});
