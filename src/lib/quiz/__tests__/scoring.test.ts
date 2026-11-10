import { describe, expect, it } from 'vitest';
import type { QuizItem } from '@/types';
import { scoreRound, toAttemptRecords } from '../scoring';

const item = (id: string, answerIndex = 0): QuizItem => ({
  id,
  cardId: id.replace('quiz:', ''),
  module: 'core',
  chapterId: 'javascript',
  question: '问题',
  stem: '以下哪个说法正确？',
  options: ['甲', '乙', '丙', '丁'],
  answerIndex,
  explanation: '解析',
  point: '考点',
  cardVersion: 'v1',
  generatedAt: 1,
});

describe('scoreRound', () => {
  it('全对时正确率 100', () => {
    const result = scoreRound([item('quiz:a'), item('quiz:b')], {
      'quiz:a': 0,
      'quiz:b': 0,
    });
    expect(result.correct).toBe(2);
    expect(result.accuracy).toBe(100);
  });

  it('部分答对按比例算，四舍五入到整数', () => {
    const result = scoreRound([item('quiz:a'), item('quiz:b'), item('quiz:c')], {
      'quiz:a': 0,
      'quiz:b': 1,
      'quiz:c': 0,
    });
    expect(result.correct).toBe(2);
    expect(result.accuracy).toBe(67);
  });

  it('没作答的题算错，不静默跳过以免抬高正确率', () => {
    const result = scoreRound([item('quiz:a')], {});
    expect(result.correct).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.details[0].selectedIndex).toBe(-1);
  });

  it('空题单不返回 NaN', () => {
    expect(scoreRound([], {}).accuracy).toBe(0);
  });
});

describe('toAttemptRecords', () => {
  it('每题一条记录，id 由 sessionId 与题目 id 组成，可多端去重', () => {
    const result = scoreRound([item('quiz:a'), item('quiz:b')], {
      'quiz:a': 0,
      'quiz:b': 1,
    });
    const records = toAttemptRecords(result, 's1', 1000);

    expect(records).toHaveLength(2);
    expect(records[0].id).toBe('s1:quiz:a');
    expect(records[0].correct).toBe(true);
    expect(records[1].correct).toBe(false);
    expect(records.every((record) => record.at === 1000)).toBe(true);
  });
});
