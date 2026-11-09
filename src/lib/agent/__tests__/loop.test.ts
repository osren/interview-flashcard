import { describe, expect, it } from 'vitest';
import type { ChatMessage, ToolCall } from '@/lib/llm/types';
import { runAgent } from '../loop';
import type { AgentLlmClient, AgentToolDefinition, AgentEvent } from '../types';

const toolCall = (id: string, name: string, args: Record<string, unknown>): ToolCall => ({
  id,
  type: 'function',
  function: { name, arguments: JSON.stringify(args) },
});

const echoTool: AgentToolDefinition = {
  name: 'echo',
  description: '回显参数',
  parameters: { type: 'object', properties: { v: { type: 'number' } } },
  execute: (args) => ({ content: JSON.stringify(args), summary: 'echo' }),
};

const userMessages = (): ChatMessage[] => [{ role: 'user', content: 'hi' }];

function scriptedLlm(replies: Array<{ content: string | null; toolCalls: ToolCall[] }>): AgentLlmClient {
  let round = 0;
  return {
    call: async () => {
      const reply = replies[Math.min(round, replies.length - 1)];
      round += 1;
      return reply;
    },
  };
}

describe('runAgent', () => {
  it('3 轮工具后收敛，tool_call_id 与 tool 消息一一对齐', async () => {
    const llm = scriptedLlm([
      { content: null, toolCalls: [toolCall('c1', 'echo', { v: 1 })] },
      { content: null, toolCalls: [toolCall('c2', 'echo', { v: 2 })] },
      { content: null, toolCalls: [toolCall('c3', 'echo', { v: 3 })] },
      { content: '最终回答', toolCalls: [] },
    ]);
    const events: AgentEvent[] = [];

    const result = await runAgent(
      { llm, tools: [echoTool], onEvent: (event) => events.push(event) },
      userMessages()
    );

    expect(result.reason).toBe('answered');
    expect(result.steps).toBe(4);
    expect(result.answer).toBe('最终回答');

    const toolMessages = result.messages.filter((message) => message.role === 'tool');
    expect(toolMessages).toHaveLength(3);
    expect(toolMessages.map((message) => (message as { tool_call_id: string }).tool_call_id)).toEqual([
      'c1',
      'c2',
      'c3',
    ]);
    expect(events.filter((event) => event.type === 'tool_result')).toHaveLength(3);
    expect(events[events.length - 1]).toEqual({ type: 'done', reason: 'answered' });
  });

  it('工具抛错时转成文本回喂，不中断循环', async () => {
    const llm: AgentLlmClient = {
      call: async (messages) => {
        const hasError = messages.some(
          (message) => message.role === 'tool' && message.content.includes('boom')
        );
        if (!hasError) return { content: null, toolCalls: [toolCall('c1', 'boom', {})] };
        return { content: '工具报错了，我换个说法', toolCalls: [] };
      },
    };
    const events: AgentEvent[] = [];

    const result = await runAgent(
      {
        llm,
        tools: [
          {
            name: 'boom',
            description: '总是抛错',
            parameters: { type: 'object' },
            execute: () => {
              throw new Error('boom');
            },
          },
        ],
        onEvent: (event) => events.push(event),
      },
      userMessages()
    );

    expect(result.reason).toBe('answered');
    expect(result.answer).toBe('工具报错了，我换个说法');
    const toolMessage = result.messages.find((message) => message.role === 'tool');
    expect(toolMessage?.content).toContain('执行失败');

    const toolResult = events.find((event) => event.type === 'tool_result');
    expect(toolResult && toolResult.type === 'tool_result' && toolResult.result.isError).toBe(true);
  });

  it('超过最大步数安全退出', async () => {
    const llm = scriptedLlm([{ content: null, toolCalls: [toolCall('c', 'echo', { v: 1 })] }]);
    const events: AgentEvent[] = [];

    const result = await runAgent(
      { llm, tools: [echoTool], maxSteps: 2, onEvent: (event) => events.push(event) },
      userMessages()
    );

    expect(result.reason).toBe('max_steps');
    expect(result.steps).toBe(2);
    expect(result.answer).toBeNull();
    expect(events[events.length - 1]).toEqual({ type: 'done', reason: 'max_steps' });
  });

  it('未知工具回喂可用工具名', async () => {
    let round = 0;
    const llm: AgentLlmClient = {
      call: async (messages) => {
        round += 1;
        if (round === 1) return { content: null, toolCalls: [toolCall('c1', 'nope', {})] };
        const hint = messages.find((message) => message.role === 'tool');
        expect(hint?.content).toContain('未知工具');
        expect(hint?.content).toContain('echo');
        return { content: '改用可用工具', toolCalls: [] };
      },
    };

    const result = await runAgent({ llm, tools: [echoTool] }, userMessages());
    expect(result.reason).toBe('answered');
  });

  it('写操作只提案，不自动执行', async () => {
    let executed = false;
    const events: AgentEvent[] = [];
    const llm = scriptedLlm([
      { content: null, toolCalls: [toolCall('c1', 'writeThing', { a: 1 })] },
      { content: '已提交确认', toolCalls: [] },
    ]);

    const result = await runAgent(
      {
        llm,
        tools: [
          {
            name: 'writeThing',
            description: '写操作',
            parameters: { type: 'object' },
            requiresConfirm: true,
            execute: () => {
              executed = true;
              return { content: 'done', summary: 'done' };
            },
          },
        ],
        onEvent: (event) => events.push(event),
      },
      userMessages()
    );

    expect(executed).toBe(false);
    const pending = events.find((event) => event.type === 'pending_action');
    expect(pending && pending.type === 'pending_action' && pending.args).toEqual({ a: 1 });
    const toolMessage = result.messages.find((message) => message.role === 'tool');
    expect(toolMessage?.content).toContain('pending_user_confirmation');
  });

  it('非法 JSON 参数不崩溃', async () => {
    let round = 0;
    const llm: AgentLlmClient = {
      call: async () => {
        round += 1;
        if (round === 1) {
          return {
            content: null,
            toolCalls: [
              { id: 'c1', type: 'function', function: { name: 'echo', arguments: '{bad' } },
            ],
          };
        }
        return { content: '参数坏了', toolCalls: [] };
      },
    };

    const result = await runAgent({ llm, tools: [echoTool] }, userMessages());
    expect(result.reason).toBe('answered');
    const toolMessage = result.messages.find((message) => message.role === 'tool');
    expect(toolMessage?.content).toContain('参数解析失败');
  });

  it('超长工具输出被截断到 2000 字符', async () => {
    const events: AgentEvent[] = [];
    const llm = scriptedLlm([
      { content: null, toolCalls: [toolCall('c1', 'big', {})] },
      { content: 'ok', toolCalls: [] },
    ]);

    const result = await runAgent(
      {
        llm,
        tools: [
          {
            name: 'big',
            description: '返回超长内容',
            parameters: { type: 'object' },
            execute: () => ({ content: 'x'.repeat(4000), summary: 'big' }),
          },
        ],
        onEvent: (event) => events.push(event),
      },
      userMessages()
    );

    const toolMessage = result.messages.find((message) => message.role === 'tool');
    expect(toolMessage?.content).toHaveLength(2000 + '…（内容过长已截断）'.length);
    const toolResult = events.find((event) => event.type === 'tool_result');
    expect(toolResult && toolResult.type === 'tool_result' && toolResult.result.truncated).toBe(true);
  });

  it('开始前已 abort 则不再调用模型', async () => {
    let called = false;
    const controller = new AbortController();
    controller.abort();

    const result = await runAgent(
      {
        llm: {
          call: async () => {
            called = true;
            return { content: 'x', toolCalls: [] };
          },
        },
        tools: [],
        signal: controller.signal,
      },
      userMessages()
    );

    expect(called).toBe(false);
    expect(result.reason).toBe('aborted');
  });

  it('模型未给工具也未给正文时以 answered 收敛且 answer 为 null', async () => {
    const result = await runAgent(
      { llm: scriptedLlm([{ content: null, toolCalls: [] }]), tools: [] },
      userMessages()
    );
    expect(result.reason).toBe('answered');
    expect(result.answer).toBeNull();
    expect(result.messages).toHaveLength(1);
  });
});
