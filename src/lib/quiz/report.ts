import type { FlashCard, QuizAttempt, QuizItem, QuizMastery } from '@/types';
import { STRENGTH_MAX, computeMasteryStats } from './mastery';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 一个「最薄弱考点」 */
export interface WeakPoint {
  cardId: string;
  /** 考点一句话；没生成过题目时用卡片问题代替 */
  point: string;
  /** 本周错了几次 */
  wrongCount: number;
  /** 当前强度 */
  strength: number;
}

export interface WeeklyReport {
  /** 统计区间 [from, to) */
  from: number;
  to: number;
  /** 本周作答次数 */
  attempts: number;
  correct: number;
  accuracy: number;
  /** 本周有作答的天数，0~7 */
  activeDays: number;
  /** 本周练到的不同题目数 */
  distinctCards: number;
  /** 周初模块掌握度 */
  startRatio: number;
  /** 当前掌握度 */
  ratio: number;
  /** 掌握度变化，正数为进步 */
  delta: number;
  weakest: WeakPoint[];
  /** 统计所依据的作答记录条数（本地只留最近 200 条） */
  basedOn: number;
}

/**
 * 从作答记录回放某一时刻的强度。
 *
 * 掌握度不需要历史快照：强度只由「答对/答错」的先后顺序决定，
 * 把 upTo 之前的作答按时间顺序重放一遍就能得到当时的等级。
 * 这也是周报里「周初掌握度」的来源。
 */
export function replayStrength(attempts: QuizAttempt[], upTo = Infinity): Map<string, number> {
  const map = new Map<string, number>();
  const sorted = [...attempts].sort((a, b) => a.at - b.at);

  for (const attempt of sorted) {
    if (attempt.at > upTo) break;
    const previous = map.get(attempt.cardId) ?? 0;
    map.set(
      attempt.cardId,
      attempt.correct
        ? Math.min(STRENGTH_MAX, previous + 1)
        : Math.max(0, previous - 1)
    );
  }

  return map;
}

/**
 * 本周小结：练了多少、掌握度涨了多少、最该回去看哪三个考点。
 *
 * 这里刻意不说「本周正确率提升了多少」——一轮 10 道题的样本太小，
 * 掌握度（累积强度）才是能跨周比较的指标。
 */
export function buildWeeklyReport(input: {
  cards: FlashCard[];
  items: Record<string, QuizItem>;
  attempts: QuizAttempt[];
  mastery: Record<string, QuizMastery>;
  now?: number;
}): WeeklyReport {
  const { cards, items, attempts, mastery, now = Date.now() } = input;

  const to = now;
  const from = now - 7 * DAY_MS;

  // 重复收藏的同一张卡只算一次
  const uniqueCards = [...new Map(cards.map((card) => [card.id, card])).values()];
  const total = uniqueCards.length;

  const recent = attempts.filter((attempt) => attempt.at >= from && attempt.at <= to);
  const correct = recent.filter((attempt) => attempt.correct).length;
  const accuracy = recent.length > 0 ? Math.round((correct / recent.length) * 100) : 0;

  const activeDays = new Set(recent.map((attempt) => new Date(attempt.at).toDateString())).size;
  const distinctCards = new Set(recent.map((attempt) => attempt.cardId)).size;

  const weekStartStrength = replayStrength(attempts, from - 1);
  const startSum = uniqueCards.reduce(
    (sum, card) => sum + Math.min(STRENGTH_MAX, weekStartStrength.get(card.id) ?? 0),
    0
  );
  const startRatio = total > 0 ? Math.round((startSum / (STRENGTH_MAX * total)) * 100) : 0;

  const current = computeMasteryStats(uniqueCards, mastery);

  // 只在本周练过、或历史上有掌握度记录的题里挑「最薄弱」，
  // 否则一堆从没测过的新题会挤满榜单，没有任何指导意义
  const touched = new Set<string>([...recent.map((attempt) => attempt.cardId), ...Object.keys(mastery)]);
  const wrongPerCard = new Map<string, number>();
  for (const attempt of recent) {
    if (attempt.correct) continue;
    wrongPerCard.set(attempt.cardId, (wrongPerCard.get(attempt.cardId) ?? 0) + 1);
  }

  const weakest: WeakPoint[] = uniqueCards
    .filter((card) => touched.has(card.id))
    .map((card) => {
      const wrongCount = wrongPerCard.get(card.id) ?? 0;
      const strength = mastery[card.id]?.strength ?? 0;
      return {
        cardId: card.id,
        point: items[card.id]?.point ?? card.question.slice(0, 40),
        wrongCount,
        strength,
      };
    })
    .filter((point) => point.wrongCount > 0 || point.strength <= 1)
    .sort((a, b) => {
      // 本周错得多的优先；错一样多时，等级低的优先
      const scoreA = a.wrongCount * 3 + (STRENGTH_MAX - a.strength);
      const scoreB = b.wrongCount * 3 + (STRENGTH_MAX - b.strength);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  return {
    from,
    to,
    attempts: recent.length,
    correct,
    accuracy,
    activeDays,
    distinctCards,
    startRatio,
    ratio: current.ratio,
    delta: current.ratio - startRatio,
    weakest,
    basedOn: attempts.length,
  };
}
