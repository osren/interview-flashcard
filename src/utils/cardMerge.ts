import type { FlashCard } from '@/types';

/**
 * 把章节卡片合成当前应该显示的列表：
 * 1. 丢掉被隐藏的卡片（内置题的"删除"记在 hiddenCardIds 里，随时可恢复）；
 * 2. 应用用户改过的内容（modifiedCards）；
 * 3. 补上页面还没刷新到的自定义卡片，按 id 去重。
 * 每一步都是幂等的：页面自己已经合并过时，结果不变。
 */
export function mergeChapterCards(
  cards: FlashCard[],
  customCards: FlashCard[],
  modifiedCards: Record<string, Partial<FlashCard>>,
  module: string,
  chapterId: string,
  hiddenCardIds: string[] = []
): FlashCard[] {
  const hidden = new Set(hiddenCardIds);
  const visible = hidden.size > 0 ? cards.filter((card) => !hidden.has(card.id)) : cards;

  const visibleIds = new Set(visible.map((card) => card.id));
  const extra = customCards.filter(
    (card) =>
      card.module === module &&
      card.chapterId === chapterId &&
      !hidden.has(card.id) &&
      !visibleIds.has(card.id)
  );

  const apply = (card: FlashCard): FlashCard => {
    const modification = modifiedCards[card.id];
    return modification ? { ...card, ...modification } : card;
  };

  const hasModification = visible.some((card) => modifiedCards[card.id]);
  if (extra.length === 0 && !hasModification) return visible;
  return [...visible.map(apply), ...extra.map(apply)];
}

/** 本章里被隐藏的卡片数量（用于显示"已隐藏 N 道"） */
export function countHiddenInChapter(
  cards: FlashCard[],
  customCards: FlashCard[],
  chapterId: string,
  hiddenCardIds: string[]
): number {
  const hidden = new Set(hiddenCardIds);
  const ids = new Set<string>();
  for (const card of cards) {
    if (hidden.has(card.id)) ids.add(card.id);
  }
  for (const card of customCards) {
    if (card.chapterId === chapterId && hidden.has(card.id)) ids.add(card.id);
  }
  return ids.size;
}
