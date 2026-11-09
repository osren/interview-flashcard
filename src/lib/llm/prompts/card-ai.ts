import type { FlashCard } from '@/types';
import type { ChatMessage } from '@/lib/llm/types';
import { CANDIDATE_CONTEXT } from './candidate-context';
import { INTERVIEWFLASH_CONTEXT } from './interviewflash-context';

const SYSTEM_BASE = `你是前端面试教练，帮助候选人把闪卡讲透、扛住追问。
用简体中文，Markdown 输出，条理清晰，适度举例。
${CANDIDATE_CONTEXT}

${INTERVIEWFLASH_CONTEXT}`;

/** 项目背景注入上限：两个项目背景 md 均在 8k 字符量级，头部速览卡保证关键事实不被截断 */
const MAX_PROJECT_CONTEXT_CHARS = 7000;

function projectContextBlock(projectContext?: string): string {
  const trimmed = projectContext?.trim();
  if (!trimmed) return '';
  const clipped =
    trimmed.length > MAX_PROJECT_CONTEXT_CHARS
      ? `${trimmed.slice(0, MAX_PROJECT_CONTEXT_CHARS)}\n\n（背景资料较长，此处已截断）`
      : trimmed;
  return `

项目背景资料（本页属于该项目的复盘，讲解与追问都以此为准；不要编造资料之外的事实，资料没覆盖的点要明确说「资料里没有」，不要把通用经验当成这个项目的实现）：
"""
${clipped}
"""`;
}

function systemPrompt(projectContext?: string): string {
  return `${SYSTEM_BASE}${projectContextBlock(projectContext)}`;
}

function cardContext(card: FlashCard, hasProjectContext = false): string {
  const tags = card.tags?.length ? card.tags.join('、') : '无';
  const extra = card.extendQuestion ? `\n静态延伸追问：${card.extendQuestion}` : '';
  const projectNote = hasProjectContext
    ? '\n备注：当前卡片属于某个项目的复盘页，system 里已给出该项目的背景资料。请优先引用资料里的真实模块、参数、口径与数字来讲这个项目，不要强行映射到 InterviewFlash。'
    : card.chapterId === 'interviewflash'
      ? '\n备注：当前卡片属于 InterviewFlash 项目复盘章节，请结合上述项目上下文与卡片答案做深度讲解，可引用具体模块/文件/实现策略。'
      : '\n备注：讲解时请主动尝试把知识点映射到 InterviewFlash 本项目中的真实实现（如 FlashCard、Campus 投递、lazy 路由、Zustand 同步等），再辅以滴滴或 GResume 经历。';
  return `模块：${card.module}
章节：${card.chapterId}
标签：${tags}
题目：${card.question}
卡片答案：
${card.answer}${extra}${projectNote}`;
}

export function buildExplainMessages(card: FlashCard, projectContext?: string): ChatMessage[] {
  const hasContext = Boolean(projectContext?.trim());
  return [
    { role: 'system', content: systemPrompt(projectContext) },
    {
      role: 'user',
      content: `请结合候选人背景，对下面这张面试闪卡做「AI 解释」。要求：
1. 先用 2-4 句讲清核心原理
2. 指出面试官通常想听什么
3. **必须**用${hasContext ? '本项目 background 里的真实实现' : ' InterviewFlash 本项目中的真实场景'}举例（说明对应功能/模块/技术点）${hasContext ? '' : '；若确实无法关联，再改用滴滴或 GResume'}
4. 列出 2 个易错点 / 踩坑
5. 控制在 400 字以内
${hasContext ? '6. 引用背景资料里的模块名、参数、指标口径与数字，资料没写的不要编\n' : ''}
${cardContext(card, hasContext)}`,
    },
  ];
}

export function buildFollowupMessages(card: FlashCard, projectContext?: string): ChatMessage[] {
  const hasContext = Boolean(projectContext?.trim());
  return [
    { role: 'system', content: systemPrompt(projectContext) },
    {
      role: 'user',
      content: `请基于下面闪卡，模拟面试官生成 2-3 个递进追问（原理 → 场景 → 项目关联），每个追问附 3-6 句答题思路。
要求：
- 至少 1 个追问必须落到${hasContext ? '这个项目本身' : ' InterviewFlash 项目'}（如「你在${hasContext ? '这个项目' : ' InterviewFlash'}里是怎么处理 XXX 的？」）
- 答题思路里给出可口述的项目关联话术，不要替候选人编造未发生的经历${hasContext ? '\n- 追问要指向背景资料里的真实实现细节（模块名、参数、指标口径、边界结论），答题思路可直接引用资料中的数字与结论' : ''}

${cardContext(card, hasContext)}`,
    },
  ];
}

export function buildContinueMessages(
  history: ChatMessage[],
  userQuestion: string,
  projectContext?: string
): ChatMessage[] {
  const contextAlreadyInHistory =
    history[0]?.role === 'system' && history[0].content.includes('项目背景资料');
  const withContext: ChatMessage[] =
    projectContext && !contextAlreadyInHistory
      ? [
          { role: 'system', content: systemPrompt(projectContext) },
          ...(history[0]?.role === 'system' ? history.slice(1) : history),
        ]
      : history;

  return [
    ...withContext,
    {
      role: 'user',
      content: `继续追问/补充：${userQuestion}
请直接回答，保持简洁。${projectContext?.trim() ? '回答以 system 中的项目背景资料为准；资料没覆盖的点明确说明「资料里没有」，不要用通用经验冒充这个项目的实现。' : '若与工程实践相关，优先结合 InterviewFlash 本项目举例说明。'}`,
    },
  ];
}
