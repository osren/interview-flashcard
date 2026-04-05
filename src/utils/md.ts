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
 * 或
 * ## 1. 问题内容
 * 答案内容
 */
export function importCardsFromMd(
  mdContent: string,
  _module?: ModuleType,
  _chapterId?: string
): { question: string; answer: string }[] {
  const cards: { question: string; answer: string }[] = [];

  // 分割每个问答对（用 --- 分割）
  const sections = mdContent.split(/\n---\n/);

  for (const section of sections) {
    if (!section.trim()) continue;

    // 匹配格式1: ## 序号. 问题\n## 答案\n答案内容
    // 匹配格式2: ## 序号. 问题\n答案内容（没有答案标题）
    const qaMatch = section.match(/^##\s*\d+\.\s*(.+?)(?:\n##\s*答案\n|\n)([\s\S]*)$/);

    if (qaMatch) {
      cards.push({
        question: qaMatch[1].trim(),
        answer: qaMatch[2].trim(),
      });
    } else {
      // 尝试简化格式：只有问题，答案为空
      const simpleMatch = section.match(/^##\s*\d+\.\s*(.+)$/);
      if (simpleMatch) {
        cards.push({
          question: simpleMatch[1].trim(),
          answer: '',
        });
      }
    }
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
