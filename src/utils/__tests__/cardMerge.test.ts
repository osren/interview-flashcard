import { describe, expect, it } from 'vitest';
import type { FlashCard } from '@/types';
import { mergeChapterCards } from '../cardMerge';

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
  it('页面已合并过时不重复追加', () => {
    const cards = [card('static-1'), card('ai-1')];
    expect(mergeChapterCards(cards, [card('ai-1')], 'core', 'javascript')).toBe(cards);
  });

  it('页面还没刷新到新卡片时补在末尾', () => {
    const merged = mergeChapterCards([card('static-1')], [card('ai-1')], 'core', 'javascript');
    expect(merged).toHaveLength(2);
    expect(merged[1].id).toBe('ai-1');
  });

  it('不会把别的章节或模块的自定义卡混进来', () => {
    const merged = mergeChapterCards(
      [card('static-1')],
      [card('ai-2', 'react'), card('ai-3', 'javascript', 'mpx')],
      'core',
      'javascript'
    );
    expect(merged).toHaveLength(1);
  });
});
