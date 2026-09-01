/**
 * 爬取播面前端分类下的题目与图解 URL
 * 用法: node scripts/scrape-bomian-frontend.mjs
 *
 * 比浏览器 DOM 脚本更稳定：直接调用播面公开 API
 * - GET /api/categories/sub-categories?parentId=33
 * - GET /api/categories/with-questions?categoryId={id}&page={n}&pageSize=50&sortBy=default
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.bomianfm.com';
const FRONTEND_PARENT_ID = 33;
const PAGE_SIZE = 50;
const SORT_BY = 'default';

/** 指定分类（留空则爬取 parentId=33 下全部子分类） */
const TARGET_TABS = [
  'HTML',
  'CSS',
  'JavaScript',
  'Vue',
  'Next.js',
  'React',
  'TypeScript',
  'Webpack',
  '浏览器特性',
  '浏览器安全',
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../docs/scrape');
const OUT_FILE = join(OUT_DIR, 'bomian-frontend-questions.json');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`API ${json.code}: ${json.message} — ${url}`);
  return json.data;
}

async function fetchSubCategories() {
  const data = await fetchJson(`${BASE}/api/categories/sub-categories?parentId=${FRONTEND_PARENT_ID}`);
  return data;
}

async function fetchQuestionsPage(categoryId, page) {
  const url = `${BASE}/api/categories/with-questions?categoryId=${categoryId}&page=${page}&pageSize=${PAGE_SIZE}&sortBy=${SORT_BY}`;
  const data = await fetchJson(url);
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

async function fetchAllQuestions(categoryId, categoryName) {
  const all = [];
  let page = 1;

  while (true) {
    const chunk = await fetchQuestionsPage(categoryId, page);
    if (!chunk?.questions?.length) break;

    for (const q of chunk.questions) {
      all.push({
        id: q.id,
        title: q.title,
        imageUrl: q.imageUrl ?? null,
        categoryId: q.categoryId,
        categoryName,
      });
    }

    if (chunk.questions.length < PAGE_SIZE) break;
    page += 1;
    await sleep(300);
  }

  return all;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Fetching sub-categories...');
  const subs = await fetchSubCategories();

  const filtered = TARGET_TABS.length
    ? subs.filter((s) => TARGET_TABS.includes(s.name))
    : subs;

  console.log(`Will scrape ${filtered.length} categories: ${filtered.map((s) => s.name).join(', ')}`);

  const allData = [];
  let totalQuestions = 0;
  let withImage = 0;

  for (const sub of filtered) {
    console.log(`\n[${sub.name}] id=${sub.id}`);
    const questions = await fetchAllQuestions(sub.id, sub.name);
    const imgCount = questions.filter((q) => q.imageUrl).length;
    totalQuestions += questions.length;
    withImage += imgCount;
    console.log(`  → ${questions.length} questions, ${imgCount} with image`);

    allData.push({
      tab: sub.name,
      categoryId: sub.id,
      questions,
    });

    await sleep(400);
  }

  const result = {
    scrapedAt: new Date().toISOString(),
    source: `${BASE}/web/category/前端`,
    parentCategoryId: FRONTEND_PARENT_ID,
    totalCategories: allData.length,
    totalQuestions,
    withImage,
    data: allData,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), 'utf-8');

  console.log('\n===== 完成 =====');
  console.log(`总计: ${totalQuestions} 题, ${withImage} 题有图解`);
  console.log(`输出: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
