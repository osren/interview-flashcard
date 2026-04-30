const { readFileSync, readdirSync, existsSync } = require('fs');
const { join, dirname, basename } = require('path');
const { homedir } = require('os');

const DEFAULT_CLAUDE_DIR = join(homedir(), '.claude');

function getClaudeDir() {
  return process.env.CLAUDE_DIR || DEFAULT_CLAUDE_DIR;
}

/**
 * Parse project path to readable name
 */
function parseProjectName(projectPath) {
  const parts = projectPath.split('/');
  return parts[parts.length - 1] || projectPath;
}

/**
 * Parse history.jsonl into session list
 * @returns {Array<import('./types').HistoryEntry>}
 */
function loadHistory() {
  const historyPath = join(getClaudeDir(), 'history.jsonl');
  if (!existsSync(historyPath)) return [];

  const content = readFileSync(historyPath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  const sessionMap = new Map();
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const existing = sessionMap.get(entry.sessionId);
      if (!existing || entry.timestamp > existing.timestamp) {
        sessionMap.set(entry.sessionId, entry);
      }
    } catch {
      // skip invalid
    }
  }

  return Array.from(sessionMap.values())
    .map(e => ({
      ...e,
      projectName: parseProjectName(e.project),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Extract text content from message content field
 */
function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(b => b && (b.type === 'text' || b.type === 'thinking'))
      .map(b => b.text || b.thinking || '')
      .join('\n');
  }
  return '';
}

/**
 * Extract active skill name from system tags in text
 */
function extractCommandName(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/<command-name>([^<]+)<\/command-name>/i);
  return match ? match[1].trim() : null;
}

/**
 * Extract slash command from user message
 */
function extractSlashCommand(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.trim().match(/^\/([a-zA-Z0-9_-]+)(?:\s|$)/);
  return match ? match[1] : null;
}

/**
 * Compute message stats from a raw message array
 * @param {Array} messages
 * @returns {Object}
 */
function computeMessageStats(messages) {
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheCreationTokens = 0;
  let userMessageCount = 0;
  let assistantMessageCount = 0;
  let toolUseCount = 0;
  const toolCalls = {};
  const models = new Set();
  let firstTimestamp = null;
  let lastTimestamp = null;

  for (const msg of messages) {
    const ts = msg.timestamp;
    if (ts) {
      const time = new Date(ts).getTime();
      if (!firstTimestamp || time < firstTimestamp) firstTimestamp = time;
      if (!lastTimestamp || time > lastTimestamp) lastTimestamp = time;
    }

    const msgBody = msg.message || {};
    const content = msgBody.content || msg.content;

    if (msg.type === 'assistant' && msgBody.usage) {
      const usage = msgBody.usage;
      inputTokens += usage.input_tokens || 0;
      outputTokens += usage.output_tokens || 0;
      cacheReadTokens += usage.cache_read_input_tokens || 0;
      cacheCreationTokens += usage.cache_creation_input_tokens || 0;
      if (msgBody.model) models.add(msgBody.model);
      assistantMessageCount++;
    }

    if (msg.type === 'user') {
      userMessageCount++;
    }

    if (msg.type === 'assistant' && Array.isArray(content)) {
      for (const block of content) {
        if (block?.type === 'tool_use') {
          toolUseCount++;
          const toolName = block.name || 'unknown';
          if (!toolCalls[toolName]) {
            toolCalls[toolName] = { name: toolName, callCount: 0, successCount: 0, errorCount: 0 };
          }
          toolCalls[toolName].callCount++;
        }
      }
    }
  }

  let duration = 0;
  if (firstTimestamp && lastTimestamp) {
    duration = lastTimestamp - firstTimestamp;
  }

  return {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheCreationTokens,
    userMessageCount,
    assistantMessageCount,
    toolUseCount,
    toolCalls,
    models: Array.from(models),
    duration,
    messageCount: messages.length,
  };
}

/**
 * Parse a subagent JSONL file
 * @param {string} metaPath
 * @param {string} jsonlPath
 * @returns {import('./types').SubagentStats|null}
 */
function parseSubagentFile(metaPath, jsonlPath) {
  if (!existsSync(jsonlPath)) return null;

  const agentId = basename(jsonlPath, '.jsonl').replace('agent-', '');

  let agentType = 'unknown';
  let description = '';
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      agentType = meta.agentType || 'unknown';
      description = meta.description || '';
    } catch {
      // ignore invalid meta
    }
  }

  const content = readFileSync(jsonlPath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  const messages = [];
  for (const line of lines) {
    try {
      messages.push(JSON.parse(line));
    } catch {
      // skip invalid
    }
  }

  const stats = computeMessageStats(messages);

  return {
    agentId,
    agentType,
    description,
    messageCount: stats.messageCount,
    userMessageCount: stats.userMessageCount,
    assistantMessageCount: stats.assistantMessageCount,
    toolUseCount: stats.toolUseCount,
    inputTokens: stats.inputTokens,
    outputTokens: stats.outputTokens,
    cacheReadTokens: stats.cacheReadTokens,
    cacheCreationTokens: stats.cacheCreationTokens,
    totalTokens: stats.inputTokens + stats.outputTokens + stats.cacheReadTokens + stats.cacheCreationTokens,
    duration: stats.duration,
    toolCalls: stats.toolCalls,
    models: stats.models,
  };
}

/**
 * Parse a single session JSONL file
 * @param {string} filePath
 * @param {import('./types').HistoryEntry} historyEntry
 * @returns {import('./types').SessionStats|null}
 */
function parseSessionFile(filePath, historyEntry) {
  if (!existsSync(filePath)) return null;

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  const messages = [];
  for (const line of lines) {
    try {
      messages.push(JSON.parse(line));
    } catch {
      // skip invalid
    }
  }

  const stats = computeMessageStats(messages);
  const skillCalls = {};

  for (const msg of messages) {
    const content = msg.message?.content || msg.content;

    if (msg.type === 'user') {
      const text = extractText(content);

      const slash = extractSlashCommand(text);
      if (slash) {
        skillCalls[slash] = (skillCalls[slash] || 0) + 1;
      }

      const cmdName = extractCommandName(text);
      if (cmdName && cmdName !== slash) {
        skillCalls[cmdName] = (skillCalls[cmdName] || 0) + 1;
      }
    }

    if (msg.type === 'attachment' && msg.attachment?.type === 'skill_listing') {
      const skillContent = msg.attachment.content || '';
      const skillMatches = skillContent.match(/^- ([a-zA-Z0-9_-]+):/gm);
      if (skillMatches) {
        for (const m of skillMatches) {
          const name = m.slice(2, -1).trim();
          if (!skillCalls[name]) skillCalls[name] = 0;
        }
      }
    }
  }

  // Parse subagents
  const sessionDir = join(dirname(filePath), basename(filePath, '.jsonl'));
  const subagentsDir = join(sessionDir, 'subagents');
  const subagents = [];
  if (existsSync(subagentsDir)) {
    const files = readdirSync(subagentsDir, { withFileTypes: true });
    for (const f of files) {
      if (f.isFile() && f.name.endsWith('.jsonl') && f.name.startsWith('agent-')) {
        const metaPath = join(subagentsDir, f.name.replace('.jsonl', '.meta.json'));
        const jsonlPath = join(subagentsDir, f.name);
        const sa = parseSubagentFile(metaPath, jsonlPath);
        if (sa) subagents.push(sa);
      }
    }
  }

  return {
    sessionId: historyEntry.sessionId,
    display: historyEntry.display,
    project: historyEntry.project,
    projectName: historyEntry.projectName || parseProjectName(historyEntry.project),
    date: new Date(historyEntry.timestamp),
    messageCount: stats.messageCount,
    userMessageCount: stats.userMessageCount,
    assistantMessageCount: stats.assistantMessageCount,
    toolUseCount: stats.toolUseCount,
    inputTokens: stats.inputTokens,
    outputTokens: stats.outputTokens,
    cacheReadTokens: stats.cacheReadTokens,
    cacheCreationTokens: stats.cacheCreationTokens,
    totalTokens: stats.inputTokens + stats.outputTokens + stats.cacheReadTokens + stats.cacheCreationTokens,
    duration: stats.duration,
    skillCalls,
    toolCalls: stats.toolCalls,
    models: stats.models,
    subagentCount: subagents.length,
    subagents,
  };
}

/**
 * Find session file in projects directory
 */
function findSessionFile(sessionId, projectsDir) {
  if (!existsSync(projectsDir)) return null;

  const dirs = readdirSync(projectsDir, { withFileTypes: true });
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const filePath = join(projectsDir, dir.name, `${sessionId}.jsonl`);
      if (existsSync(filePath)) return filePath;
    }
  }
  return null;
}

/**
 * Load all sessions with stats
 * @returns {Array<import('./types').SessionStats>}
 */
function loadAllSessions() {
  const history = loadHistory();
  const projectsDir = join(getClaudeDir(), 'projects');
  const sessions = [];

  for (const entry of history) {
    const filePath = findSessionFile(entry.sessionId, projectsDir);
    if (filePath) {
      const stats = parseSessionFile(filePath, entry);
      if (stats) sessions.push(stats);
    }
  }

  return sessions;
}

/**
 * Group sessions by project
 * @param {Array<import('./types').SessionStats>} sessions
 * @returns {Map<string, Array<import('./types').SessionStats>>}
 */
function groupByProject(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const key = s.project;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return map;
}

module.exports = {
  getClaudeDir,
  loadHistory,
  parseSessionFile,
  parseSubagentFile,
  loadAllSessions,
  groupByProject,
  findSessionFile,
  extractText,
  extractCommandName,
  extractSlashCommand,
};
