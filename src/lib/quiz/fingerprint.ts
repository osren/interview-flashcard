import type { FlashCard } from '@/types';

/**
 * FNV-1a 32 位哈希。
 * 这里只用来判断「卡片内容有没有变」，不用于安全场景，不追求抗碰撞。
 */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/**
 * 卡片内容指纹：问题和答案任意一处被编辑，指纹就会变。
 * 归一化掉空白差异，避免只改了行尾空格就整题重生成。
 */
export function cardFingerprint(card: Pick<FlashCard, 'question' | 'answer'>): string {
  const normalized = `${card.question}\u0000${card.answer}`
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return fnv1a(normalized).toString(16).padStart(8, '0');
}

/** 题目是否还对应得上当前的卡片内容 */
export function isQuizItemStale(itemCardVersion: string, card: Pick<FlashCard, 'question' | 'answer'>): boolean {
  return itemCardVersion !== cardFingerprint(card);
}
