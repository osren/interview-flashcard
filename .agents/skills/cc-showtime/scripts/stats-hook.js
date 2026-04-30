#!/usr/bin/env node
/**
 * Claude Code Hook — 记录 skill 激活和工具调用统计
 *
 * 安装方式：将此脚本路径加入 ~/.claude/settings.json 的 hooks 配置
 * {
 *   "hooks": {
 *     "PreToolUse": [{ "type": "command", "command": "node /path/to/stats-hook.js" }]
 *   }
 * }
 *
 * 或者作为 PostToolUse hook 使用，记录工具执行结果。
 */
const { appendFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const STATS_DIR = join(homedir(), '.claude', 'cc-showtime');
const STATS_FILE = join(STATS_DIR, 'hook-stats.jsonl');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve({}); }
    });
    // Fallback if stdin is empty
    setTimeout(() => resolve({}), 100);
  });
}

async function main() {
  const payload = await readStdin();
  const toolName = payload?.toolName || payload?.tool?.name || 'unknown';
  const toolInput = payload?.toolInput || payload?.tool?.input || {};
  const sessionId = payload?.sessionId || 'unknown';
  const projectPath = payload?.projectPath || payload?.cwd || process.cwd();

  // Extract skill name from system context if available
  let skillName = null;
  const sysText = payload?.systemText || '';
  const match = sysText.match(/<command-name>([^<]+)<\/command-name>/i);
  if (match) skillName = match[1].trim();

  const record = {
    timestamp: new Date().toISOString(),
    type: 'tool_use',
    sessionId,
    projectPath,
    toolName,
    toolInputSummary: typeof toolInput === 'object'
      ? Object.keys(toolInput).slice(0, 5)
      : [],
    skillName,
    hookEvent: payload?.hookEvent || 'PreToolUse',
  };

  ensureDir(STATS_DIR);
  appendFileSync(STATS_FILE, JSON.stringify(record) + '\n', 'utf-8');

  // Hook must output valid JSON to stdout for Claude Code
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: payload?.hookEvent || 'PreToolUse',
      permissionDecision: 'allow',
      permissionDecisionReason: 'cc-showtime stats hook',
    }
  }));
}

main().catch(() => {
  // Fail open — don't block tool execution
  console.log(JSON.stringify({ hookSpecificOutput: { permissionDecision: 'allow' } }));
});
