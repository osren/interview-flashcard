import type { FlashCard, QuizAttempt, QuizItem } from '@/types';
import { isQuizItemStale } from './fingerprint';

/** 每轮默认题目数 */
export const DEFAULT_ROUND_SIZE = 10;
/** 薄弱题最多占几道，避免一轮全是难题直接劝退 */
const WEAK_QUOTA_RATIO = 0.6;
/** 每轮最多掺几道没测过的新题 */
const FRESH_QUOTA_RATIO = 0.2;

export interface RoundPlan {
  total: number;
  /** 已有缓存、且卡片没改过，可以直接复用 */
  reuse: QuizItem[];
  /** 没有题或题目已过期，需要生成 */
  toGenerate: FlashCard[];
}

interface CardStats {
  card: FlashCard;
  attemptCount: number;
  wrongCount: number;
  /** 最近一次作答时间，没做过为 0 */
  lastAt: number;
  lastCorrect: boolean | null;
}

function collectStats(cards: FlashCard[], attempts: QuizAttempt[]): CardStats[] {
  const statMap = new Map<string, CardStats>();
  for (const card of cards) {
    statMap.set(card.id, {
      card,
      attemptCount: 0,
      wrongCount: 0,
      lastAt: 0,
      lastCorrect: null,
    });
  }

  for (const attempt of attempts) {
    const stat = statMap.get(attempt.cardId);
    if (!stat) continue;
    stat.attemptCount += 1;
    if (!attempt.correct) stat.wrongCount += 1;
    if (attempt.at >= stat.lastAt) {
      stat.lastAt = attempt.at;
      stat.lastCorrect = attempt.correct;
    }
  }

  return [...statMap.values()];
}

function shuffle<T>(list: T[], random: () => number): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/**
 * 组一卷题。
 *
 * 抽题顺序不是「随机 10 道」，而是三类优先：
 * 1. 薄弱题：答错过，错得越多越靠前（针对性最强）
 * 2. 新题：一次都没测过，限量掺入（保持新鲜感，也不至于全错）
 * 3. 其余题：最久没做过的先来（P0 用「最后一次作答时间」近似到期）
 *
 * 每张卡只出一题，题目由卡片派生，所以总题数不会超过卡片数。
 */
export function buildRoundPlan(input: {
  cards: FlashCard[];
  items: Record<string, QuizItem>;
  attempts: QuizAttempt[];
  size?: number;
  random?: () => number;
}): RoundPlan {
  const { cards, items, attempts, size = DEFAULT_ROUND_SIZE, random = Math.random } = input;

  // 同一张卡可能被重复收藏，按 id 去重，避免一轮里出现两道一样的题
  const uniqueCards = [...new Map(cards.map((card) => [card.id, card])).values()];
  if (uniqueCards.length === 0) {
    return { total: 0, reuse: [], toGenerate: [] };
  }

  const stats = collectStats(uniqueCards, attempts);

  const weak = stats
    .filter((stat) => stat.wrongCount > 0)
    .sort((a, b) => {
      if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
      return b.lastAt - a.lastAt;
    });

  const fresh = shuffle(
    stats.filter((stat) => stat.attemptCount === 0),
    random
  );

  const rest = stats
    .filter((stat) => stat.wrongCount === 0 && stat.attemptCount > 0)
    .sort((a, b) => a.lastAt - b.lastAt);

  const total = Math.min(size, stats.length);
  const weakQuota = Math.min(Math.ceil(total * WEAK_QUOTA_RATIO), weak.length);
  const freshQuota = Math.min(Math.ceil(total * FRESH_QUOTA_RATIO), fresh.length);

  const picked: CardStats[] = [];
  picked.push(...weak.slice(0, weakQuota));
  picked.push(...fresh.slice(0, freshQuota));

  // 剩下名额按「最久没做 → 新题 → 剩余薄弱题」补齐
  const remaining = [...rest, ...fresh.slice(freshQuota), ...weak.slice(weakQuota)];
  for (const stat of remaining) {
    if (picked.length >= total) break;
    picked.push(stat);
  }

  const selected = shuffle(picked, random).slice(0, total);

  const reuse: QuizItem[] = [];
  const toGenerate: FlashCard[] = [];
  for (const stat of selected) {
    const item = items[stat.card.id];
    if (item && !isQuizItemStale(item.cardVersion, stat.card)) {
      reuse.push(item);
    } else {
      toGenerate.push(stat.card);
    }
  }

  return { total: selected.length, reuse, toGenerate };
}
