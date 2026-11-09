import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '@/lib/llm/types';
import { CAMPUS_AGENT_SYSTEM_PROMPT, buildCampusAgentMessages } from '@/lib/llm/prompts/campus-agent';

describe('buildCampusAgentMessages', () => {
  it('首条是 system，末条是当前用户输入，历史顺序不变', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: '我投了几家' },
      { role: 'assistant', content: '共 12 家' },
    ];

    const messages = buildCampusAgentMessages(history, '那 AI 面呢');

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toBe(CAMPUS_AGENT_SYSTEM_PROMPT);
    expect(messages.slice(1, 3)).toEqual(history);
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: '那 AI 面呢' });
    expect(messages).toHaveLength(4);
  });

  it('系统提示里点名了全部六个工具', () => {
    for (const name of [
      'getProgressStats',
      'getStageReminders',
      'searchJobs',
      'getJobDetail',
      'getApplicationProgress',
      'setJobStatus',
    ]) {
      expect(CAMPUS_AGENT_SYSTEM_PROMPT).toContain(name);
    }
  });
});
