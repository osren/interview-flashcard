// pipeline.js —— 入口无关的处理核
//
// 按 DOMAIN 环境变量加载 domains/<DOMAIN>/{rules.js, prompts/}，用通用引擎拼出
// triage，再包成 handleAlarm。HTTP(server.js) 和 Kafka(consumer.js) 都只调 handleAlarm。
// 换团队 = 换 DOMAIN + 加一个 domain 文件夹，本文件和引擎都不用改。

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRouter } from './router.js';
import { createTriage } from './triage.js';
import { createGatewayLLM } from './llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.env.DOMAIN || 'train';
const domainDir = path.join(__dirname, 'domains', DOMAIN);

// 加载该 domain 的路由表（rules + fallbackKey + 自有前缀）
const { rules, fallbackKey = 'order', ownedPrefixes = [] } = await import(
  pathToFileURL(path.join(domainDir, 'rules.js')).href
);

// 启动时构造一次：注入网关 llm，读 _base.md、建 prompt 缓存
const triage = createTriage({
  route: createRouter(rules, { fallbackKey, ownedPrefixes }),
  promptsDir: path.join(domainDir, 'prompts'),
  llm: createGatewayLLM(),
});

// should_report=true 的去向。接你们的告警通道（IM/电话/工单），按 severity 分级。
async function dispatch(alarm, result) {
  if (!result.should_report) return; // 判为噪音，丢弃
  // TODO: 替换成真实上报
  console.log('[REPORT]', DOMAIN, result.severity, result.error_type, alarm.url, '-', result.reason);
}

// 每条告警的处理：判定 + 派发。缓存/队列等优化后续就加在这里。
export async function handleAlarm(alarm) {
  const result = await triage(alarm); // 每条都走一次 LLM
  await dispatch(alarm, result);
  return result;
}

// 只判定、不派发。给 eval/ 评测用：跑评测集只需要判定结果，绝不能触发真实派发。
export { triage };
