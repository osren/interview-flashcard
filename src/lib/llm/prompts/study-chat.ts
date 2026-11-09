import type { FlashCard } from '@/types';
import type { ChatMessage } from '@/lib/llm/types';
import { CANDIDATE_CONTEXT } from './candidate-context';
import { INTERVIEWFLASH_CONTEXT } from './interviewflash-context';

/** 章节题目清单最多带 25 条题干，避免上下文被长章节吃满 */
const MAX_TOPICS = 25;

function topicList(cards: FlashCard[]): string {
  if (cards.length === 0) return '（本章暂无题目，回答时以通用前端知识为主）';
  const shown = cards.slice(0, MAX_TOPICS);
  const lines = shown.map((card, index) => `${index + 1}. ${card.question.trim().replace(/\s*\n\s*/g, ' ')}`);
  const rest = cards.length - shown.length;
  return `${lines.join('\n')}${rest > 0 ? `\n（另有 ${rest} 道题未列出）` : ''}`;
}

export function buildStudyChatSystem(input: {
  title: string;
  module: string;
  chapterId: string;
  cards: FlashCard[];
}): string {
  return `你是这个学习章节的对话助教，帮候选人把这章的知识点讲到能过面试的程度。
用简体中文，Markdown 输出，先给结论再展开，适度举例。
${CANDIDATE_CONTEXT}

${INTERVIEWFLASH_CONTEXT}

当前章节：${input.title}（模块 ${input.module}，章节 id ${input.chapterId}，共 ${input.cards.length} 道题）
本章题目清单：
${topicList(input.cards)}

回答规则：
1. 用户问的是本章内容时，优先围绕本章题目与答案作答，可以指出「这属于第 N 题的延伸」。
2. 用户问的内容超出本章范围时，正常回答，但要明确说明这是「本章之外的补充」，不要假装本章讲过。
3. 不要编造候选人的项目经历或数字；涉及 InterviewFlash / 滴滴 / AI 监控的具体实现时，只讲系统提示中已经明确的事实。
4. 如果用户的问题是一个新的面试问题，回答要给成「可直接背诵的答案」：先一句话结论，再分点，最后给一个可口述的例子。
5. 不要主动要求用户保存卡片，保存由界面上的按钮完成。`;
}

export function buildStudyChatMessages(
  system: string,
  history: ChatMessage[],
  question: string
): ChatMessage[] {
  return [
    { role: 'system', content: system },
    ...history,
    { role: 'user', content: question },
  ];
}
