import type { FlashCard } from '@/types';

/**
 * 把某章节的自定义卡片补进当前列表。
 * 页面自己的合并（getMergedCards）通常已经包含它们；这里只补「页面还没刷新到」的那部分，
 * 按 id 去重，所以既不会重复，也不会漏。
 */
export function mergeChapterCards(
  cards: FlashCard[],
  customCards: FlashCard[],
  module: string,
  chapterId: string
): FlashCard[] {
  const existing = new Set(cards.map((card) => card.id));
  const extra = customCards.filter(
    (card) => card.module === module && card.chapterId === chapterId && !existing.has(card.id)
  );
  return extra.length > 0 ? [...cards, ...extra] : cards;
}
