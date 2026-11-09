import { beforeEach, describe, expect, it } from 'vitest';
import { studyChatKey, toStudyHistory, useStudyChatStore } from '../useStudyChatStore';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  useStudyChatStore.setState({ sessions: {} });
  await settle();
});

const key = studyChatKey('core', 'javascript');
const otherKey = studyChatKey('mpx', 'lifecycle');

describe('useStudyChatStore', () => {
  it('不同章节各自分桶，互不影响', () => {
    const state = useStudyChatStore.getState();
    state.appendMessage(key, { id: 'a', role: 'user', content: '事件循环怎么讲', createdAt: 1 });
    state.appendMessage(otherKey, { id: 'b', role: 'user', content: '小程序生命周期', createdAt: 2 });

    expect(useStudyChatStore.getState().sessions[key]).toHaveLength(1);
    expect(useStudyChatStore.getState().sessions[otherKey]).toHaveLength(1);
  });

  it('单章节超过 20 条只保留最近 20 条', () => {
    for (let index = 0; index < 25; index += 1) {
      useStudyChatStore.getState().appendMessage(key, {
        id: `m-${index}`,
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `第 ${index} 条`,
        createdAt: index,
      });
    }

    const messages = useStudyChatStore.getState().sessions[key];
    expect(messages).toHaveLength(20);
    expect(messages[0].id).toBe('m-5');
    expect(messages[19].id).toBe('m-24');
  });

  it('单条正文超过 4000 字符会被截断', () => {
    useStudyChatStore.getState().appendMessage(key, {
      id: 'long',
      role: 'assistant',
      content: 'x'.repeat(5000),
      createdAt: 0,
    });

    const [message] = useStudyChatStore.getState().sessions[key];
    expect(message.content.length).toBe(4001);
    expect(message.content.endsWith('…')).toBe(true);
  });

  it('clearSession 只清空指定章节', () => {
    const state = useStudyChatStore.getState();
    state.appendMessage(key, { id: 'a', role: 'user', content: '你好', createdAt: 1 });
    state.appendMessage(otherKey, { id: 'b', role: 'user', content: '在吗', createdAt: 2 });

    useStudyChatStore.getState().clearSession(key);

    expect(useStudyChatStore.getState().sessions[key]).toBeUndefined();
    expect(useStudyChatStore.getState().sessions[otherKey]).toHaveLength(1);
  });

  it('超过 10 个章节时丢弃最久未更新的章节', () => {
    for (let index = 0; index < 12; index += 1) {
      useStudyChatStore.getState().appendMessage(studyChatKey('core', `ch-${index}`), {
        id: `m-${index}`,
        role: 'user',
        content: 'q',
        createdAt: index,
      });
    }

    const sessions = useStudyChatStore.getState().sessions;
    expect(Object.keys(sessions)).toHaveLength(10);
    expect(sessions[studyChatKey('core', 'ch-0')]).toBeUndefined();
    expect(sessions[studyChatKey('core', 'ch-1')]).toBeUndefined();
    expect(sessions[studyChatKey('core', 'ch-11')]).toHaveLength(1);
  });

  it('toStudyHistory 只保留 role 与 content', () => {
    expect(
      toStudyHistory([
        { id: 'a', role: 'user', content: '原型链是什么', createdAt: 1 },
        { id: 'b', role: 'assistant', content: '结论是…', createdAt: 2 },
      ])
    ).toEqual([
      { role: 'user', content: '原型链是什么' },
      { role: 'assistant', content: '结论是…' },
    ]);
  });
});
