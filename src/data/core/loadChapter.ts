import type { FlashCard } from '@/types';

type ChapterLoader = () => Promise<FlashCard[]>;

const chapterLoaders: Record<string, ChapterLoader> = {
  javascript: () => import('./javascript').then((m) => m.javascriptCards),
  html: () => import('./html').then((m) => m.htmlCards),
  css: () => import('./css').then((m) => m.cssCards),
  vue: () => import('./vue').then((m) => m.vueCards),
  nextjs: () => import('./nextjs').then((m) => m.nextjsCards),
  react: () => import('./react').then((m) => m.reactCards),
  typescript: () => import('./typescript').then((m) => m.typescriptCards),
  'browser-features': () => import('./browser-features').then((m) => m.browserfeaturesCards),
  'browser-security': () => import('./browser-security').then((m) => m.browsersecurityCards),
  webpack: () => import('./webpack').then((m) => m.webpackCards),
  'react-hooks': () => import('./extra-chapters').then((m) => m.reactHooksCards),
  engineering: () => import('./extra-chapters').then((m) => m.engineeringCards),
  performance: () => import('./extra-chapters').then((m) => m.performanceCards),
  'ai-engineering': () => import('./extra-chapters').then((m) => m.aiEngineeringCards),
  'system-design': () => import('./extra-chapters').then((m) => m.systemDesignCards),
};

const cache = new Map<string, FlashCard[]>();
const inflight = new Map<string, Promise<FlashCard[]>>();

export async function loadCoreChapterCards(chapterId: string): Promise<FlashCard[]> {
  const cached = cache.get(chapterId);
  if (cached) return cached;

  const existing = inflight.get(chapterId);
  if (existing) return existing;

  const loader = chapterLoaders[chapterId];
  if (!loader) return [];

  const promise = loader().then((cards) => {
    cache.set(chapterId, cards);
    inflight.delete(chapterId);
    return cards;
  });
  inflight.set(chapterId, promise);
  return promise;
}

export async function loadAllCoreCards(): Promise<FlashCard[]> {
  const ids = Object.keys(chapterLoaders);
  const groups = await Promise.all(ids.map((id) => loadCoreChapterCards(id)));
  return groups.flat();
}

export function getCoreChapterLoaderIds(): string[] {
  return Object.keys(chapterLoaders);
}
