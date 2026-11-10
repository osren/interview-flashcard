import { describe, expect, it } from 'vitest';
import type { FlashCard, QuizMastery } from '@/types';
import {
  STRENGTH_MAX,
  computeMasteryStats,
  countDueMastery,
  masteryLabel,
  nextMastery,
} from '../mastery';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

const card = (id: string): FlashCard => ({
  id,
  module: 'core',
  chapterId: 'javascript',
  question: `问题 ${id}`,
  answer: `答案 ${id}`,
  tags: [],
  status: 'unvisited',
});

const entry = (cardId: string, strength: number, dueAt: number): QuizMastery => ({
  cardId,
  strength,
  dueAt,
  lastAt: NOW - DAY,
  lastCorrect: true,
});

describe('nextMastery', () => {
  it('第一次答对升到 1 级，间隔 3 天', () => {
    const result = nextMastery(undefined, 'a', true, NOW);
    expect(result.strength).toBe(1);
    expect(result.dueAt).toBe(NOW + 3 * DAY);
  });

  it('连续答对到 3 级后不再上升，间隔拉到 21 天', () => {
    const result = nextMastery(entry('a', STRENGTH_MAX, NOW), 'a', true, NOW);
    expect(result.strength).toBe(STRENGTH_MAX);
    expect(result.dueAt).toBe(NOW + 21 * DAY);
  });

  it('答错降一级，但明天就会再考一次', () => {
    const result = nextMastery(entry('a', 3, NOW), 'a', false, NOW);
    expect(result.strength).toBe(2);
    expect(result.dueAt).toBe(NOW + DAY);
    expect(result.lastCorrect).toBe(false);
  });

  it('新题答错仍是 0 级，不会变成负数', () => {
    const result = nextMastery(undefined, 'a', false, NOW);
    expect(result.strength).toBe(0);
    expect(result.dueAt).toBe(NOW + DAY);
  });
});

describe('computeMasteryStats', () => {
  it('掌握度 = 已积累强度 / 满分强度，只统计仍在收藏里的卡', () => {
    const cards = [card('a'), card('b'), card('c')];
    const mastery = {
      a: entry('a', 3, 0),
      b: entry('b', 2, 0),
      // c 没测过，按 0 计
    };

    const stats = computeMasteryStats(cards, mastery);
    expect(stats.total).toBe(3);
    expect(stats.mastered).toBe(1);
    expect(stats.ratio).toBe(56);
    expect(stats.byLevel).toEqual([1, 0, 1, 1]);
  });

  it('空收藏时返回 0，不做除零', () => {
    const stats = computeMasteryStats([], {});
    expect(stats.ratio).toBe(0);
    expect(stats.total).toBe(0);
  });
});

describe('countDueMastery', () => {
  it('只算已到期且做过题目的卡，新题不计入', () => {
    const cards = [card('a'), card('b'), card('c')];
    const mastery = {
      a: entry('a', 1, NOW - DAY),
      b: entry('b', 2, NOW + DAY),
      // c 从没测过
    };

    expect(countDueMastery(cards, mastery, NOW)).toBe(1);
  });

  it('取消收藏的卡不再计入到期数量', () => {
    const mastery = { a: entry('a', 1, NOW - DAY) };
    expect(countDueMastery([], mastery, NOW)).toBe(0);
  });
});

describe('masteryLabel', () => {
  it('按强度给出中文档位', () => {
    expect(masteryLabel(0)).toBe('新题');
    expect(masteryLabel(2)).toBe('熟练');
    expect(masteryLabel(9)).toBe('掌握');
  });
});
