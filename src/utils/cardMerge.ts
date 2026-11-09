import type { FlashCard } from '@/types';

/**
 * 把章节卡片合成当前应该显示的列表：
 * 1. 先应用用户改过的内容（modifiedCards，静态题与自定义题都可能被改过）；
 * 2. 再补上页面还没刷新到的自定义卡片，按 id 去重。
 * 两步都是幂等的：页面自己已经合并过时，结果不变。
 */
export function mergeChapterCards(
  cards: FlashCard[],
  customCards: FlashCard[],
  modifiedCards: Record<string, Partial<FlashCard>>,
  module: string,
  chapterId: string
): FlashCard[] {
  const apply = (card: FlashCard): FlashCard => {
    const modification = modifiedCards[card.id];
    return modification ? { ...card, ...modification } : card;
  };

  const existing = new Set(cards.map((card) => card.id));
  const extra = customCards.filter(
    (card) => card.module === module && card.chapterId === chapterId && !existing.has(card.id)
  );
  const hasModification = cards.some((card) => modifiedCards[card.id]);

  if (extra.length === 0 && !hasModification) return cards;
  return [...cards.map(apply), ...extra.map(apply)];
}
