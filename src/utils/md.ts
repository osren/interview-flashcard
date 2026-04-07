import { FlashCard, ModuleType } from '@/types';
import { InterviewQuestion } from '@/types/interview';

/**
 * 将 FlashCard 数组导出为 Markdown 格式
 * 格式：
 * ## 1. 问题
 * 问题内容
 *
 * ## 答案
 * 答案内容（若答案为空则显示"（空）"）
 */
export function exportCardsToMd(cards: FlashCard[]): string {
  return cards
    .map((card, index) => {
      const num = index + 1;
      const question = card.question.trim();
      const answer = card.answer.trim() || '（空）';

      return `## ${num}. ${question}

## 答案
${answer}`;
    })
    .join('\n\n---\n\n');
}

/**
 * 将 InterviewQuestion 数组导出为 Markdown 格式
 */
export function exportInterviewQuestionsToMd(
  questions: InterviewQuestion[],
  title?: string
): string {
  const header = title ? `# ${title}\n\n` : '';
  return header + questions
    .map((q, index) => {
      const num = index + 1;
      const question = q.question.trim();
      const answer = q.answer.trim() || '（空）';

      return `## ${num}. ${question}

## 答案
${answer}`;
    })
    .join('\n\n---\n\n');
}

/**
 * 从 Markdown 格式导入问答
 * 支持格式：
 * ## 1. 问题内容
 * ## 答案
 * 答案内容
 *
 * 或（答案可为空）
 * ## 1. 问题内容
 * ## 答案
 * （空）
 */
export function importCardsFromMd(
  mdContent: string,
  _module?: ModuleType,
  _chapterId?: string
): { question: string; answer: string }[] {
  const cards: { question: string; answer: string }[] = [];

  // 标准化换行符（处理 Windows \r\n）
  const content = mdContent.replace(/\r\n/g, '\n');

  // 分割每个问答对（用 ## 序号. 分割，--- 不是可靠的分割符）
  // 格式: ## 1. 问题\n\n## 答案\n\n答案内容
  const sections = content.split(/\n(?=##\s*\d+\.)/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // 匹配格式: ## 序号. 问题内容
    const questionMatch = trimmed.match(/^##\s*\d+\.\s*([\s\S]+?)(?=\n\n##\s*答案)/);
    if (!questionMatch) continue;

    const question = questionMatch[1].trim();

    // 匹配答案内容（## 答案 之后到下一个 ## 序号. 之前，或文件末尾）
    const answerMatch = trimmed.match(/\n\n##\s*答案\n\n([\s\S]*?)(?=\n\n##\s*\d+\.|$)/);
    let answer = '';

    if (answerMatch) {
      answer = answerMatch[1].trim();
    }

    // 如果答案部分是空的或者是（空），设为空字符串
    if (answer === '' || answer === '（空）') {
      answer = '';
    }

    cards.push({ question, answer });
  }

  return cards;
}

/**
 * 触发文件下载
 */
export function downloadMd(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 读取文件内容
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
