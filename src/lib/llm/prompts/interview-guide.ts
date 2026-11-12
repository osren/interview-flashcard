import type { InterviewQuestion } from '@/types/interview';
import type { ChatMessage } from '../types';

/** 简历正文送进模型时的上限，避免单次请求过长 */
const MAX_RESUME_CHARS = 6000;
/** 用户粘贴问题总量的上限，超出部分截断并提示 */
const MAX_QUESTIONS_CHARS = 6000;

const INTERVIEW_GUIDE_SYSTEM_PROMPT = `你是候选人本人的面试教练，负责把一场面试里被问到的真实问题，整理成一份可以直接拿去复习、也可以拿去和面试官复盘的面经文档。

写作要求：
1. 只回答用户给出的问题，不要自己加题、不要合并题目、不要改动问题原意。问题原文照抄到标题里。
2. 每道题的答案先给一句结论，再分 3~5 个要点展开。要点之间是并列或递进关系，不要写成流水账。
3. **每个要点必须以「- **加粗概括**：具体说明」的格式开头**，加粗部分是 2~8 个字的短语，概括这一小点的主题，只允许是名词、名词短语或关键数字，不要加粗整句、动词或形容词。
4. 答案要落在候选人自己的经历上：简历里写过的项目、模块、技术选型优先；简历没写的通用原理可以讲原理本身，但必须明确是通用知识，不要伪装成做过的事。
5. 禁止编造简历里没有的数字、指标、公司、项目。没有数据就写定性结论，不要凑一个占比或耗时。
6. 术语要用规范叫法（如「首屏渲染」「埋点上报」「状态机」），不写口语化表达，不用比喻，不写「为什么这么分」这类自问自答的小标题。
7. 如果问题本身是开放题（如「你怎么看 XX」），先给立场，再给两三条支撑理由。
8. 全部用简体中文，输出 Markdown 正文，不要用代码块包裹整篇文档，不要说「以下是面经」这类前言。

输出结构，必须严格照此生成，标题层级和编号都会被程序解析：

# {公司} · {岗位} · {场次}

## 一、面试问答

### 1. {问题原文}

**结论**：一句话直接给答案，不超过 60 字。

- **要点概括一**：具体说明，2~3 句，可以带代码片段或步骤。
- **要点概括二**：具体说明。
- **要点概括三**：具体说明。

### 2. {问题原文}

**结论**：……

- **要点概括一**：……

## 二、复盘与改进

- 表现较好：结合本场问题，指出候选人答得最扎实的一到两处。
- 需要补强：指出本场暴露的知识缺口，按优先级列出。
- 下一步：可执行的复习动作，尽量具体到知识点或项目细节。`;

export interface InterviewGuideInput {
  company: string;
  position: string;
  sessionName: string;
  sessionDate?: string;
  /** 用户粘贴的整理好的面试问题 */
  questions: string;
  /** 最新简历正文（Markdown） */
  resumeText: string;
  /** 候选人背景补充，可为空 */
  candidateContext?: string;
}

function clip(value: string, limit: number): string {
  const text = value.replace(/\r\n/g, '\n').trim();
  return text.length > limit ? `${text.slice(0, limit)}\n…（内容过长已截断）` : text;
}

export function buildInterviewGuideMessages(input: InterviewGuideInput): ChatMessage[] {
  const company = input.company.trim() || '未填写公司';
  const position = input.position.trim() || '未填写岗位';
  const sessionName = input.sessionName.trim() || '未填写场次';
  const title = `${company} · ${position} · ${sessionName}`;

  const userPrompt = [
    `本次面试信息：`,
    `- 公司：${company}`,
    `- 岗位：${position}`,
    `- 场次：${sessionName}`,
    input.sessionDate ? `- 日期：${input.sessionDate}` : '',
    `- 文档标题（必须原样写进 # 一级标题）：${title}`,
    '',
    '候选人最新简历：',
    '```markdown',
    clip(input.resumeText, MAX_RESUME_CHARS) || '（简历为空，请只讲通用原理，标注为通用知识）',
    '```',
    input.candidateContext?.trim()
      ? ['候选人背景补充：', clip(input.candidateContext, 2000)].join('\n')
      : '',
    '',
    '本场被问到的问题清单：',
    clip(input.questions, MAX_QUESTIONS_CHARS),
    '',
    '请按系统提示里的格式，为上面每一个问题各写一条问答，不要增删问题数量。',
  ].filter(Boolean).join('\n');

  return [
    { role: 'system', content: INTERVIEW_GUIDE_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}

/** 稳定的题目 id：同一题干无论重新生成还是编辑文档，id 都不变 */
function hashQuestion(text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * 从生成的 Markdown 里解析出题目与答案，用于收藏和掌握度追踪。
 * 只认 `### <编号>. <问题>` 这一层，遇到 `## ` 视为本场问答结束。
 */
export function parseInterviewGuideMarkdown(markdown: string): InterviewQuestion[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const questions: InterviewQuestion[] = [];

  let currentQuestion: string | null = null;
  let answerLines: string[] = [];
  let inCodeFence = false;

  const flush = () => {
    if (currentQuestion === null) return;
    const answer = answerLines.join('\n').trim();
    const questionText = currentQuestion.trim();
    questions.push({
      id: `q-${hashQuestion(questionText)}`,
      question: questionText,
      answer,
    });
    currentQuestion = null;
    answerLines = [];
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      answerLines.push(line);
      continue;
    }
    if (inCodeFence) {
      answerLines.push(line);
      continue;
    }

    const questionHeading = line.match(/^###\s+(?:\d+|[一二三四五六七八九十]+)[.、)）]?\s*(.+?)\s*$/);
    if (questionHeading) {
      flush();
      currentQuestion = questionHeading[1].trim();
      continue;
    }

    // 到「复盘与改进」这类二级标题就收尾，避免把复盘段落算进最后一题的答案
    if (/^##\s+/.test(line) && currentQuestion !== null) {
      flush();
      continue;
    }
    if (/^#\s+/.test(line)) continue;

    if (currentQuestion !== null) answerLines.push(line);
  }
  flush();

  return questions.filter((item) => item.question.length > 0);
}

/** 统计掌握度：已标记的题里，达到「熟练」及以上的占比 */
export function summariseMastery(
  questions: InterviewQuestion[],
  mastery: Record<string, number> | undefined,
): { marked: number; solid: number; total: number; percent: number } {
  const total = questions.length;
  const marked = questions.filter((item) => mastery?.[item.id] !== undefined).length;
  const solid = questions.filter((item) => (mastery?.[item.id] ?? 0) >= 2).length;
  return {
    marked,
    solid,
    total,
    percent: total === 0 ? 0 : Math.round((solid / total) * 100),
  };
}

export interface InterviewGuideAppendInput {
  company: string;
  position: string;
  sessionName: string;
  /** 文档里已有的题干，用于去重 */
  existingQuestions: string[];
  /** 本次新增的问题，一行一条 */
  newQuestions: string;
  resumeText: string;
  candidateContext?: string;
  /** 新题目的起始编号，通常等于已有题数 + 1 */
  startIndex: number;
}

function appendModePrompt(startIndex: number): string {
  return `

追加模式（本次覆盖上面的输出结构，其余写作要求不变）：
- 只输出新增题目的问答片段。不要写 \`#\` 一级标题，不要写 \`##\` 二级标题，也不要输出「复盘与改进」段落。
- 每道题仍以 \`### N. {问题原文}\` 起始，编号从 ${startIndex} 开始连续自增。
- 已给出的题目清单一律不重复回答，也不要改写它们的题干；只回答这次新增的问题。`;
}

export function buildInterviewGuideAppendMessages(input: InterviewGuideAppendInput): ChatMessage[] {
  const company = input.company.trim() || '未填写公司';
  const position = input.position.trim() || '未填写岗位';
  const sessionName = input.sessionName.trim() || '未填写场次';
  const startIndex = Math.max(1, Math.floor(input.startIndex));
  const existing = input.existingQuestions
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 80);

  const userPrompt = [
    `这场面试的文档标题：${company} · ${position} · ${sessionName}`,
    '',
    '文档里已经收录的题目（不要重复回答）：',
    existing.length > 0
      ? existing.map((item, index) => `${index + 1}. ${item}`).join('\n')
      : '（暂无）',
    '',
    '候选人最新简历：',
    '```markdown',
    clip(input.resumeText, MAX_RESUME_CHARS) || '（简历为空，请只讲通用原理，标注为通用知识）',
    '```',
    input.candidateContext?.trim()
      ? ['候选人背景补充：', clip(input.candidateContext, 2000)].join('\n')
      : '',
    '',
    '这次新增的问题（只回答这些）：',
    clip(input.newQuestions, MAX_QUESTIONS_CHARS),
  ].filter(Boolean).join('\n');

  return [
    { role: 'system', content: `${INTERVIEW_GUIDE_SYSTEM_PROMPT}${appendModePrompt(startIndex)}` },
    { role: 'user', content: userPrompt },
  ];
}

/** 从模型输出里取出 `### ` 开头的题目块，丢弃一级/二级标题，避免污染既有文档结构 */
function extractQuestionBlocks(text: string): string[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let current: string[] | null = null;
  let inCodeFence = false;

  const flush = () => {
    if (current) {
      const block = current.join('\n').trim();
      if (block) blocks.push(block);
      current = null;
    }
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      if (current) current.push(line);
      continue;
    }
    if (inCodeFence) {
      if (current) current.push(line);
      continue;
    }
    if (/^###\s+/.test(line)) {
      flush();
      // 编号交给统一重排，这里先抹掉
      current = [line.replace(/^###\s+(?:\d+|[一二三四五六七八九十]+)[.、)）]?\s*/, '### ')];
      continue;
    }
    if (/^#{1,2}\s+/.test(line)) {
      flush();
      continue;
    }
    if (current) current.push(line);
  }
  flush();

  return blocks;
}

/** 新增题目插到最后一个 `### ` 题目块之后、下一个 `## ` 之前 */
function findQuestionInsertIndex(lines: string[]): number {
  let lastQuestion = -1;
  let inCodeFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    if (/^###\s+/.test(line)) lastQuestion = index;
  }

  if (lastQuestion === -1) return lines.length;

  inCodeFence = false;
  for (let index = lastQuestion + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    if (/^#{1,2}\s+/.test(line)) return index;
  }

  return lines.length;
}

/** 把所有 `### N. ` 题目标题按出现顺序重排，题干和答案不动，题目 id 由题干 hash 得到因此不受影响 */
function renumberQuestionHeadings(markdown: string): string {
  const lines = markdown.split('\n');
  let inCodeFence = false;
  let counter = 0;

  const output = lines.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      return line;
    }
    if (inCodeFence) return line;
    const heading = line.match(/^###\s+(?:[\d一二三四五六七八九十]+[.、)）]?\s*)?(.+?)\s*$/);
    if (!heading) return line;
    counter += 1;
    return `### ${counter}. ${heading[1]}`;
  });

  return output.join('\n');
}

/**
 * 把追加生成的内容并入既有面经文档：插入问答区末尾，统一重排编号。
 * 没有识别到题目块时返回原文档，避免把无关文字写进去。
 */
export function appendQuestionsToMarkdown(markdown: string, appended: string): string {
  const base = markdown.replace(/\r\n/g, '\n');
  const blocks = extractQuestionBlocks(appended);
  if (blocks.length === 0) return markdown;

  const lines = base.split('\n');
  const insertAt = findQuestionInsertIndex(lines);

  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  while (before.length > 0 && before[before.length - 1].trim() === '') before.pop();
  while (after.length > 0 && after[0].trim() === '') after.shift();

  const parts: string[] = [...before];
  if (parts.length > 0) parts.push('');
  parts.push(blocks.join('\n\n'));
  if (after.length > 0) {
    parts.push('');
    parts.push(...after);
  }

  return renumberQuestionHeadings(parts.join('\n').replace(/\n{3,}/g, '\n\n'));
}
