#!/usr/bin/env node
const { loadAllSessions, findSessionFile, getClaudeDir } = require('./parser');
const { analyzeProjects, computeGlobalSummary } = require('./analyzer');
const { consoleReport, jsonReport, htmlReport, consoleTrends } = require('./reporter');
const { analyzeDailyTrends, analyzeWeeklyTrends, analyzeCacheEfficiency } = require('./trends');
const { writeFileSync, readFileSync, existsSync, mkdirSync, cpSync, rmSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');
const { createServer } = require('http');
const os = require('os');

function showHelp() {
  console.log(`
Claude Code 历史会话分析工具

用法:
  cc-showtime [选项]
  cc-showtime install-hooks

子命令:
  install-hooks    安装 PreToolUse hook 到 ~/.claude/settings.json

选项:
  --format, -f    输出格式: serve | console | json | html | singlefile (默认: serve)
  --output, -o    输出文件路径 (json/html/singlefile 格式时有效)
  --project, -p   只分析指定项目 (可多次使用)
  --full-path     显示完整项目路径 (默认只显示目录名)
  --trends        显示时间趋势和缓存效率分析
  --since         起始日期 (YYYY-MM-DD)
  --until         结束日期 (YYYY-MM-DD)
  --top           显示前 N 个项目 (默认: 全部)
  --help, -h      显示帮助

环境变量:
  CLAUDE_DIR      Claude Code 数据目录 (默认: ~/.claude)

示例:
  cc-showtime                          # 默认：分析数据并打开浏览器
  cc-showtime install-hooks            # 安装 hooks
  cc-showtime -f console               # 控制台输出统计
  cc-showtime -f json -o report.json   # 导出 JSON 报告
  cc-showtime -f singlefile -o report.html  # 导出单文件 HTML
`);
}

function parseArgs(argv) {
  const args = { format: 'serve', projects: [], top: Infinity, fullPath: false, trends: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--format':
      case '-f':
        args.format = argv[++i];
        break;
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      case '--project':
      case '-p':
        args.projects.push(argv[++i]);
        break;
      case '--full-path':
        args.fullPath = true;
        break;
      case '--trends':
        args.trends = true;
        break;
      case '--since':
        args.since = new Date(argv[++i]).getTime();
        break;
      case '--until':
        args.until = new Date(argv[++i]).getTime();
        break;
      case '--top':
        args.top = parseInt(argv[++i], 10);
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`未知选项: ${arg}`);
          process.exit(1);
        }
    }
  }
  return args;
}

function formatSessionText(filePath) {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  const out = [];

  for (const line of lines) {
    try {
      const msg = JSON.parse(line);
      const ts = msg.timestamp ? new Date(msg.timestamp).toISOString().replace('T', ' ').slice(0, 19) : '';
      const type = msg.type || 'unknown';
      const body = msg.message || {};
      const rawContent = body.content || msg.content;

      if (type === 'user') {
        out.push(`--- USER ${ts} ---`);
        if (Array.isArray(rawContent)) {
          for (const block of rawContent) {
            if (block.type === 'text' && block.text) {
              out.push(block.text);
            } else if (block.type === 'tool_result') {
              out.push('--- TOOL_RESULT ---');
              out.push(`is_error=${block.is_error || false}`);
              if (block.content) {
                const text = typeof block.content === 'string' ? block.content : JSON.stringify(block.content, null, 2);
                out.push(text.slice(0, 3000));
              }
            }
            out.push('');
          }
        } else if (typeof rawContent === 'string' && rawContent) {
          out.push(rawContent);
        }
      } else if (type === 'assistant') {
        out.push(`--- ASSISTANT ${ts} ---`);
        if (Array.isArray(rawContent)) {
          for (const block of rawContent) {
            if (block.type === 'text' && block.text) {
              out.push(block.text);
            } else if (block.type === 'tool_use') {
              out.push('--- TOOL_USE ---');
              out.push(`Name: ${block.name}`);
              if (block.name === 'Agent' && block.input?.subagent_type) {
                out.push(`[Subagent: ${block.input.subagent_type}]`);
              }
              out.push(JSON.stringify(block.input || {}, null, 2));
            } else if (block.type === 'thinking' && block.thinking) {
              out.push('--- THINKING ---');
              out.push(block.thinking);
            }
            out.push('');
          }
        } else if (typeof rawContent === 'string' && rawContent) {
          out.push(rawContent);
        }
      } else {
        out.push(`--- ${type.toUpperCase()} ${ts} ---`);
        if (typeof rawContent === 'string' && rawContent) {
          out.push(rawContent);
        }
      }
      out.push('');
    } catch {
      // skip invalid lines
    }
  }

  return out.join('\n');
}

function installHooks() {
  const hookPath = join(__dirname, 'stats-hook.js');
  if (!existsSync(hookPath)) {
    console.error('Hook 脚本未找到:', hookPath);
    console.error('请确保 cc-showtime 目录包含 hooks/stats-hook.js');
    process.exit(1);
  }

  const settingsDir = join(os.homedir(), '.claude');
  const settingsPath = join(settingsDir, 'settings.json');
  let settings = {};

  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch (e) {
      console.error('读取 settings.json 失败:', e.message);
      process.exit(1);
    }
  }

  settings.hooks = settings.hooks || {};
  settings.hooks.PreToolUse = settings.hooks.PreToolUse || [];

  const hookCommand = `node ${hookPath}`;
  const alreadyInstalled = settings.hooks.PreToolUse.some(entry =>
    entry.hooks?.some(h => h.type === 'command' && h.command === hookCommand)
  );

  if (alreadyInstalled) {
    console.log('Hook 已安装，无需重复操作');
    console.log('配置位置:', settingsPath);
    return;
  }

  settings.hooks.PreToolUse.push({
    matcher: '.*',
    hooks: [{ type: 'command', command: hookCommand }],
  });

  mkdirSync(settingsDir, { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
  console.log('Hook 安装成功:', settingsPath);
  console.log('  命令:', hookCommand);
}

function startServer(sessions, projects, summary, daily) {
  const distDir = join(__dirname, '..', 'assets');
  if (!existsSync(distDir)) {
    console.error('前端构建产物未找到。请先运行: cd web && npm install && npm run build');
    process.exit(1);
  }

  const tmpDir = join(os.tmpdir(), `cc-showtime-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  cpSync(distDir, tmpDir, { recursive: true });

  const dataDir = join(tmpDir, 'data');
  const sessionsDir = join(dataDir, 'sessions');
  const subagentsDir = join(sessionsDir, 'subagents');
  mkdirSync(subagentsDir, { recursive: true });

  const projectsDir = join(getClaudeDir(), 'projects');
  let exportedCount = 0;
  let exportedSubagentCount = 0;
  for (const s of sessions) {
    const filePath = findSessionFile(s.sessionId, projectsDir);
    if (!filePath) continue;
    const text = formatSessionText(filePath);
    if (text) {
      writeFileSync(join(sessionsDir, `${s.sessionId}.txt`), text, 'utf-8');
      exportedCount++;
    }

    // Export subagent history
    if (s.subagents && s.subagents.length > 0) {
      const sessionDir = join(require('path').dirname(filePath), require('path').basename(filePath, '.jsonl'));
      for (const sa of s.subagents) {
        const saPath = join(sessionDir, 'subagents', `agent-${sa.agentId}.jsonl`);
        if (existsSync(saPath)) {
          const saText = formatSessionText(saPath);
          if (saText) {
            writeFileSync(join(subagentsDir, `${sa.agentId}.txt`), saText, 'utf-8');
            exportedSubagentCount++;
          }
        }
      }
    }
  }

  const payload = JSON.stringify({ summary, projects, sessions, daily }, null, 2);
  writeFileSync(join(dataDir, 'report.json'), payload, 'utf-8');

  const server = createServer((req, res) => {
    const urlPath = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '');
    let filePath = join(tmpDir, urlPath);
    if (!filePath.startsWith(tmpDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    if (!existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const stat = require('fs').statSync(filePath);
    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    const ext = require('path').extname(filePath);
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.txt': 'text/plain',
    };
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.end(readFileSync(filePath));
  });

  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    const url = `http://127.0.0.1:${port}/`;
    console.log(`\n报告服务器已启动: ${url}`);
    console.log(`会话记录: ${exportedCount} / ${sessions.length}`);
    console.log('按 Ctrl+C 停止服务器');

    const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    try {
      execSync(`${openCmd} ${url}`);
    } catch {
      console.log('请手动打开浏览器访问上述地址');
    }
  });

  process.on('SIGINT', () => {
    console.log('\n正在清理...');
    server.close();
    try { rmSync(tmpDir, { recursive: true }); } catch {}
    process.exit(0);
  });
}

function main() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs[0] === 'install-hooks') {
    installHooks();
    return;
  }

  const args = parseArgs(process.argv);

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log('正在加载历史会话数据...');

  let sessions = loadAllSessions();

  if (sessions.length === 0) {
    console.log('未找到历史会话数据。请检查 CLAUDE_DIR 环境变量或 ~/.claude 目录。');
    process.exit(1);
  }

  if (args.projects.length > 0) {
    sessions = sessions.filter(s =>
      args.projects.some(p => s.project.includes(p) || s.projectName.includes(p))
    );
  }
  if (args.since) {
    sessions = sessions.filter(s => s.date.getTime() >= args.since);
  }
  if (args.until) {
    sessions = sessions.filter(s => s.date.getTime() <= args.until);
  }

  if (sessions.length === 0) {
    console.log('筛选条件未匹配到任何会话。');
    process.exit(0);
  }

  console.log(`已加载 ${sessions.length} 个会话，正在分析...`);

  let projects = analyzeProjects(sessions);

  if (args.top < Infinity) {
    projects = projects.slice(0, args.top);
  }

  const summary = computeGlobalSummary(projects);

  if (args.trends) {
    const daily = analyzeDailyTrends(sessions);
    const weekly = analyzeWeeklyTrends(sessions);
    const cache = analyzeCacheEfficiency(projects);
    consoleTrends(daily, weekly, cache);
    return;
  }

  const daily = analyzeDailyTrends(sessions);

  switch (args.format) {
    case 'serve':
    case 'vue':
      startServer(sessions, projects, summary, daily);
      break;
    case 'json': {
      const json = jsonReport(projects, summary, sessions, daily);
      if (args.output) {
        writeFileSync(args.output, json, 'utf-8');
        console.log(`JSON 报告已保存: ${args.output}`);
      } else {
        console.log(json);
      }
      break;
    }
    case 'html': {
      const html = htmlReport(projects, summary, sessions, daily);
      const outPath = args.output || join(process.cwd(), 'cc-showtime-report.html');
      writeFileSync(outPath, html, 'utf-8');
      console.log(`HTML 报告已保存: ${outPath}`);
      break;
    }
    case 'singlefile': {
      const webDir = join(__dirname, '..', 'assets');
      const distPath = join(webDir, 'index.html');
      // 构建产物中已包含前端文件，无需重新构建
      if (!existsSync(distPath)) {
        console.error('前端构建产物未找到:', distPath);
        process.exit(1);
      }
      if (!existsSync(distPath)) {
        console.error('构建产物未找到:', distPath);
        process.exit(1);
      }
      const outPath = args.output || join(process.cwd(), 'cc-showtime.html');
      const html = readFileSync(distPath, 'utf-8');
      writeFileSync(outPath, html, 'utf-8');
      const sizeKB = (readFileSync(outPath).length / 1024).toFixed(1);
      console.log(`\n单文件前端已生成: ${outPath}`);
      console.log(`文件大小: ${sizeKB} KB`);
      break;
    }
    case 'console':
    default:
      consoleReport(projects, summary, { fullPath: args.fullPath });
      break;
  }
}

main();
