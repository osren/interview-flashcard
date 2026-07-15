// triage.js —— 通用编排引擎（领域无关）
//
// 选 prompt → 拼 _base → 调一次 LLM → 兜底。
// 传入 route(由 createRouter 生成)、promptsDir(某 domain 的 prompts 目录)、llm(注入)。

import fs from 'node:fs';
import path from 'node:path';

// 兜底结果：信息不足/异常时保守上报（见 domain 的 _base.md 全局规则1）
function fallback(reason) {
  return { should_report: true, severity: 'P2', error_type: 'unknown', reason, confidence: 0 };
}

// LLM 输出可能裹 ```json``` 或带前后杂字，抽第一段 {...} 再校验
function parseResult(text) {
  const m = text && text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]);
    if (typeof obj.should_report !== 'boolean' || !obj.severity) return null;
    return obj;
  } catch {
    return null;
  }
}

/**
 * @param {object}   opts
 * @param {function} opts.route        url => category key
 * @param {string}   opts.promptsDir   prompts 目录（含 _base.md 与各 <key>.md）
 * @param {function} opts.llm          async ({ system, user }) => string
 */
export function createTriage({ route, promptsDir, llm }) {
  const base = fs.readFileSync(path.join(promptsDir, '_base.md'), 'utf8');
  const cache = new Map();
  const loadPrompt = (key) => {
    if (!cache.has(key)) {
      cache.set(key, fs.readFileSync(path.join(promptsDir, `${key}.md`), 'utf8'));
    }
    return cache.get(key);
  };

  // alarm: { url, env, level, errorCode, errorMsg, count, ... }
  return async function triage(alarm) {
    try {
      const key = route(alarm.url);
      const system = `${base}\n\n---\n\n${loadPrompt(key)}`;
      const user = `待判定告警：\n${JSON.stringify(alarm, null, 2)}`;
      const text = await llm({ system, user }); // 只调一次 LLM
      const result = parseResult(text);
      if (!result) return { ...fallback('LLM 输出无法解析，保守上报'), _category: key };
      return { ...result, _category: key };
    } catch (err) {
      return fallback(`判定异常(${err.message})，保守上报`);
    }
  };
}
