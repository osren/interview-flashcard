// eval/score.js —— CLI：对比模型判定 vs gold，出 markdown 指标报告
//
// 用法：
//   DOMAIN=train node src/plugins/error-triage/eval/score.js [dataset] [outputs] > eval/reports/vN.md
//   dataset 默认 eval/datasets/<DOMAIN>.jsonl（提供 gold）
//   outputs 默认 eval/outputs/<DOMAIN>.jsonl（run.js 产物）
//
// 打分逻辑在 score-lib.js（与服务端 /eval 共用），这里只做文件读取 + 渲染。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreDataset, renderReportMd } from './score-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.env.DOMAIN || 'train';
const datasetPath = process.argv[2] || path.join(__dirname, 'datasets', `${DOMAIN}.jsonl`);
const outputsPath = process.argv[3] || path.join(__dirname, 'outputs', `${DOMAIN}.jsonl`);

const readJsonl = (p) =>
  fs.readFileSync(p, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean).map(JSON.parse);

const cases = readJsonl(datasetPath);
const outputs = new Map(readJsonl(outputsPath).map((o) => [o.case_id, o.output]));
process.stdout.write(renderReportMd(DOMAIN, scoreDataset(cases, outputs)) + '\n');
