import type { FlashCard, QuizAttempt, QuizItem, QuizMastery } from '@/types';
import { isQuizItemCurrent } from './fingerprint';

/** 每轮默认题目数 */
export const DEFAULT_ROUND_SIZE = 10;
/** 错题重练一轮默认只给 5 道，启动成本低，碎片时间也能做完 */
export const DEFAULT_REVIEW_SIZE = 5;

export type RoundMode = 'mixed' | 'review';

export interface RoundPlan {
  total: number;
  /** 已有缓存、且卡片没改过，可以直接复用 */
  reuse: QuizItem[];
  /** 没有题或题目已过期，需要生成 */
  toGenerate: FlashCard[];
}

/** 错题队列里的一道题 */
export interface ReviewEntry {
  cardId: string;
  /** 下次到期时间；老数据没有掌握度时用最后作答时间兜底 */
  dueAt: number;
  wrongCount: number;
  strength: number;
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
 * 错题队列：最近一次作答是错的题。
 *
 * 不单独存一份「错题本」，每次从 attempts + mastery 现算。
 * 这样不会出现「错题本和真实作答记录对不上」这种经典脏数据问题。
 */
function collectReviewPool(stats: CardStats[], mastery: Record<string, QuizMastery>): CardStats[] {
  return stats
    .filter((stat) => {
      const entry = mastery[stat.card.id];
      if (entry) return entry.lastCorrect === false;
      return stat.lastCorrect === false;
    })
    .sort((a, b) => {
      const timeA = mastery[a.card.id]?.dueAt ?? a.lastAt;
      const timeB = mastery[b.card.id]?.dueAt ?? b.lastAt;
      if (timeA !== timeB) return timeA - timeB;
      return b.wrongCount - a.wrongCount;
    });
}

/** 对外暴露的错题队列，用于入口处的「还有 N 道」 */
export function buildReviewQueue(input: {
  cards: FlashCard[];
  attempts: QuizAttempt[];
  mastery?: Record<string, QuizMastery>;
  now?: number;
}): ReviewEntry[] {
  const { cards, attempts, mastery = {} } = input;
  const uniqueCards = [...new Map(cards.map((card) => [card.id, card])).values()];
  const stats = collectStats(uniqueCards, attempts);

  return collectReviewPool(stats, mastery).map((stat) => ({
    cardId: stat.card.id,
    dueAt: mastery[stat.card.id]?.dueAt ?? stat.lastAt,
    wrongCount: stat.wrongCount,
    strength: mastery[stat.card.id]?.strength ?? 0,
  }));
}

/**
 * 本轮给「没测过的新题」留几个位置。
 *
 * 不是固定 20%：由到期积压的压力决定。
 * - 积压 ≥ 60%：只留 1 道新题，先把欠账还完（但不断供，保持新鲜感）
 * - 积压 ≥ 30%：留 20%
 * - 积压很轻：留 40%，让用户多接触新内容
 */
export function freshQuotaFor(total: number, dueCount: number, freshCount: number): number {
  if (total <= 0 || freshCount <= 0) return 0;

  const pressure = dueCount / total;
  const ratio = pressure >= 0.6 ? 0.1 : pressure >= 0.3 ? 0.2 : 0.4;

  // 只要还有新题，至少给 1 道，避免连续几轮全是复习
  return Math.min(Math.max(1, Math.ceil(total * ratio)), freshCount);
}

/**
 * 组一卷题。
 *
 * `mixed`（默认）：到期题 → 新题（按积压自适应配额）→ 未到期题。
 * `review`：只从错题队列里出，不掺新题、不拉未到期的题，用于「错题重练」。
 *
 * 每张卡只出一题，题目由卡片派生，所以总题数不会超过卡片数。
 */
export function buildRoundPlan(input: {
  cards: FlashCard[];
  items: Record<string, QuizItem>;
  attempts: QuizAttempt[];
  mastery?: Record<string, QuizMastery>;
  size?: number;
  mode?: RoundMode;
  now?: number;
  random?: () => number;
}): RoundPlan {
  const {
    cards,
    items,
    attempts,
    mastery = {},
    size,
    mode = 'mixed',
    now = Date.now(),
    random = Math.random,
  } = input;

  // 同一张卡可能被重复收藏，按 id 去重，避免一轮里出现两道一样的题
  const uniqueCards = [...new Map(cards.map((card) => [card.id, card])).values()];
  if (uniqueCards.length === 0) {
    return { total: 0, reuse: [], toGenerate: [] };
  }

  const stats = collectStats(uniqueCards, attempts);

  let selected: CardStats[];

  if (mode === 'review') {
    const reviewPool = collectReviewPool(stats, mastery);
    const total = Math.min(size ?? DEFAULT_REVIEW_SIZE, reviewPool.length);
    if (total === 0) return { total: 0, reuse: [], toGenerate: [] };
    selected = shuffle(reviewPool.slice(0, total), random);
  } else {
    const due = stats
      .filter((stat) => {
        const entry = mastery[stat.card.id];
        if (entry) return entry.dueAt <= now;
        // 没有掌握度记录时（老数据，或只答过题还没写掌握度），答错过的题视为该复习
        return stat.wrongCount > 0;
      })
      .sort((a, b) => {
        const entryA = mastery[a.card.id];
        const entryB = mastery[b.card.id];
        const wrongA = entryA ? !entryA.lastCorrect : a.lastCorrect === false;
        const wrongB = entryB ? !entryB.lastCorrect : b.lastCorrect === false;
        // 刚答错的排最前，其次按到期时间从早到晚
        if (wrongA !== wrongB) return wrongA ? -1 : 1;
        const timeA = entryA ? entryA.dueAt : a.lastAt;
        const timeB = entryB ? entryB.dueAt : b.lastAt;
        if (timeA !== timeB) return timeA - timeB;
        return b.wrongCount - a.wrongCount;
      });

    const fresh = shuffle(
      stats.filter((stat) => !mastery[stat.card.id] && stat.attemptCount === 0),
      random
    );

    const dueIds = new Set(due.map((stat) => stat.card.id));
    const freshIds = new Set(fresh.map((stat) => stat.card.id));
    const rest = stats
      .filter((stat) => !dueIds.has(stat.card.id) && !freshIds.has(stat.card.id))
      .sort((a, b) => a.lastAt - b.lastAt);

    const total = Math.min(size ?? DEFAULT_ROUND_SIZE, stats.length);
    const freshQuota = freshQuotaFor(total, Math.min(due.length, total), fresh.length);
    // 给新题留位置，剩下的名额才给到期题，避免一轮全是复习题
    const dueQuota = Math.max(0, total - freshQuota);

    const picked: CardStats[] = [];
    picked.push(...due.slice(0, dueQuota));
    picked.push(...fresh.slice(0, freshQuota));

    // 剩下名额按「未到期 → 多余的新题 → 超出配额的到期题」补齐
    const remaining = [...rest, ...fresh.slice(freshQuota), ...due.slice(dueQuota)];
    for (const stat of remaining) {
      if (picked.length >= total) break;
      picked.push(stat);
    }

    selected = shuffle(picked, random).slice(0, total);
  }

  const reuse: QuizItem[] = [];
  const toGenerate: FlashCard[] = [];
  for (const stat of selected) {
    const item = items[stat.card.id];
    if (item && isQuizItemCurrent(item, stat.card)) {
      reuse.push(item);
    } else {
      toGenerate.push(stat.card);
    }
  }

  return { total: selected.length, reuse, toGenerate };
}
