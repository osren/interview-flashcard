/**
 * 从 bomian-frontend-questions.json 生成 src/data/core/ 章节文件
 * 用法: node scripts/generate-bomian-core.mjs
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const JSON_PATH = join(ROOT, 'docs/scrape/bomian-frontend-questions.json');
const CORE_DIR = join(ROOT, 'src/data/core');

const CHAPTER_META = {
  JavaScript: {
    file: 'javascript',
    id: 'javascript',
    title: 'JavaScript',
    description: '播面图解：变量、作用域、异步、原型等核心考点',
    icon: '📜',
  },
  HTML: {
    file: 'html',
    id: 'html',
    title: 'HTML',
    description: '播面图解：语义化、文档结构、表单等 HTML 考点',
    icon: '🏷️',
  },
  CSS: {
    file: 'css',
    id: 'css',
    title: 'CSS',
    description: '播面图解：布局、选择器、动画等 CSS 考点',
    icon: '🎨',
  },
  Vue: {
    file: 'vue',
    id: 'vue',
    title: 'Vue',
    description: '播面图解：响应式、组件、生命周期等 Vue 考点',
    icon: '💚',
  },
  'Next.js': {
    file: 'nextjs',
    id: 'nextjs',
    title: 'Next.js',
    description: '播面图解：SSR、路由、渲染等 Next.js 考点',
    icon: '▲',
  },
  React: {
    file: 'react',
    id: 'react',
    title: 'React',
    description: '播面图解：组件、Hooks、状态管理等 React 考点',
    icon: '⚛️',
  },
  TypeScript: {
    file: 'typescript',
    id: 'typescript',
    title: 'TypeScript',
    description: '播面图解：类型系统、泛型、工具类型等 TS 考点',
    icon: '🔷',
  },
  浏览器特性: {
    file: 'browser-features',
    id: 'browser-features',
    title: '浏览器特性',
    description: '播面图解：渲染、存储、网络等浏览器机制',
    icon: '🌐',
  },
  浏览器安全: {
    file: 'browser-security',
    id: 'browser-security',
    title: '浏览器安全',
    description: '播面图解：XSS、CSRF、CSP 等安全考点',
    icon: '🔒',
  },
  Webpack: {
    file: 'webpack',
    id: 'webpack',
    title: 'Webpack',
    description: '播面图解：构建流程、Loader、Plugin 等工程化考点',
    icon: '📦',
  },
};

function escapeTsString(s) {
  return JSON.stringify(s);
}

function buildCard(meta, q, index) {
  const lines = [
    '  {',
    `    id: 'bomian-${meta.id}-${q.id}',`,
    `    module: 'core',`,
    `    chapterId: '${meta.id}',`,
    `    category: '${meta.title}',`,
    `    question: ${escapeTsString(q.title)},`,
    `    answer: '',`,
    `    answerImage: ${escapeTsString(q.imageUrl)},`,
    `    tags: ['${meta.title}', '播面', '图解'],`,
    `    status: 'unvisited',`,
    `    difficulty: 'medium',`,
    '  },',
  ];
  return lines.join('\n');
}

function buildChapterFile(meta, questions) {
  const exportPrefix = meta.file.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const cardsVar = `${meta.file.replace(/-/g, '')}Cards`;
  const chapterVar = `${meta.file.replace(/-/g, '')}Chapter`;

  const cardsBody = questions.map((q, i) => buildCard(meta, q, i)).join('\n');

  return `import { FlashCard, Chapter } from '@/types';

export const ${cardsVar}: FlashCard[] = [
${cardsBody}
];

export const ${chapterVar}: Chapter = {
  id: '${meta.id}',
  module: 'core',
  title: '${meta.title}',
  description: '${meta.description}',
  cardCount: ${cardsVar}.length,
  icon: '${meta.icon}',
};
`;
}

/** camelCase export names for index imports */
function exportNames(file) {
  const base = file.replace(/-/g, '');
  return { cards: `${base}Cards`, chapter: `${base}Chapter` };
}

function extractExtraChapters() {
  const old = execSync('git show HEAD:src/data/core/index.ts', {
    encoding: 'utf8',
    cwd: join(__dirname, '..'),
  });
  const lines = old.split('\n');
  const findLine = (prefix) => {
    const idx = lines.findIndex((l) => l.startsWith(prefix));
    if (idx === -1) throw new Error(`Line not found: ${prefix}`);
    return idx;
  };
  const perfStart = findLine('const performanceCards');
  const htmlStart = findLine('const htmlCssCards');
  const hooksStart = findLine('const reactHooksCards');
  const hooksChapterEnd = findLine('const reactHooksChapter') + 8;
  const slice = `${lines.slice(perfStart, htmlStart).join('\n')}\n${lines.slice(hooksStart, hooksChapterEnd).join('\n')}`;
  const withExports = slice
    .replace(/^const performanceCards/m, 'export const performanceCards')
    .replace(/^const performanceChapter/m, 'export const performanceChapter')
    .replace(/^const engineeringCards/m, 'export const engineeringCards')
    .replace(/^const engineeringChapter/m, 'export const engineeringChapter')
    .replace(/^const aiEngineeringCards/m, 'export const aiEngineeringCards')
    .replace(/^const aiEngineeringChapter/m, 'export const aiEngineeringChapter')
    .replace(/^const systemDesignCards/m, 'export const systemDesignCards')
    .replace(/^const systemDesignChapter/m, 'export const systemDesignChapter')
    .replace(/^const reactHooksCards/m, 'export const reactHooksCards')
    .replace(/^const reactHooksChapter/m, 'export const reactHooksChapter');

  return `import { Chapter, FlashCard } from '@/types';

${withExports}
`;
}

function buildIndex(orderedFiles) {
  const imports = orderedFiles
    .map(({ file, ...names }) => `import { ${names.cards}, ${names.chapter} } from './${file}';`)
    .join('\n');

  const extraImport = `import {
  performanceCards,
  performanceChapter,
  engineeringCards,
  engineeringChapter,
  aiEngineeringCards,
  aiEngineeringChapter,
  systemDesignCards,
  systemDesignChapter,
  reactHooksCards,
  reactHooksChapter,
} from './extra-chapters';`;

  const chapterList = orderedFiles.map((n) => n.chapter).join(',\n  ');
  const cardSpreads = orderedFiles.map((n) => `...${n.cards}`).join(',\n  ');

  return `${imports}
${extraImport}
import { Chapter, FlashCard } from '@/types';

export const coreChapters: Chapter[] = [
  ${chapterList},
  reactHooksChapter,
  engineeringChapter,
  performanceChapter,
  aiEngineeringChapter,
  systemDesignChapter,
];

export const coreCards: FlashCard[] = [
  ${cardSpreads},
  ...reactHooksCards,
  ...engineeringCards,
  ...performanceCards,
  ...aiEngineeringCards,
  ...systemDesignCards,
];
`;
}

function main() {
  const raw = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
  const orderedFiles = [];

  for (const group of raw.data) {
    const meta = CHAPTER_META[group.tab];
    if (!meta) {
      console.warn(`Skip unknown tab: ${group.tab}`);
      continue;
    }

    const content = buildChapterFile(meta, group.questions);
    const outPath = join(CORE_DIR, `${meta.file}.ts`);
    writeFileSync(outPath, content, 'utf-8');
    console.log(`✓ ${meta.file}.ts (${group.questions.length} cards)`);

    orderedFiles.push({ file: meta.file, ...exportNames(meta.file) });
  }

  // extra chapters (performance, engineering, etc.)
  writeFileSync(join(CORE_DIR, 'extra-chapters.ts'), extractExtraChapters(), 'utf-8');
  console.log('✓ extra-chapters.ts');

  writeFileSync(join(CORE_DIR, 'index.ts'), buildIndex(orderedFiles), 'utf-8');
  console.log('✓ index.ts');

  // remove obsolete files
  for (const obsolete of ['react-core.ts']) {
    const p = join(CORE_DIR, obsolete);
    if (existsSync(p)) {
      unlinkSync(p);
      console.log(`✓ removed ${obsolete}`);
    }
  }

  const total = raw.data.reduce((s, g) => s + g.questions.length, 0);
  console.log(`\nDone: ${total} bomian cards across ${orderedFiles.length} chapters`);
}

main();
