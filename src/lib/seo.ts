import { coreChapters } from '@/data/core';
import { projectChapters } from '@/data/projects';

/**
 * 站点 SEO 常量与路由元信息。
 *
 * SITE_URL 为线上部署域名（含协议，结尾不带斜杠）；若后续更换自定义域名，
 * 需同步更新 public/robots.txt 与 public/sitemap.xml 中的域名。
 */
export const SITE_URL = 'https://interview-flashcard-alpha.vercel.app';
export const SITE_NAME = 'InterviewFlash';
export const SITE_LOCALE = 'zh-CN';

export const DEFAULT_DESCRIPTION =
  'InterviewFlash 是面向前端 / AI 方向求职者的面试备考工具：核心考点闪卡、项目复盘、MPX 专项、LLM 手册与 AI 面经，助你系统备战秋招。';

export const DEFAULT_KEYWORDS =
  '前端面试,AI 应用面试,秋招,面试闪卡,JavaScript,React,Vue,TypeScript,浏览器原理,项目复盘,MPX,LLM,RAG,Agent';

export interface SeoMeta {
  title: string;
  description: string;
  noindex: boolean;
}

const TITLE_SUFFIX = 'InterviewFlash';

function withSuffix(title: string): string {
  return title === SITE_NAME ? SITE_NAME : `${title} · ${TITLE_SUFFIX}`;
}

/** 工具页 / 本地态 / 对话态 / 演示页路径前缀：统一 noindex，不作为公开落地页收录。 */
const NOINDEX_PREFIXES = [
  '/custom',
  '/favorites',
  '/planner',
  '/resume',
  '/interview',
  '/campus',
  '/ai',
  '/rjsf',
  '/preview',
];

/** 公开静态路由的标题与摘要。 */
const PUBLIC_ROUTES: Record<string, { title: string; description: string }> = {
  '/': { title: '前端 / AI 方向面试备考', description: DEFAULT_DESCRIPTION },
  '/intro': { title: '使用指南', description: '十分钟了解 InterviewFlash 的模块、面经导入方式与备考流程。' },
  '/core': {
    title: '前端基础核心考点',
    description: 'JavaScript / HTML / CSS / Vue / React / TypeScript / 浏览器等核心面试考点闪卡。',
  },
  '/projects': {
    title: '项目复盘',
    description: '实习与自研项目的架构、难点、性能优化与面试问答复盘。',
  },
  '/mpx': {
    title: 'MPX 专项',
    description: '滴滴小程序框架 MPX 的语法、系统架构与工程化学习资料。',
  },
  '/llm-handbook': {
    title: 'LLM 手册',
    description: 'RAG、Agent、主流框架与 AI 工程化入门及实战项目资料。',
  },
};

interface ChapterLike {
  id: string;
  title: string;
  description?: string;
}

/**
 * MPX 章节元数据内联在此，避免从 @/data/mpx/mpx 静态引入全量卡片数据，
 * 导致主包体积回退；新增 MPX 章节时需同步维护这份映射。
 */
const MPX_CHAPTERS: ChapterLike[] = [
  { id: 'mpx-guide', title: 'MPX 入门语法', description: 'MPX 入门语法大全，包含模板、样式、脚本、组件等核心语法' },
  { id: 'mpx-architecture', title: 'MPX 系统架构', description: 'MPX 系统架构拆解，宏观层面设计解析' },
  { id: 'dev-guide', title: 'MPX 开发指南', description: 'fe-esflight 开发流程指南，适用于新入职前端实习生' },
  { id: 'mpx-basic', title: 'MPX 基础语法', description: 'MPX 框架核心语法闪卡，涵盖模板、响应式、组件、生命周期、插槽' },
];

function findChapter(chapters: ChapterLike[], id: string): ChapterLike | undefined {
  return chapters.find((chapter) => chapter.id === id);
}

function resolveChapterMeta(
  chapters: ChapterLike[],
  id: string
): Pick<SeoMeta, 'title' | 'description'> | null {
  const chapter = findChapter(chapters, id);
  if (!chapter) return null;
  return {
    title: withSuffix(chapter.title),
    description: chapter.description ?? DEFAULT_DESCRIPTION,
  };
}

/** 根据当前路径解析页面级 SEO 元信息。 */
export function resolveSeo(pathname: string): SeoMeta {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (NOINDEX_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`))) {
    return { title: withSuffix('工具页'), description: DEFAULT_DESCRIPTION, noindex: true };
  }

  const coreMatch = clean.match(/^\/core\/([^/]+)/);
  if (coreMatch) {
    const meta = resolveChapterMeta(coreChapters, coreMatch[1]);
    if (meta) return { ...meta, noindex: false };
  }

  const projectMatch = clean.match(/^\/projects\/([^/]+)/);
  if (projectMatch) {
    const meta = resolveChapterMeta(projectChapters, projectMatch[1]);
    if (meta) return { ...meta, noindex: false };
  }

  const mpxMatch = clean.match(/^\/mpx\/([^/]+)/);
  if (mpxMatch) {
    const meta = resolveChapterMeta(MPX_CHAPTERS, mpxMatch[1]);
    if (meta) return { ...meta, noindex: false };
  }

  const fixed = PUBLIC_ROUTES[clean];
  if (fixed) {
    return { title: withSuffix(fixed.title), description: fixed.description, noindex: false };
  }

  // 404 / 未知路径：noindex，避免软 404 页面被收录。
  return { title: withSuffix('页面不存在'), description: DEFAULT_DESCRIPTION, noindex: true };
}

/** 拼接站点绝对 URL。 */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
