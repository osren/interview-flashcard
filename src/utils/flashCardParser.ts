import { FlashCard, Chapter } from '@/types';

/**
 * Parse a FlashCard markdown file into cards and chapter
 */
export function parseFlashCardFile(
  filePath: string,
  fileContent: string,
  chapterId: string,
  module: 'core' | 'projects' | 'algorithms' = 'core'
): { cards: FlashCard[]; chapter: Chapter } {
  // Split by "---" separator to get individual Q&A pairs
  const sections = fileContent.split(/^---$/m);

  const cards: FlashCard[] = [];
  let chapterTitle = '';
  let chapterDescription = '';

  sections.forEach((section, index) => {
    // Skip the title section (first section with # filename)
    if (index === 0) {
      // First section contains title like "# mpx-guide"
      const titleMatch = section.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        chapterTitle = titleMatch[1];
      }
      return;
    }

    // Parse section: ## N. Question Title\n\n## 答案\n\n**Answer content**
    const questionMatch = section.match(/^##\s+(\d+)\.\s+(.+?)(?=\n|$)/s);
    const answerMatch = section.match(/^## 答案\n\n([\s\S]*?)$/);

    if (questionMatch && answerMatch) {
      const num = questionMatch[1];
      const question = questionMatch[2].trim();
      let answer = answerMatch[1].trim();

      // Parse sub-questions (if any split by "---")
      const subQuestions = answer.split(/^---$/m).filter(s => s.trim());

      if (subQuestions.length > 1) {
        // Multiple sub-questions: combine them
        const combinedAnswer = subQuestions.map(sq => {
          const sqTrimmed = sq.trim();
          if (!sqTrimmed) return '';

          // Check if starts with ## 答案
          if (sqTrimmed.startsWith('## 答案')) {
            return sqTrimmed.replace(/^## 答案\n\n/, '');
          }
          return sqTrimmed;
        }).filter(Boolean).join('\n\n---\n\n');

        answer = combinedAnswer;
      }

      const card: FlashCard = {
        id: `${chapterId}-${num}`,
        module,
        chapterId,
        question,
        answer,
        tags: [chapterId],
        status: 'unvisited',
      };

      cards.push(card);
    }
  });

  const chapter: Chapter = {
    id: chapterId,
    title: chapterTitle || chapterId,
    description: `MPX 相关知识点总结`,
    cardCount: cards.length,
    cards: [],
  };

  return { cards, chapter };
}

/**
 * Load all MPX cards from docs/Transfer
 */
export function loadMpxCards(): { mpxCards: FlashCard[]; mpxChapters: Chapter[] } {
  // This will be populated by the actual import
  // For now we return empty and the actual cards are loaded via Vite's ?raw import
  return { mpxCards: [], mpxChapters: [] };
}