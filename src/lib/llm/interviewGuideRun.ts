import { streamLlm } from './call';
import {
  appendQuestionsToMarkdown,
  buildInterviewGuideAppendMessages,
  buildInterviewGuideMessages,
  parseInterviewGuideMarkdown,
} from './prompts/interview-guide';
import { CANDIDATE_CONTEXT } from './prompts/candidate-context';

/** 追问行：切批时必须跟在其所属主问题后面，不能拆到下一批 */
const FOLLOW_UP_PREFIX = /^追问\s*[:：]?/;

/**
 * 把用户粘贴的问题清单切成批。
 * 追问与其所属主问题视为一个不可拆分的组；批按组数与字符数双重限制，
 * 避免单次生成把 max_tokens 撑满导致输出被截断。
 */
export function splitQuestionsIntoBatches(
  raw: string,
  options: { maxChars?: number; maxGroups?: number } = {}
): string[] {
  const maxChars = options.maxChars ?? 1600;
  const maxGroups = options.maxGroups ?? 8;

  const lines = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const groups: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (FOLLOW_UP_PREFIX.test(line) && current.length > 0) {
      current.push(line);
      continue;
    }
    if (current.length > 0) groups.push(current.join('\n'));
    current = [line];
  }
  if (current.length > 0) groups.push(current.join('\n'));

  const batches: string[] = [];
  let batch: string[] = [];
  let chars = 0;

  for (const group of groups) {
    const overflow =
      batch.length > 0 && (batch.length >= maxGroups || chars + group.length > maxChars);
    if (overflow) {
      batches.push(batch.join('\n'));
      batch = [];
      chars = 0;
    }
    batch.push(group);
    chars += group.length;
  }
  if (batch.length > 0) batches.push(batch.join('\n'));

  return batches.length > 0 ? batches : [raw];
}

export interface InterviewGuideRunOptions {
  company: string;
  position: string;
  sessionName: string;
  sessionDate?: string;
  /** 本次输入的问题清单（可以是长清单，内部会分批） */
  questions: string;
  resumeText: string;
  /** 追加模式时传入已有文档；首次生成留空 */
  baseDocument?: string;
  candidateContext?: string;
  /** 每批返回的完整文档与当前批次片段，用于流式预览 */
  onProgress?: (payload: { fullText: string; batchText: string; done: number; total: number }) => void;
  /** 返回 true 时停止后续批次，已生成的内容保留 */
  isAborted?: () => boolean;
}

/**
 * 分批生成面经：首批产出完整文档结构，后续批次以「只输出新增题目」的方式追加，
 * 每批都基于当前文档重算已有题干，编号接续且不会重复出题。
 */
export async function generateInterviewGuideBatches(options: InterviewGuideRunOptions): Promise<string> {
  const batches = splitQuestionsIntoBatches(options.questions);
  const candidateContext = options.candidateContext ?? CANDIDATE_CONTEXT;

  let full = options.baseDocument ?? '';
  let existing = parseInterviewGuideMarkdown(full).map((item) => item.question);

  for (let index = 0; index < batches.length; index += 1) {
    if (options.isAborted?.()) return full;

    const messages = full
      ? buildInterviewGuideAppendMessages({
          company: options.company,
          position: options.position,
          sessionName: options.sessionName,
          existingQuestions: existing,
          newQuestions: batches[index],
          resumeText: options.resumeText,
          candidateContext,
          startIndex: existing.length + 1,
        })
      : buildInterviewGuideMessages({
          company: options.company,
          position: options.position,
          sessionName: options.sessionName,
          sessionDate: options.sessionDate,
          questions: batches[index],
          resumeText: options.resumeText,
          candidateContext,
        });

    let batchText = '';
    for await (const chunk of streamLlm({
      messages,
      temperature: 0.4,
      max_tokens: 6000,
    })) {
      if (options.isAborted?.()) return full;
      batchText += chunk;
      options.onProgress?.({
        fullText: full ? appendQuestionsToMarkdown(full, batchText) : batchText,
        batchText,
        done: index,
        total: batches.length,
      });
    }

    if (options.isAborted?.()) return full;
    if (!batchText.trim()) {
      throw new Error(`第 ${index + 1}/${batches.length} 批没有返回内容，请稍后重试`);
    }

    full = full ? appendQuestionsToMarkdown(full, batchText) : batchText;
    existing = parseInterviewGuideMarkdown(full).map((item) => item.question);
    options.onProgress?.({
      fullText: full,
      batchText,
      done: index + 1,
      total: batches.length,
    });
  }

  if (!full.trim()) {
    throw new Error('AI 没有返回内容，请重试');
  }

  return full;
}
