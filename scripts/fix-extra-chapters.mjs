import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORE_DIR = join(__dirname, '../src/data/core');

const old = execSync('git show HEAD:src/data/core/index.ts', {
  encoding: 'utf8',
  cwd: join(__dirname, '..'),
});

const lines = old.split('\n');

function findLine(prefix) {
  const idx = lines.findIndex((l) => l.startsWith(prefix));
  if (idx === -1) throw new Error(`Line not found: ${prefix}`);
  return idx;
}

const perfStart = findLine('const performanceCards');
const htmlStart = findLine('const htmlCssCards');
const hooksStart = findLine('const reactHooksCards');
const hooksChapterStart = findLine('const reactHooksChapter');
const hooksChapterEnd = hooksChapterStart + 8; // include closing `};`

const part1 = lines.slice(perfStart, htmlStart).join('\n');
const part2 = lines.slice(hooksStart, hooksChapterEnd).join('\n');
const slice = `${part1}\n${part2}`;

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

const out = `import { Chapter, FlashCard } from '@/types';\n\n${withExports}\n`;
writeFileSync(join(CORE_DIR, 'extra-chapters.ts'), out, 'utf-8');

console.log('extra-chapters.ts written');
console.log('  performance → systemDesign + reactHooks');
console.log('  htmlCss/browser excluded:', !withExports.includes('htmlCss'));
