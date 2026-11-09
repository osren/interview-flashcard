import { beforeEach, describe, expect, it } from 'vitest';
import { toAgentHistory, useAgentChatStore } from '../useAgentChatStore';

// persist 的 hydrate 是异步的，先让它跑完再断言，避免存储读回覆盖测试写入
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  useAgentChatStore.setState({ messages: [] });
  await settle();
});

describe('useAgentChatStore', () => {
  it('超过 20 条时只保留最近 20 条', () => {
    for (let index = 0; index < 25; index += 1) {
      useAgentChatStore.getState().appendMessage({
        id: `m-${index}`,
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `第 ${index} 条`,
      });
    }

    const messages = useAgentChatStore.getState().messages;
    expect(messages).toHaveLength(20);
    expect(messages[0].id).toBe('m-5');
    expect(messages[19].id).toBe('m-24');
  });

  it('单条正文超过 4000 字符会被截断', () => {
    const long = 'x'.repeat(5000);
    useAgentChatStore.getState().appendMessage({ id: 'long', role: 'assistant', content: long });

    const [message] = useAgentChatStore.getState().messages;
    expect(message.content.length).toBe(4001);
    expect(message.content.endsWith('…')).toBe(true);
  });

  it('clearMessages 清空会话', () => {
    useAgentChatStore.getState().appendMessage({ id: 'a', role: 'user', content: '你好' });
    expect(useAgentChatStore.getState().messages).toHaveLength(1);

    useAgentChatStore.getState().clearMessages();
    expect(useAgentChatStore.getState().messages).toEqual([]);
  });

  it('toAgentHistory 只保留 role 与 content', () => {
    expect(
      toAgentHistory([
        { id: 'a', role: 'user', content: '我投了几家' },
        { id: 'b', role: 'assistant', content: '共 12 家' },
      ])
    ).toEqual([
      { role: 'user', content: '我投了几家' },
      { role: 'assistant', content: '共 12 家' },
    ]);
  });
});
