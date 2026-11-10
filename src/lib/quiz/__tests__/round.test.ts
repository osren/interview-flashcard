import { describe, expect, it } from 'vitest';
import type { FlashCard, QuizAttempt, QuizItem } from '@/types';
import { cardFingerprint } from '../fingerprint';
import { buildRoundPlan } from '../round';

const card = (id: string, question = `问题 ${id}`, answer = `答案 ${id} 的一段解释`): FlashCard => ({
  id,
  module: 'core',
  chapterId: 'javascript',
  question,
  answer,
  tags: [],
  status: 'unvisited',
});

const itemFor = (source: FlashCard, generatedAt = 1): QuizItem => ({
  id: `quiz:${source.id}`,
  cardId: source.id,
  module: source.module,
  chapterId: source.chapterId,
  question: source.question,
  stem: '以下哪个说法正确？',
  options: ['甲', '乙', '丙', '丁'],
  answerIndex: 0,
  explanation: '解析',
  point: '考点',
  cardVersion: cardFingerprint(source),
  generatedAt,
});

const attempt = (cardId: string, correct: boolean, at: number): QuizAttempt => ({
  id: `${at}:quiz:${cardId}`,
  sessionId: 'session',
  itemId: `quiz:${cardId}`,
  cardId,
  correct,
  selectedIndex: correct ? 0 : 1,
  at,
});

const noRandom = () => 0.42;

describe('buildRoundPlan', () => {
  it('收藏为空时不出题', () => {
    const plan = buildRoundPlan({ cards: [], items: {}, attempts: [], random: noRandom });
    expect(plan.total).toBe(0);
    expect(plan.reuse).toHaveLength(0);
    expect(plan.toGenerate).toHaveLength(0);
  });

  it('题目数不超过卡片数，重复收藏的同一张卡只出一次', () => {
    const cards = [card('a'), card('b'), card('b')];
    const plan = buildRoundPlan({ cards, items: {}, attempts: [], size: 10, random: noRandom });

    expect(plan.total).toBe(2);
    expect(plan.toGenerate.map((c) => c.id).sort()).toEqual(['a', 'b']);
  });

  it('答错过的题优先于一次没做过的题', () => {
    const cards = [card('a'), card('b'), card('c'), card('d')];
    const attempts = [
      attempt('a', false, 100),
      attempt('a', false, 200),
      attempt('a', false, 300),
      attempt('b', false, 400),
      attempt('d', true, 500),
    ];

    // size 3：薄弱题配额 2 道（a、b），新题配额 1 道（c），答对过的 d 不入选
    const plan = buildRoundPlan({ cards, items: {}, attempts, size: 3, random: noRandom });
    expect(plan.toGenerate.map((c) => c.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('卡片没改过就复用缓存题目，不重复生成', () => {
    const cards = [card('a'), card('b')];
    const items = { a: itemFor(cards[0]), b: itemFor(cards[1]) };

    const plan = buildRoundPlan({ cards, items, attempts: [], size: 10, random: noRandom });
    expect(plan.reuse.map((i) => i.cardId).sort()).toEqual(['a', 'b']);
    expect(plan.toGenerate).toHaveLength(0);
  });

  it('卡片答案被编辑后，旧题目过期、需要重新生成', () => {
    const original = card('a');
    const items = { a: itemFor(original) };
    const edited = card('a', '新的问题', '新的答案');

    const plan = buildRoundPlan({
      cards: [edited],
      items,
      attempts: [],
      size: 10,
      random: noRandom,
    });

    expect(plan.reuse).toHaveLength(0);
    expect(plan.toGenerate).toHaveLength(1);
    expect(plan.toGenerate[0].id).toBe('a');
  });

  it('到期题优先于未到期题，同时给新题留位置', () => {
    const cards = [card('a'), card('b'), card('c'), card('d')];
    const now = 1_800_000_000_000;
    const mastery = {
      a: { cardId: 'a', strength: 1, dueAt: now - 1000, lastAt: now - 2000, lastCorrect: true },
      b: { cardId: 'b', strength: 1, dueAt: now + 1000, lastAt: now - 2000, lastCorrect: true },
      d: { cardId: 'd', strength: 0, dueAt: now - 1000, lastAt: now - 2000, lastCorrect: false },
    };

    // size 3：到期配额 2 道（a、d），新题配额 1 道（c），未到期的 b 让位
    const plan = buildRoundPlan({
      cards,
      items: {},
      attempts: [],
      mastery,
      size: 3,
      now,
      random: noRandom,
    });

    expect(plan.toGenerate.map((c) => c.id).sort()).toEqual(['a', 'c', 'd']);
  });
});
