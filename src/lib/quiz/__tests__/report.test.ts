import { describe, expect, it } from 'vitest';
import type { FlashCard, QuizAttempt, QuizItem, QuizMastery } from '@/types';
import { cardFingerprint } from '../fingerprint';
import { buildWeeklyReport, replayStrength } from '../report';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

const card = (id: string, question = `问题 ${id}`): FlashCard => ({
  id,
  module: 'core',
  chapterId: 'javascript',
  question,
  answer: `答案 ${id} 的一段解释`,
  tags: [],
  status: 'unvisited',
});

const item = (source: FlashCard, point: string): QuizItem => ({
  id: `quiz:${source.id}`,
  cardId: source.id,
  module: source.module,
  chapterId: source.chapterId,
  question: source.question,
  stem: '以下哪个说法正确？',
  options: ['甲', '乙'],
  answerIndex: 0,
  explanation: '解析',
  point,
  cardVersion: cardFingerprint(source),
  generatedAt: 1,
});

const attempt = (cardId: string, correct: boolean, at: number): QuizAttempt => ({
  id: `${cardId}:${at}`,
  sessionId: 'session',
  itemId: `quiz:${cardId}`,
  cardId,
  correct,
  selectedIndex: correct ? 0 : 1,
  at,
});

const mastery = (cardId: string, strength: number, lastCorrect: boolean): QuizMastery => ({
  cardId,
  strength,
  dueAt: NOW + DAY,
  lastAt: NOW - DAY,
  lastCorrect,
});

describe('replayStrength', () => {
  it('按时间顺序回放答对与答错，得到当时强度', () => {
    const attempts = [
      attempt('a', false, NOW - 3000),
      attempt('a', true, NOW - 2000),
      attempt('a', true, NOW - 1000),
      attempt('b', true, NOW - 500),
    ];

    const result = replayStrength(attempts);
    expect(result.get('a')).toBe(2);
    expect(result.get('b')).toBe(1);
  });

  it('只回放到指定时刻，用于算周初掌握度', () => {
    const attempts = [
      attempt('a', true, NOW - 9 * DAY),
      attempt('a', true, NOW - 8 * DAY),
      attempt('a', false, NOW - DAY),
    ];

    expect(replayStrength(attempts, NOW - 7 * DAY).get('a')).toBe(2);
    expect(replayStrength(attempts).get('a')).toBe(1);
  });
});

describe('buildWeeklyReport', () => {
  it('统计本周题次、正确率与活跃天数', () => {
    const cards = [card('a'), card('b'), card('c')];
    const attempts = [
      attempt('a', true, NOW - 3 * DAY),
      attempt('b', true, NOW - 2 * DAY),
      attempt('a', false, NOW - DAY),
    ];
    const masteryMap = { a: mastery('a', 0, false), b: mastery('b', 1, true) };

    const report = buildWeeklyReport({
      cards,
      items: { a: item(cards[0], '闭包捕获变量引用') },
      attempts,
      mastery: masteryMap,
      now: NOW,
    });

    expect(report.attempts).toBe(3);
    expect(report.correct).toBe(2);
    expect(report.accuracy).toBe(67);
    expect(report.activeDays).toBe(3);
    expect(report.distinctCards).toBe(2);
  });

  it('周初掌握度由作答回放得出，本周答错会表现为退步', () => {
    const cards = [card('a'), card('b'), card('c')];
    const attempts = [
      attempt('a', true, NOW - 9 * DAY),
      attempt('a', true, NOW - 8 * DAY),
      attempt('a', false, NOW - DAY),
    ];
    const masteryMap = { a: mastery('a', 1, false) };

    const report = buildWeeklyReport({
      cards,
      items: {},
      attempts,
      mastery: masteryMap,
      now: NOW,
    });

    expect(report.startRatio).toBe(22);
    expect(report.ratio).toBe(11);
    expect(report.delta).toBe(-11);
  });

  it('最薄弱考点只从练过的题里挑，从没测过的新题不挤榜', () => {
    const cards = [card('a'), card('b'), card('c')];
    const attempts = [attempt('a', false, NOW - DAY)];
    const masteryMap = { a: mastery('a', 0, false) };

    const report = buildWeeklyReport({
      cards,
      items: { a: item(cards[0], '闭包捕获变量引用') },
      attempts,
      mastery: masteryMap,
      now: NOW,
    });

    expect(report.weakest).toHaveLength(1);
    expect(report.weakest[0].cardId).toBe('a');
    expect(report.weakest[0].point).toBe('闭包捕获变量引用');
    expect(report.weakest[0].wrongCount).toBe(1);
  });

  it('收藏为空时全部为 0，不做除零', () => {
    const report = buildWeeklyReport({
      cards: [],
      items: {},
      attempts: [],
      mastery: {},
      now: NOW,
    });

    expect(report.ratio).toBe(0);
    expect(report.startRatio).toBe(0);
    expect(report.delta).toBe(0);
    expect(report.accuracy).toBe(0);
    expect(report.weakest).toHaveLength(0);
  });
});
