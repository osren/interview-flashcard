import { describe, expect, it, vi } from 'vitest';
import type { FlashCard } from '@/types';
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
});
