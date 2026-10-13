import type { FlashCard } from '@/types';
import source from './backgrounds/comprehensive-interview-source.md?raw';

const questionMatches = Array.from(source.matchAll(/^### Q(\d+)：(.+)$/gm));
const sectionMatches = Array.from(source.matchAll(/^## (.+)$/gm));

function getCategory(questionIndex: number): string {
  const previousSections = sectionMatches.filter((match) => (match.index ?? -1) < questionIndex);
  const section = previousSections[previousSections.length - 1]?.[1]
    ?.replace(/^[一二三四五六七八九十]+、\s*/, '')
    .trim();

  return section || '综合面试';
}

export const comprehensiveInterviewCards: FlashCard[] = questionMatches.flatMap<FlashCard>((question, index) => {
  const start = (question.index ?? 0) + question[0].length;
  const nextQuestionStart = questionMatches[index + 1]?.index ?? source.length;
  const nextSection = /^## .+$/gm;
  nextSection.lastIndex = start;
  const nextSectionStart = nextSection.exec(source)?.index ?? source.length;
  const end = Math.min(nextQuestionStart, nextSectionStart);
  const answerBlock = source.slice(start, end);
  const answerMarker = /^\*\*(?:答|参考回答)：\*\*/m.exec(answerBlock);

  if (!answerMarker || answerMarker.index === undefined) return [];

  const questionNumber = question[1].padStart(3, '0');
  const category = getCategory(question.index ?? 0);
  const answer = answerBlock.slice(answerMarker.index + answerMarker[0].length).trim();

  return [{
    id: `comprehensive-interview-${questionNumber}`,
    module: 'projects',
    chapterId: 'comprehensive-interview',
    category,
    question: question[2].trim(),
    answer,
    tags: ['综合面试', category],
    status: 'unvisited',
    difficulty: 'medium',
  }];
});
