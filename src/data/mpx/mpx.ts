/*
 * @Author: tancheng
 * @Date: 2026-05-21 10:43:24
 * @LastEditors: tancheng
 * @LastEditTime: 2026-05-21 11:41:37
 * @FilePath: /interview-flashcard/src/data/mpx/mpx.ts
 * @Description: 
 */
import { FlashCard, Chapter } from '@/types';
import mpxGuideRaw from '@/../docs/Mpx/mpx-guide.md?raw';
import mpxArchitectureRaw from '@/../docs/Mpx/mpx-architecture.md?raw';
import devGuideRaw from '@/../docs/Mpx/dev-guide.md?raw';

/**
 * Parse technical documentation format:
 * ## 1. 标题\n\n内容\n\n---\n\n## 2. 标题\n\n内容
 */
function parseTechDocCards(
  content: string,
  chapterId: string,
  module: 'core' | 'projects' | 'algorithms' = 'core'
): FlashCard[] {
  // Split by --- separator to get sections
  const sections = content.split(/\n---\n/);

  const cards: FlashCard[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Skip the title section (# 文件名)
    if (trimmed.startsWith('# ')) continue;

    // Match ## N. 标题 pattern at the start
    const lines = trimmed.split('\n');
    const firstLine = lines[0];
    const match = firstLine.match(/^## (\d+)\.\s+(.+)$/);

    if (match) {
      const num = match[1];
      const title = match[2].trim();
      // Content is everything after the first line, up to 3 levels of headers
      const contentLines = lines.slice(1).join('\n').trim();

      if (contentLines) {
        const card: FlashCard = {
          id: `${chapterId}-${num}`,
          module,
          chapterId,
          question: title,
          answer: contentLines,
          tags: [chapterId],
          status: 'unvisited',
        };
        cards.push(card);
      }
    }
  }

  return cards;
}

/**
 * Get chapter title from content
 */
function getChapterTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : '';
}

// Load MPX cards from docs/Mpx
export const mpxCards: FlashCard[] = [
  ...parseTechDocCards(mpxGuideRaw, 'mpx-guide', 'core'),
  ...parseTechDocCards(mpxArchitectureRaw, 'mpx-architecture', 'core'),
  ...parseTechDocCards(devGuideRaw, 'dev-guide', 'core'),
];

// Create chapters for each source file
export const mpxChapters: Chapter[] = [
  {
    id: 'mpx-guide',
    title: getChapterTitle(mpxGuideRaw) || 'MPX 入门语法',
    description: 'MPX 入门语法大全，包含模板、样式、脚本、组件等核心语法',
    cardCount: mpxCards.filter(c => c.chapterId === 'mpx-guide').length,
    cards: [],
  },
  {
    id: 'mpx-architecture',
    title: getChapterTitle(mpxArchitectureRaw) || 'MPX 系统架构',
    description: 'MPX 系统架构拆解，宏观层面设计解析',
    cardCount: mpxCards.filter(c => c.chapterId === 'mpx-architecture').length,
    cards: [],
  },
  {
    id: 'dev-guide',
    title: getChapterTitle(devGuideRaw) || 'MPX 开发指南',
    description: 'fe-esflight 开发流程指南，适用于新入职前端实习生',
    cardCount: mpxCards.filter(c => c.chapterId === 'dev-guide').length,
    cards: [],
  },
];