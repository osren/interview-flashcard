import type { QuizAttempt, QuizItem, QuizRoundResult } from '@/types';

/**
 * 判分。单选，答案就是 answerIndex。
 * 没作答（selectedIndex 缺失或越界）一律算错，不静默跳过，否则正确率会被抬高。
 */
export function scoreRound(
  items: QuizItem[],
  answers: Record<string, number>
): QuizRoundResult {
  const details = items.map((item) => {
    const selectedIndex = answers[item.id];
    const valid = typeof selectedIndex === 'number' && selectedIndex >= 0;
    const correct = valid && selectedIndex === item.answerIndex;
    return {
      item,
      selectedIndex: valid ? selectedIndex : -1,
      correct,
    };
  });

  const total = details.length;
  const correct = details.filter((detail) => detail.correct).length;

  return {
    total,
    correct,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    details,
  };
}

/** 把一轮结果转成可落库、可多端合并的作答记录 */
export function toAttemptRecords(
  result: QuizRoundResult,
  sessionId: string,
  at: number
): QuizAttempt[] {
  return result.details.map((detail) => ({
    // sessionId + itemId 天然唯一，多端合并时按并集去重不会互相覆盖
    id: `${sessionId}:${detail.item.id}`,
    sessionId,
    itemId: detail.item.id,
    cardId: detail.item.cardId,
    correct: detail.correct,
    selectedIndex: detail.selectedIndex,
    at,
  }));
}
