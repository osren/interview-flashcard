import type { FlashCard } from '@/types';

export interface StudyOutlineQuestion {
  card: FlashCard;
  number: number;
  headingId: string;
}

export interface StudyOutlineSection {
  category: string;
  headingId: string;
  questions: StudyOutlineQuestion[];
}

export function markdownHeadingId(text: string): string {
  return text.toLocaleLowerCase().trim()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .replace(/[\s-]+/g, '-');
}

function plainMarkdownText(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~]/g, '');
}

function escapeMarkdownHeadingText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toChineseNumber(value: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (value <= 10) return value === 10 ? '十' : digits[value];
  if (value < 20) return `十${digits[value % 10]}`;
  if (value < 100) return `${digits[Math.floor(value / 10)]}十${value % 10 ? digits[value % 10] : ''}`;
  return String(value);
}

function normalizeAnswerHeadings(answer: string): string {
  let pointNumber = 0;
  return answer.replace(/^#{1,6}\s+(.+)$/gm, (_line, rawTitle: string) => {
    const title = rawTitle.trim();
    if (/^(答案|参考答案|回答要点)\s*$/i.test(title)) return '';
    if (/^\d+\)\s+/.test(title)) return `#### ${title}`;
    pointNumber += 1;
    return `#### ${pointNumber}) ${title.replace(/^\d+[.)、]\s*/, '')}`;
  }).replace(/\n{3,}/g, '\n\n').trim();
}

export function buildStudyMarkdown(title: string, cards: FlashCard[]): {
  markdown: string;
  sections: StudyOutlineSection[];
} {
  const categories = new Map<string, FlashCard[]>();
  for (const card of cards) {
    const category = card.category?.trim() || title;
    const group = categories.get(category) ?? [];
    group.push(card);
    categories.set(category, group);
  }

  const sections: StudyOutlineSection[] = [];
  const markdownParts = [`# ${title}`];
  let questionNumber = 0;

  for (const [category, categoryCards] of categories) {
    const sectionNumber = sections.length + 1;
    const sectionTitle = `${toChineseNumber(sectionNumber)}、${category}`;
    const section: StudyOutlineSection = {
      category,
      headingId: markdownHeadingId(sectionTitle),
      questions: [],
    };
    markdownParts.push(`## ${sectionTitle}`);

    for (const card of categoryCards) {
      questionNumber += 1;
      const questionText = card.question.trim().replace(/\s*\n\s*/g, ' ');
      const questionTitle = `${questionNumber}. ${escapeMarkdownHeadingText(questionText)}`;
      const question: StudyOutlineQuestion = {
        card,
        number: questionNumber,
        headingId: markdownHeadingId(plainMarkdownText(`${questionNumber}. ${questionText}`)),
      };
      section.questions.push(question);
      markdownParts.push(`### ${questionTitle}`);

      const answer = normalizeAnswerHeadings(card.answer ?? '');
      if (answer) markdownParts.push(answer);
      if (card.answerImage) markdownParts.push(`![第 ${questionNumber} 题图解](${card.answerImage})`);
      if (!answer && !card.answerImage) markdownParts.push('（暂无文字答案）');
    }
    sections.push(section);
  }

  return { markdown: markdownParts.join('\n\n'), sections };
}

export function exportStudyMarkdown(title: string | undefined, cards: FlashCard[]): string {
  return buildStudyMarkdown(title?.trim() || '学习笔记', cards).markdown;
}
