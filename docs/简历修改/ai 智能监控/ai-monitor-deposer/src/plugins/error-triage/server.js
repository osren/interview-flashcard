// server.js —— HTTP 入口
//
// 路由：
//   POST /triage  —— 生产：判定 + 派发（handleAlarm）
//   POST /judge   —— 只判定、不派发（调优/回放用，不会触发真实告警）
//   POST /eval    —— 批量判定 + 对比 gold 打分（各团队自助调优，无需集成项目代码）
//   GET  /health
//
// 判定/派发逻辑都在 pipeline.js，这里只负责 HTTP 收发。
// 依赖：Node 18+（内置 http，零三方依赖）。运行环境需为 ESM。
// 注：本进程单 DOMAIN（由 DOMAIN 环境变量定）。多团队多租户（按请求 domain 路由到各自
// rules/prompts）属阶段二「中心化」工作——届时按 body.domain 动态加载对应 domain 即可。

import http from 'node:http';
import { handleAlarm, triage } from './pipeline.js';
import { scoreDataset } from './eval/score-lib.js';

const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || 'train';

// 批量判定的并发上限（/eval 用），别打爆网关
const EVAL_CONCURRENCY = Number(process.env.EVAL_CONCURRENCY || 4);
async function judgeAll(cases) {
  const outputs = new Map();
  const queue = [...cases];
  const workers = Array.from({ length: Math.min(EVAL_CONCURRENCY, queue.length || 1) }, async () => {
    while (queue.length) {
      const c = queue.shift();
      outputs.set(c.case_id, await triage(c.alarm)); // 只判定，绝不派发
    }
  });
  await Promise.all(workers);
  return outputs;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', (c) => {
      buf += c;
      if (buf.length > 1e6) { req.destroy(); reject(new Error('payload too large')); }
    });
    req.on('end', () => {
      try { resolve(buf ? JSON.parse(buf) : {}); }
      catch { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200); res.end('ok');
    return;
  }
  if (req.method === 'POST' && req.url === '/triage') {
    try {
      const alarm = await readJson(req);
      // 不校验字段是否齐全：缺字段也交给 triage（_base 全局规则会保守上报）
      const result = await handleAlarm(alarm);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // /judge —— 只判定、不派发。给调优/回放用（跑评测不会触发真实告警）。
  if (req.method === 'POST' && req.url === '/judge') {
    try {
      const { alarm } = await readJson(req);
      const result = await triage(alarm || {});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // /eval —— 批量判定 + 对比 gold 打分，供各团队自助调优（无需集成项目代码）。
  // body: { dataset: [{ case_id, alarm, gold, split }] }；resp: { report: {train,holdout}, outputs }
  if (req.method === 'POST' && req.url === '/eval') {
    try {
      const { dataset = [] } = await readJson(req);
      const outputs = await judgeAll(dataset);
      const report = scoreDataset(dataset, outputs);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ report, outputs: Object.fromEntries(outputs) }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => console.log(`error-triage HTTP listening on :${PORT}`));
