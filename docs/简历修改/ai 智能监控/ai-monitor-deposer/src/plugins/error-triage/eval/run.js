// eval/run.js —— 批量把评测集喂给真实判定链路，产出模型判定结果
//
// 用法：
//   DOMAIN=train LLM_GATEWAY_ENDPOINT=... LLM_GATEWAY_KEY=... \
//     node src/plugins/error-triage/eval/run.js [dataset] [outputs]
//   dataset 默认 eval/datasets/<DOMAIN>.jsonl
//   outputs 默认 eval/outputs/<DOMAIN>.jsonl
//
// 用的是 pipeline 里的 triage（只判定、不派发）——同一套路由 + prompt + 模型，
// 所以跑出来的判定 = 上线判定。跑完用 score.js 对比 gold。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { triage } from '../pipeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.env.DOMAIN || 'train';
const datasetPath = process.argv[2] || path.join(__dirname, 'datasets', `${DOMAIN}.jsonl`);
const outPath = process.argv[3] || path.join(__dirname, 'outputs', `${DOMAIN}.jsonl`);
const CONCURRENCY = Number(process.env.EVAL_CONCURRENCY || 4); // 别打爆网关

const readJsonl = (p) =>
  fs.readFileSync(p, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean).map(JSON.parse);

const cases = readJsonl(datasetPath);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const out = fs.createWriteStream(outPath);

let done = 0;
async function runOne(c) {
  // 真实链路：route(url) → 拼 _base+分类 prompt → 调模型一次 → 解析/兜底
  const output = await triage(c.alarm);
  out.write(JSON.stringify({ case_id: c.case_id, split: c.split, gold: c.gold, output }) + '\n');
  process.stderr.write(`\r跑判定 ${++done}/${cases.length}`);
}

// 小并发池
const queue = [...cases];
const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length || 1) }, async () => {
  while (queue.length) await runOne(queue.shift());
});
await Promise.all(workers);
out.end();
process.stderr.write(`\n完成 → ${outPath}\n`);
