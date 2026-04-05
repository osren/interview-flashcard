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

  // 去掉首行的标题（如果有）
  const lines = mdContent.split('\n');
  const contentStartIndex = lines.findIndex(line => line.match(/^##\s*\d+\./));
  const content = contentStartIndex > 0 ? lines.slice(contentStartIndex).join('\n') : mdContent;

  // 分割每个问答对（用 --- 分割）
  const sections = content.split(/\n---\n/);

  for (const section of sections) {
    if (!section.trim()) continue;

    // 去掉首尾空白
    const trimmed = section.trim();
    if (!trimmed) continue;

    // 匹配格式: ## 序号. 问题内容（问题可能跨行）
    // 使用 [\s\S] 匹配任意字符包括换行，.+? 非贪婪匹配
    const questionMatch = trimmed.match(/^##\s*\d+\.\s*([\s\S]+?)(?=\n##\s*答案|$)/);
    if (!questionMatch) continue;

    const question = questionMatch[1].trim();

    // 查找 ## 答案 之后的内容
    const answerMatch = trimmed.match(/\n##\s*答案\n([\s\S]*)$/);
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
