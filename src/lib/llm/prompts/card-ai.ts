import type { FlashCard } from '@/types';
import type { ChatMessage } from '@/lib/llm/types';
import { CANDIDATE_CONTEXT } from './candidate-context';
import { INTERVIEWFLASH_CONTEXT } from './interviewflash-context';

const SYSTEM_BASE = `你是前端面试教练，帮助候选人把闪卡讲透、扛住追问。
用简体中文，Markdown 输出，条理清晰，适度举例。
${CANDIDATE_CONTEXT}

${INTERVIEWFLASH_CONTEXT}`;

function cardContext(card: FlashCard): string {
  const tags = card.tags?.length ? card.tags.join('、') : '无';
  const extra = card.extendQuestion ? `\n静态延伸追问：${card.extendQuestion}` : '';
  const projectNote =
    card.chapterId === 'interviewflash'
      ? '\n备注：当前卡片属于 InterviewFlash 项目复盘章节，请结合上述项目上下文与卡片答案做深度讲解，可引用具体模块/文件/实现策略。'
      : '\n备注：讲解时请主动尝试把知识点映射到 InterviewFlash 本项目中的真实实现（如 FlashCard、Campus 投递、lazy 路由、Zustand 同步等），再辅以滴滴或 GResume 经历。';
  return `模块：${card.module}
章节：${card.chapterId}
标签：${tags}
题目：${card.question}
卡片答案：
${card.answer}${extra}${projectNote}`;
}

export function buildExplainMessages(card: FlashCard): ChatMessage[] {
  return [
    { role: 'system', content: SYSTEM_BASE },
    {
      role: 'user',
      content: `请结合候选人背景，对下面这张面试闪卡做「AI 解释」。要求：
1. 先用 2-4 句讲清核心原理
2. 指出面试官通常想听什么
3. **必须**用 InterviewFlash 本项目中的真实场景举例（说明对应功能/模块/技术点）；若确实无法关联，再改用滴滴或 GResume
4. 列出 2 个易错点 / 踩坑
5. 控制在 400 字以内

${cardContext(card)}`,
    },
  ];
}

export function buildFollowupMessages(card: FlashCard): ChatMessage[] {
  return [
    { role: 'system', content: SYSTEM_BASE },
    {
      role: 'user',
      content: `请基于下面闪卡，模拟面试官生成 2-3 个递进追问（原理 → 场景 → 项目关联），每个追问附 3-6 句答题思路。
要求：
- 至少 1 个追问必须落到 InterviewFlash 项目（如「你在 InterviewFlash 里是怎么处理 XXX 的？」）
- 答题思路里给出可口述的项目关联话术，不要替候选人编造未发生的经历

${cardContext(card)}`,
    },
  ];
}

export function buildContinueMessages(
  history: ChatMessage[],
  userQuestion: string
): ChatMessage[] {
  return [
    ...history,
    {
      role: 'user',
      content: `继续追问/补充：${userQuestion}
请直接回答，保持简洁。若与工程实践相关，优先结合 InterviewFlash 本项目举例说明。`,
    },
  ];
}
