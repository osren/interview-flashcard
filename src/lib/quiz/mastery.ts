import type { FlashCard, QuizMastery } from '@/types';

/** 强度上限：3 级已经足够撑起「新 / 弱 / 中 / 强」四档展示 */
export const STRENGTH_MAX = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 答对后的复习间隔（天）。
 * 下标就是答对后的强度：1 天 → 3 天 → 7 天 → 21 天。
 * 这不是完整的 FSRS，只保留「越熟间隔越长」这条最关键的规律。
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 21];

export const MASTERY_LABELS = ['新题', '生疏', '熟练', '掌握'] as const;

export function masteryLabel(strength: number): string {
  const index = Math.max(0, Math.min(STRENGTH_MAX, Math.floor(strength)));
  return MASTERY_LABELS[index];
}

/**
 * 一次作答后更新掌握度。
 *
 * 答对：强度 +1，间隔按新强度拉长；
 * 答错：强度 -1（不直接归零，否则从「掌握」错一次就掉回新题，打击太大），
 *       并且明天就再考一遍——「错题明天必现」是错题本最有用的地方。
 */
export function nextMastery(
  previous: QuizMastery | undefined,
  cardId: string,
  correct: boolean,
  now: number
): QuizMastery {
  const previousStrength = previous?.strength ?? 0;
  const strength = correct
    ? Math.min(STRENGTH_MAX, previousStrength + 1)
    : Math.max(0, previousStrength - 1);

  // 答对按强度拉长间隔；答错固定「明天再来」，这是错题本最有用的一条规则
  const intervalDays = correct
    ? (REVIEW_INTERVALS_DAYS[strength] ?? REVIEW_INTERVALS_DAYS[0])
    : 1;

  return {
    cardId,
    strength,
    dueAt: now + intervalDays * DAY_MS,
    lastAt: now,
    lastCorrect: correct,
  };
}

export interface MasteryStats {
  total: number;
  /** 强度达到 3 的题数 */
  mastered: number;
  /** 模块掌握度，0~100：已积累强度 / 满分强度 */
  ratio: number;
  /** 强度分布，用于「新 3 / 生疏 5 / 熟练 2 / 掌握 8」这种展示 */
  byLevel: [number, number, number, number];
}

/** 只统计当前还在收藏里的卡片，避免取消收藏后掌握度虚高 */
export function computeMasteryStats(
  cards: FlashCard[],
  mastery: Record<string, QuizMastery>
): MasteryStats {
  const byLevel: [number, number, number, number] = [0, 0, 0, 0];
  let strengthSum = 0;

  for (const card of cards) {
    const entry = mastery[card.id];
    const strength = entry ? Math.max(0, Math.min(STRENGTH_MAX, Math.floor(entry.strength))) : 0;
    byLevel[strength] += 1;
    strengthSum += strength;
  }

  const total = cards.length;
  const ratio = total > 0 ? Math.round((strengthSum / (STRENGTH_MAX * total)) * 100) : 0;

  return {
    total,
    mastered: byLevel[STRENGTH_MAX],
    ratio,
    byLevel,
  };
}

/** 今天到期的题数：只有做过、且 dueAt 已到的才算，新题不计入，避免一开始就堆几十道 */
export function countDueMastery(
  cards: FlashCard[],
  mastery: Record<string, QuizMastery>,
  now: number
): number {
  let count = 0;
  for (const card of cards) {
    const entry = mastery[card.id];
    if (entry && entry.dueAt <= now) count += 1;
  }
  return count;
}
