import { describe, expect, it } from 'vitest';
import type { FlashCard } from '@/types';
import { countHiddenInChapter, mergeChapterCards } from '../cardMerge';

const card = (id: string, chapterId = 'javascript', module = 'core'): FlashCard => ({
  id,
  module: module as FlashCard['module'],
  chapterId,
  question: `题目 ${id}`,
  answer: '答案',
  tags: [],
  status: 'unvisited',
  category: '基础',
});

describe('mergeChapterCards', () => {
  it('页面已合并过时不重复追加，且返回原数组', () => {
    const cards = [card('static-1'), card('ai-1')];
    expect(mergeChapterCards(cards, [card('ai-1')], {}, 'core', 'javascript')).toBe(cards);
  });

  it('页面还没刷新到新卡片时补在末尾', () => {
    const merged = mergeChapterCards([card('static-1')], [card('ai-1')], {}, 'core', 'javascript');
    expect(merged).toHaveLength(2);
    expect(merged[1].id).toBe('ai-1');
  });

  it('不会把别的章节或模块的自定义卡混进来', () => {
    const merged = mergeChapterCards(
      [card('static-1')],
      [card('ai-2', 'react'), card('ai-3', 'javascript', 'mpx')],
      {},
      'core',
      'javascript'
    );
    expect(merged).toHaveLength(1);
  });

  it('改过的题目立刻以修改后的内容出现', () => {
    const merged = mergeChapterCards(
      [card('static-1')],
      [],
      { 'static-1': { question: '改过的问题', answer: '改过的答案' } },
      'core',
      'javascript'
    );
    expect(merged[0].question).toBe('改过的问题');
    expect(merged[0].answer).toBe('改过的答案');
    // 未修改的字段保留
    expect(merged[0].category).toBe('基础');
  });

  it('自定义卡也能应用修改', () => {
    const merged = mergeChapterCards(
      [],
      [card('ai-1')],
      { 'ai-1': { answer: '重写后的答案' } },
      'core',
      'javascript'
    );
    expect(merged[0].answer).toBe('重写后的答案');
  });

  it('被删除（隐藏）的题目不再出现，包括自定义卡', () => {
    const merged = mergeChapterCards(
      [card('static-1'), card('static-2')],
      [card('ai-1')],
      {},
      'core',
      'javascript',
      ['static-1', 'ai-1']
    );
    expect(merged.map((item) => item.id)).toEqual(['static-2']);
  });

  it('隐藏后不影响其他章节', () => {
    const hidden = ['react-1'];
    const merged = mergeChapterCards([card('static-1')], [], {}, 'core', 'javascript', hidden);
    expect(merged).toHaveLength(1);
  });
});

describe('countHiddenInChapter', () => {
  it('统计本章隐藏数量，且父页面已合并时不会重复计数', () => {
    // cards 里已含自定义卡（父页面 getMergedCards 的结果）
    const cards = [card('static-1'), card('ai-1')];
    const customCards = [card('ai-1')];
    expect(countHiddenInChapter(cards, customCards, 'javascript', ['static-1', 'ai-1'])).toBe(2);
  });

  it('没有隐藏时返回 0', () => {
    expect(countHiddenInChapter([card('static-1')], [], 'javascript', [])).toBe(0);
  });
});
