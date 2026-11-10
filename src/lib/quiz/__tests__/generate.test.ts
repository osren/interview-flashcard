import { describe, expect, it, vi } from 'vitest';
import type { FlashCard } from '@/types';
import { cardFingerprint, QUIZ_SCHEMA_VERSION } from '../fingerprint';

vi.mock('@/lib/llm/call', () => ({ callLlmJson: vi.fn() }));

import { sanitizeQuizItems } from '../generate';

const card = (id: string): FlashCard => ({
  id,
  module: 'core',
  chapterId: 'javascript',
  question: `问题 ${id}`,
  answer: `答案 ${id}`,
  tags: [],
  status: 'unvisited',
});

const cards = [card('a'), card('b')];

const validEntry = {
  cardId: 'a',
  point: '闭包会持有外部变量',
  stem: '关于闭包，以下哪个说法正确？',
  options: ['闭包会持有外层作用域的变量引用', '闭包每次调用都会重新创建作用域链', '闭包只存在于箭头函数里', '闭包会导致立即内存泄漏'],
  answerIndex: 0,
  explanation: '闭包捕获的是外层作用域链上的变量引用，其余说法都不成立。',
};

describe('sanitizeQuizItems', () => {
  it('合法题目被转成可落库的 QuizItem，并带上卡片指纹', () => {
    const items = sanitizeQuizItems({ items: [validEntry] }, cards, 1000);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('quiz:a');
    expect(items[0].cardId).toBe('a');
    expect(items[0].cardVersion).toBe(cardFingerprint(cards[0]));
    expect(items[0].generatedAt).toBe(1000);
    expect(items[0].answerIndex).toBe(0);
  });

  it('两个选项语义重复时整题丢弃（最常见的 LLM 出题缺陷）', () => {
    const items = sanitizeQuizItems(
      {
        items: [
          {
            ...validEntry,
            options: ['闭包持有外部变量', '闭包 持有外部变量', '闭包只存在于箭头函数里', '闭包会内存泄漏'],
          },
        ],
      },
      cards,
      1000
    );
    expect(items).toHaveLength(0);
  });

  it('答案下标越界时丢弃，避免把错选项当正确答案', () => {
    const items = sanitizeQuizItems({ items: [{ ...validEntry, answerIndex: 9 }] }, cards, 1000);
    expect(items).toHaveLength(0);
  });

  it('模型返回了不存在的 cardId 时丢弃，不按位置瞎匹配', () => {
    const items = sanitizeQuizItems({ items: [{ ...validEntry, cardId: 'ghost' }] }, cards, 1000);
    expect(items).toHaveLength(0);
  });

  it('缺少解析时用正确答案兜底，不至于结果页空着', () => {
    const items = sanitizeQuizItems(
      { items: [{ ...validEntry, explanation: '' }] },
      cards,
      1000
    );
    expect(items[0].explanation).toContain(items[0].options[0]);
  });

  it('兼容模型直接返回数组的情况', () => {
    const items = sanitizeQuizItems([validEntry], cards, 1000);
    expect(items).toHaveLength(1);
  });

  it('同一张卡只保留第一道题，避免一轮里重复出题', () => {
    const items = sanitizeQuizItems(
      { items: [validEntry, { ...validEntry, stem: '另一个题干，同样关于闭包' }] },
      cards,
      1000
    );
    expect(items).toHaveLength(1);
  });

  it('保留指向错误选项的误解诊断，并打上结构版本', () => {
    const items = sanitizeQuizItems(
      {
        items: [
          {
            ...validEntry,
            distractors: [
              { optionIndex: 1, misconception: '把「作用域链」当成了「调用栈」', correction: '两层链的结构不同' },
            ],
          },
        ],
      },
      cards,
      1000
    );

    expect(items[0].schemaVersion).toBe(QUIZ_SCHEMA_VERSION);
    expect(items[0].distractors).toHaveLength(1);
    expect(items[0].distractors?.[0].optionIndex).toBe(1);
  });

  it('诊断指到正确答案、下标越界或文案空泛的条目被丢掉', () => {
    const items = sanitizeQuizItems(
      {
        items: [
          {
            ...validEntry,
            distractors: [
              { optionIndex: 0, misconception: '指到正确答案，应该丢掉' },
              { optionIndex: 9, misconception: '下标越界，应该丢掉' },
              { optionIndex: 2, misconception: '不行' },
              { optionIndex: 3, misconception: '把闭包当成每次调用新建作用域' },
            ],
          },
        ],
      },
      cards,
      1000
    );

    expect(items[0].distractors).toHaveLength(1);
    expect(items[0].distractors?.[0].optionIndex).toBe(3);
  });
});
