import type { DistractorNote, FlashCard, QuizItem } from '@/types';
import { callLlmJson } from '@/lib/llm/call';
import {
  MAX_CARDS_PER_REQUEST,
  buildQuizMessages,
  parseQuizPayload,
} from '@/lib/llm/prompts/quiz';
import { QUIZ_SCHEMA_VERSION, cardFingerprint } from './fingerprint';

interface RawQuizItem {
  cardId?: unknown;
  point?: unknown;
  stem?: unknown;
  options?: unknown;
  answerIndex?: unknown;
  explanation?: unknown;
  distractors?: unknown;
}

interface RawDistractor {
  optionIndex?: unknown;
  misconception?: unknown;
  correction?: unknown;
}

/** 选项归一化：去掉空白和标点后比较，防止「a、」和「a」被当成两个选项 */
function normalizeOption(text: string): string {
  return text
    .replace(/\s+/g, '')
    .replace(/[，。、：；！？（）()「」『』“”"'`,.:;!?]/g, '')
    .toLowerCase();
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * 清洗误解诊断。
 * 只保留「指向真实错误选项」的条目：下标越界、指到正确答案、重复指向同一项、
 * 文案空泛（少于 4 字）的一律丢掉。诊断缺失不影响题目可用，只是答错时少一句解释。
 */
function parseDistractors(
  raw: unknown,
  optionCount: number,
  answerIndex: number
): DistractorNote[] {
  if (!Array.isArray(raw)) return [];

  const notes: DistractorNote[] = [];
  const used = new Set<number>();

  for (const entry of raw) {
    const note = entry as RawDistractor;
    const optionIndex = typeof note.optionIndex === 'number' ? note.optionIndex : NaN;

    if (!Number.isInteger(optionIndex)) continue;
    if (optionIndex < 0 || optionIndex >= optionCount) continue;
    if (optionIndex === answerIndex) continue;
    if (used.has(optionIndex)) continue;

    const misconception = asText(note.misconception);
    if (misconception.length < 4) continue;

    const correction = asText(note.correction);

    used.add(optionIndex);
    notes.push({
      optionIndex,
      misconception,
      ...(correction ? { correction } : {}),
    });
  }

  return notes;
}

/**
 * 校验模型输出。
 * 不合格的题直接丢弃而不是重试：一轮 10 道里少一两道可以接受，
 * 反复重试会把当天的 LLM 额度全烧在出题上。
 */
export function sanitizeQuizItems(
  raw: unknown,
  cards: FlashCard[],
  generatedAt: number
): QuizItem[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { items?: unknown } | null)?.items)
      ? ((raw as { items: unknown[] }).items)
      : [];

  const cardMap = new Map(cards.map((card) => [card.id, card]));
  const used = new Set<string>();
  const items: QuizItem[] = [];

  for (const entry of list) {
    const item = entry as RawQuizItem;
    const cardId = asText(item.cardId);
    const card = cardMap.get(cardId);
    if (!card || used.has(cardId)) continue;

    const stem = asText(item.stem);
    if (stem.length < 6) continue;

    if (!Array.isArray(item.options)) continue;
    const options = item.options
      .map((option) => asText(option))
      .filter((option) => option.length > 0);
    if (options.length < 2 || options.length > 4) continue;

    let hasDuplicate = false;
    const seen = new Set<string>();
    for (const option of options) {
      const key = normalizeOption(option);
      if (!key || seen.has(key)) {
        hasDuplicate = true;
        break;
      }
      seen.add(key);
    }
    // 有重复或空选项，说明干扰项不合格，整题丢弃
    if (hasDuplicate) continue;

    const answerIndex = typeof item.answerIndex === 'number' ? item.answerIndex : NaN;
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      continue;
    }

    const explanation = asText(item.explanation) || `正确答案：${options[answerIndex]}`;
    const point = asText(item.point) || '本卡片核心考点';
    const distractors = parseDistractors(item.distractors, options.length, answerIndex);

    used.add(cardId);
    items.push({
      id: `quiz:${cardId}`,
      cardId,
      module: card.module,
      chapterId: card.chapterId,
      question: card.question,
      stem,
      options,
      answerIndex,
      explanation,
      point,
      ...(distractors.length > 0 ? { distractors } : {}),
      schemaVersion: QUIZ_SCHEMA_VERSION,
      cardVersion: cardFingerprint(card),
      generatedAt,
    });
  }

  return items;
}

/**
 * 批量出题。按 MAX_CARDS_PER_REQUEST 分批串行请求，
 * 一次请求出多道，比"一题一次请求"省几倍配额。
 */
export async function generateQuizItems(cards: FlashCard[]): Promise<QuizItem[]> {
  if (cards.length === 0) return [];

  const batches: FlashCard[][] = [];
  for (let i = 0; i < cards.length; i += MAX_CARDS_PER_REQUEST) {
    batches.push(cards.slice(i, i + MAX_CARDS_PER_REQUEST));
  }

  const result: QuizItem[] = [];
  for (const batch of batches) {
    const response = await callLlmJson<{
      choices?: Array<{ message?: { content?: string | null } }>;
    }>({
      model: 'deepseek-chat',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: buildQuizMessages(batch),
    });

    const content = response.choices?.[0]?.message?.content ?? '';
    if (!content.trim()) continue;

    try {
      result.push(...sanitizeQuizItems(parseQuizPayload(content), batch, Date.now()));
    } catch {
      // 单批解析失败不影响其他批次，缺的题下一轮再补
      continue;
    }
  }

  return result;
}
