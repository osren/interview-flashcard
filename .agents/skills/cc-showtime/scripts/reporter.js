/**
 * Format number with commas
 */
function fmt(n) {
  return n?.toLocaleString?.() ?? String(n);
}

/**
 * Format number compact (1.2K, 3.4M, 5.6B)
 */
function fmtCompact(n) {
  if (n === null || n === undefined) return '0';
  const num = Number(n);
  if (isNaN(num)) return String(n);
  if (num < 1000) return String(num);
  if (num < 1000000) return (num / 1000).toFixed(num < 10000 ? 2 : 1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(num < 10000000 ? 2 : 1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
}

/**
 * Format bytes to human readable
 */
function fmtBytes(b) {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * Format duration
 */
function fmtDuration(ms) {
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Format date
 */
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('zh-CN');
}

/**
 * Print table to console
 */
function printTable(rows, headers) {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i]).length))
  );

  const sep = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';

  console.log(sep);
  console.log(headerRow);
  console.log(sep);
  for (const row of rows) {
    console.log('| ' + row.map((c, i) => String(c).padEnd(colWidths[i])).join(' | ') + ' |');
  }
  console.log(sep);
}

/**
 * Generate console report
 * @param {Array<import('./types').ProjectStats>} projects
 * @param {Object} summary
 * @param {{fullPath?: boolean}} [options]
 */
function consoleReport(projects, summary, options = {}) {
  const { fullPath = false } = options;

  console.log('\n' + '═'.repeat(70));
  console.log('  Claude Code 历史会话分析报告');
  console.log('═'.repeat(70));

  console.log(`\n📊 全局概览`);
  console.log(`  项目数量:     ${fmt(summary.projectCount)}`);
  console.log(`  总会话数:     ${fmt(summary.totalSessions)}`);
  console.log(`  总消息数:     ${fmt(summary.totalMessages)}`);
  console.log(`  总 Token:     ${fmt(summary.totalTokens)}`);
  console.log(`    ├─ Input:   ${fmt(summary.totalInputTokens)}`);
  console.log(`    ├─ Output:  ${fmt(summary.totalOutputTokens)}`);
  console.log(`    ├─ Cache读: ${fmt(summary.totalCacheReadTokens)}`);
  console.log(`    └─ Cache写: ${fmt(summary.totalCacheCreationTokens)}`);
  console.log(`  工具调用:     ${fmt(summary.totalToolCalls)}`);
  console.log(`  Subagent:     ${fmt(summary.totalSubagentCount)}`);

  if (Object.keys(summary.models).length > 0) {
    console.log(`\n🤖 模型使用分布`);
    const modelEntries = Object.entries(summary.models).sort((a, b) => b[1] - a[1]);
    for (const [model, count] of modelEntries) {
      console.log(`  ${model.padEnd(20)} ${fmt(count)} 次`);
    }
  }

  if (summary.topSkills.length > 0) {
    console.log(`\n🔧 热门 Skill (Top ${Math.min(summary.topSkills.length, 10)})`);
    for (const s of summary.topSkills) {
      console.log(`  ${s.name.padEnd(20)} ${fmt(s.callCount)} 次  (${s.projectCount} 个项目)`);
    }
  }

  if (summary.topTools.length > 0) {
    console.log(`\n🛠️  热门工具 (Top ${Math.min(summary.topTools.length, 10)})`);
    for (const t of summary.topTools) {
      console.log(`  ${t.name.padEnd(20)} ${fmt(t.callCount)} 次`);
    }
  }

  if (summary.topSubagentTypes && summary.topSubagentTypes.length > 0) {
    console.log(`\n🤖 热门 Subagent 类型 (Top ${Math.min(summary.topSubagentTypes.length, 10)})`);
    for (const t of summary.topSubagentTypes) {
      console.log(`  ${t.name.padEnd(20)} ${fmt(t.callCount)} 次`);
    }
  }

  console.log(`\n📁 项目详情 (按 Token 消耗排序)`);
  console.log('─'.repeat(70));

  const rows = projects.map(p => [
    fullPath ? p.path.slice(0, 40) : p.name.slice(0, 24),
    fmt(p.sessionCount),
    fmt(p.totalTokens),
    fmt(p.totalInputTokens),
    fmt(p.totalOutputTokens),
    fmt(p.totalToolCalls),
    fmt(p.totalSubagentCount || 0),
    fmtDate(p.lastSessionDate),
  ]);
  printTable(rows, [fullPath ? '项目路径' : '项目名称', '会话', '总Token', 'Input', 'Output', '工具', 'Subagent', '最后活跃']);

  // Per-project detail
  for (const p of projects) {
    const displayName = fullPath ? p.path : p.name;
    console.log(`\n📂 ${displayName}`);
    console.log(`  会话: ${fmt(p.sessionCount)}  消息: ${fmt(p.totalMessages)}  Token: ${fmt(p.totalTokens)}`);

    if (Object.keys(p.skills).length > 0) {
      const skillList = Object.entries(p.skills)
        .sort((a, b) => b[1].callCount - a[1].callCount)
        .slice(0, 5)
        .map(([name, info]) => `${name}(${fmt(info.callCount)})`)
        .join(', ');
      console.log(`  Skills: ${skillList}`);
    }

    if (Object.keys(p.tools).length > 0) {
      const toolList = Object.entries(p.tools)
        .sort((a, b) => b[1].callCount - a[1].callCount)
        .slice(0, 5)
        .map(([name, info]) => `${name}(${fmt(info.callCount)})`)
        .join(', ');
      console.log(`  工具: ${toolList}`);
    }

    if (Object.keys(p.subagentTypes || {}).length > 0) {
      const saList = Object.entries(p.subagentTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name}(${fmt(count)})`)
        .join(', ');
      console.log(`  Subagent: ${saList}`);
    }
  }

  console.log('\n' + '═'.repeat(70));
}

/**
 * Generate JSON report
 */
function jsonReport(projects, summary, sessions = [], daily = []) {
  return JSON.stringify({ summary, projects, sessions, daily }, null, 2);
}

/**
 * Generate HTML report
 * @param {Array} projects
 * @param {Object} summary
 * @param {Array} [sessions]
 * @param {Array} [daily]
 */
function htmlReport(projects, summary, sessions = [], daily = []) {
  const sessionsJson = JSON.stringify(sessions);
  const projectsJson = JSON.stringify(projects);
  const summaryJson = JSON.stringify(summary);
  const dailyJson = JSON.stringify(daily);

  const topTools = Object.entries(summary.topTools || {})
    .sort((a, b) => b[1].callCount - a[1].callCount)
    .slice(0, 15);

  const maxDailyTokens = daily.length > 0 ? Math.max(...daily.map(d => d.totalTokens)) : 0;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Claude Code 历史会话分析</title>
<style>
  :root { --primary: #2563eb; --success: #16a34a; --warning: #d97706; --danger: #dc2626; --bg: #f8fafc; --card: #fff; --text: #1e293b; --muted: #64748b; --border: #e2e8f0; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: var(--bg); color: var(--text); line-height: 1.5; }
  .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  .subtitle { color: var(--muted); margin-bottom: 24px; }

  /* Cards */
  .card { background: var(--card); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid var(--border); }
  .card-title { font-size: 16px; font-weight: 600; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }

  /* Stats grid */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
  .stat-box { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 10px; padding: 16px; text-align: center; }
  .stat-value { font-size: 26px; font-weight: 700; color: var(--primary); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .stat-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* Filters */
  .filters { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
  .filters input, .filters select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: var(--card); }
  .filters input:focus, .filters select:focus { outline: none; border-color: var(--primary); }

  /* Project cards */
  .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .project-card { background: var(--card); border-radius: 10px; padding: 16px; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
  .project-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: var(--primary); }
  .project-card.active { border-color: var(--primary); background: #eff6ff; }
  .project-name { font-weight: 600; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .project-path { font-size: 11px; color: var(--muted); margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .project-stats { display: flex; justify-content: space-between; font-size: 13px; }
  .project-stat { text-align: center; }
  .project-stat-value { font-weight: 700; font-size: 16px; }
  .project-stat-label { font-size: 11px; color: var(--muted); }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: #f8fafc; font-weight: 600; font-size: 12px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.3px; position: sticky; top: 0; }
  tr:hover { background: #f8fafc; }
  .token-bar { height: 6px; border-radius: 3px; background: #e2e8f0; margin-top: 4px; overflow: hidden; }
  .token-bar-fill { height: 100%; border-radius: 3px; background: var(--primary); }

  /* Charts */
  .chart-container { height: 200px; display: flex; align-items: flex-end; gap: 4px; padding: 10px 0; }
  .chart-bar { flex: 1; background: var(--primary); border-radius: 4px 4px 0 0; min-height: 4px; position: relative; opacity: 0.8; transition: opacity 0.2s; }
  .chart-bar:hover { opacity: 1; }
  .chart-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; margin-bottom: 4px; }
  .chart-bar:hover .chart-tooltip { opacity: 1; }
  .chart-labels { display: flex; gap: 4px; font-size: 10px; color: var(--muted); text-align: center; }
  .chart-labels span { flex: 1; }

  /* Tool pills */
  .tool-pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .tool-pill { background: #f1f5f9; border-radius: 16px; padding: 4px 10px; font-size: 12px; display: flex; align-items: center; gap: 4px; }
  .tool-pill-count { font-weight: 600; color: var(--primary); }

  /* Tabs */
  .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .tab { padding: 8px 16px; font-size: 14px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; color: var(--muted); }
  .tab.active { border-bottom-color: var(--primary); color: var(--primary); font-weight: 600; }
  .tab:hover { color: var(--text); }
  .tab-panel { display: none; }
  .tab-panel.active { display: block; }

  /* Expandable rows */
  .expand-btn { cursor: pointer; color: var(--primary); font-size: 12px; user-select: none; }
  .expand-btn:hover { text-decoration: underline; }
  .detail-row { background: #f8fafc; }
  .detail-cell { padding: 12px 16px; }
  .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .detail-item { font-size: 12px; }
  .detail-item-label { color: var(--muted); margin-bottom: 2px; }
  .detail-item-value { font-weight: 500; }

  /* Responsive */
  @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .project-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="container">

<h1>Claude Code 历史会话分析</h1>
<p class="subtitle">共 ${fmt(summary.projectCount)} 个项目 · ${fmt(summary.totalSessions)} 个会话 · ${fmt(summary.totalTokens)} Token</p>

<!-- Stats Overview -->
<div class="card">
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${fmt(summary.totalSessions)}</div>
      <div class="stat-label">总会话</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${fmt(summary.totalTokens)}</div>
      <div class="stat-label">总 Token</div>
      <div class="stat-sub">I:${fmt(summary.totalInputTokens)} O:${fmt(summary.totalOutputTokens)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${fmt(summary.totalCacheReadTokens)}</div>
      <div class="stat-label">Cache 读</div>
      <div class="stat-sub">创建: ${fmt(summary.totalCacheCreationTokens)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${fmt(summary.totalToolCalls)}</div>
      <div class="stat-label">工具调用</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${fmt(summary.totalSubagentCount || 0)}</div>
      <div class="stat-label">Subagent</div>
    </div>
  </div>
</div>

<!-- Tabs -->
<div class="tabs">
  <div class="tab active" onclick="showTab('projects')">项目概览</div>
  <div class="tab" onclick="showTab('sessions')">会话列表</div>
  <div class="tab" onclick="showTab('tools')">工具分析</div>
  <div class="tab" onclick="showTab('trends')">趋势图表</div>
</div>

<!-- Projects Tab -->
<div id="tab-projects" class="tab-panel active">
  <div class="card">
    <div class="card-title">📁 项目列表（点击筛选会话）</div>
    <div class="project-grid" id="projectGrid"></div>
  </div>
</div>

<!-- Sessions Tab -->
<div id="tab-sessions" class="tab-panel">
  <div class="card">
    <div class="card-title">💬 会话列表</div>
    <div class="filters">
      <input type="text" id="sessionFilter" placeholder="搜索会话标题..." oninput="filterSessions()">
      <select id="projectFilter" onchange="filterSessions()">
        <option value="">全部项目</option>
      </select>
      <input type="date" id="dateSince" onchange="filterSessions()">
      <input type="date" id="dateUntil" onchange="filterSessions()">
    </div>
    <div style="overflow-x: auto;">
      <table id="sessionTable">
        <thead>
          <tr>
            <th>会话</th>
            <th>项目</th>
            <th>日期</th>
            <th>Token</th>
            <th>Input</th>
            <th>Output</th>
            <th>工具</th>
            <th>Subagent</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="sessionTableBody"></tbody>
      </table>
    </div>
  </div>
</div>

<!-- Tools Tab -->
<div id="tab-tools" class="tab-panel">
  <div class="card">
    <div class="card-title">🛠️ 热门工具</div>
    <div class="tool-pills" id="toolPills"></div>
  </div>
  <div class="card">
    <div class="card-title">🔧 热门 Skill</div>
    <div class="tool-pills" id="skillPills"></div>
  </div>
</div>

<!-- Trends Tab -->
<div id="tab-trends" class="tab-panel">
  <div class="card">
    <div class="card-title">📈 每日 Token 消耗趋势</div>
    <div class="chart-container" id="dailyChart"></div>
    <div class="chart-labels" id="dailyLabels"></div>
  </div>
</div>

</div>

<script>
const projects = ${projectsJson};
const sessions = ${sessionsJson};
const summary = ${summaryJson};
const daily = ${dailyJson};
let selectedProject = '';

// Tab switching
function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// Render project cards
function renderProjects() {
  const grid = document.getElementById('projectGrid');
  grid.innerHTML = projects.map(p => \`
    <div class="project-card\${selectedProject === p.path ? ' active' : ''}" onclick="selectProject('\${escapeHtml(p.path)}')">
      <div class="project-name" title="\${escapeHtml(p.name)}">\${escapeHtml(p.name)}</div>
      <div class="project-path" title="\${escapeHtml(p.path)}">\${escapeHtml(p.path)}</div>
      <div class="project-stats">
        <div class="project-stat">
          <div class="project-stat-value">\${fmt(p.sessionCount)}</div>
          <div class="project-stat-label">会话</div>
        </div>
        <div class="project-stat">
          <div class="project-stat-value">\${fmt(p.totalTokens)}</div>
          <div class="project-stat-label">Token</div>
        </div>
        <div class="project-stat">
          <div class="project-stat-value">\${fmt(p.totalToolCalls)}</div>
          <div class="project-stat-label">工具</div>
        </div>
      </div>
      <div class="token-bar" style="margin-top: 12px;">
        <div class="token-bar-fill" style="width: \${Math.min(100, p.totalTokens / Math.max(...projects.map(x=>x.totalTokens)) * 100)}%"></div>
      </div>
    </div>
  \`).join('');
}

function selectProject(path) {
  selectedProject = selectedProject === path ? '' : path;
  renderProjects();
  // Also update session filter
  document.getElementById('projectFilter').value = selectedProject;
  filterSessions();
  showTab('sessions');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab:nth-child(2)').classList.add('active');
}

// Populate project filter
function populateProjectFilter() {
  const select = document.getElementById('projectFilter');
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.path;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
}

// Render session table
function renderSessions(filtered) {
  const tbody = document.getElementById('sessionTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px;">无匹配会话</td></tr>';
    return;
  }

  const maxTokens = Math.max(...filtered.map(s => s.totalTokens));

  tbody.innerHTML = filtered.map((s, idx) => {
    const toolNames = Object.entries(s.toolCalls || {}).sort((a,b) => b[1].callCount - a[1].callCount).slice(0, 4);
    const toolTags = toolNames.map(([n, info]) => \`<span class="tool-pill"><span class="tool-pill-count">\${info.callCount}</span> \${escapeHtml(n)}</span>\`).join('');

    const skillNames = Object.entries(s.skillCalls || {}).filter(([k,v]) => v > 0).map(([k]) => escapeHtml(k)).slice(0, 3);
    const skillTags = skillNames.length ? '<div style="margin-top:6px;">' + skillNames.map(s => \`<span class="tool-pill" style="background:#eff6ff;">/\${s}</span>\`).join('') + '</div>' : '';

    return \`
      <tr>
        <td><div style="font-weight:500;">\${escapeHtml(s.display.slice(0, 40))}</div><div style="font-size:11px;color:var(--muted);">\${skillTags}</div></td>
        <td>\${escapeHtml(s.projectName)}</td>
        <td>\${new Date(s.date).toLocaleDateString('zh-CN')}</td>
        <td>
          <div>\${fmt(s.totalTokens)}</div>
          <div class="token-bar"><div class="token-bar-fill" style="width:\${Math.min(100, s.totalTokens / maxTokens * 100)}%"></div></div>
        </td>
        <td>\${fmt(s.inputTokens)}</td>
        <td>\${fmt(s.outputTokens)}</td>
        <td>\${toolTags}</td>
        <td>\${s.subagentCount || 0}</td>
        <td><span class="expand-btn" onclick="toggleDetail(\${idx})">详情</span></td>
      </tr>
      <tr class="detail-row" id="detail-\${idx}" style="display:none;">
        <td colspan="9" class="detail-cell">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-item-label">会话 ID</div>
              <div class="detail-item-value">\${s.sessionId}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">模型</div>
              <div class="detail-item-value">\${(s.models || []).join(', ') || '-'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">消息数</div>
              <div class="detail-item-value">User: \${s.userMessageCount} / AI: \${s.assistantMessageCount} / 工具: \${s.toolUseCount}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">Cache</div>
              <div class="detail-item-value">读: \${fmt(s.cacheReadTokens)} / 写: \${fmt(s.cacheCreationTokens)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">Skill 调用</div>
              <div class="detail-item-value">\${Object.entries(s.skillCalls || {}).filter(([k,v]) => v > 0).map(([k,v]) => k + '(' + v + ')').join(', ') || '-'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">工具调用详情</div>
              <div class="detail-item-value">\${Object.entries(s.toolCalls || {}).sort((a,b) => b[1].callCount - a[1].callCount).map(([k,v]) => k + '(' + v.callCount + ')').join(', ') || '-'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">Subagent</div>
              <div class="detail-item-value">\${(s.subagents || []).map(sa => (sa.agentType || 'unknown') + '(' + fmt(sa.totalTokens) + ' token)').join(', ') || '-'}</div>
            </div>
          </div>
        </td>
      </tr>
    \`;
  }).join('');
}

function toggleDetail(idx) {
  const row = document.getElementById('detail-' + idx);
  row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}

function filterSessions() {
  const text = document.getElementById('sessionFilter').value.toLowerCase();
  const proj = document.getElementById('projectFilter').value;
  const since = document.getElementById('dateSince').value;
  const until = document.getElementById('dateUntil').value;

  let filtered = sessions.filter(s => {
    if (text && !s.display.toLowerCase().includes(text) && !s.projectName.toLowerCase().includes(text)) return false;
    if (proj && s.project !== proj) return false;
    const d = new Date(s.date).toISOString().slice(0, 10);
    if (since && d < since) return false;
    if (until && d > until) return false;
    return true;
  });

  renderSessions(filtered);
}

// Render tool pills
function renderTools() {
  const toolPills = document.getElementById('toolPills');
  const allTools = {};
  sessions.forEach(s => {
    Object.entries(s.toolCalls || {}).forEach(([name, info]) => {
      allTools[name] = (allTools[name] || 0) + info.callCount;
    });
  });
  const sorted = Object.entries(allTools).sort((a, b) => b[1] - a[1]).slice(0, 20);
  toolPills.innerHTML = sorted.map(([name, count]) =>
    \`<span class="tool-pill"><span class="tool-pill-count">\${fmt(count)}</span> \${escapeHtml(name)}</span>\`
  ).join('');
}

function renderSkills() {
  const skillPills = document.getElementById('skillPills');
  const allSkills = {};
  sessions.forEach(s => {
    Object.entries(s.skillCalls || {}).forEach(([name, count]) => {
      if (count > 0) allSkills[name] = (allSkills[name] || 0) + count;
    });
  });
  const sorted = Object.entries(allSkills).sort((a, b) => b[1] - a[1]).slice(0, 20);
  skillPills.innerHTML = sorted.map(([name, count]) =>
    \`<span class="tool-pill" style="background:#eff6ff;"><span class="tool-pill-count">\${fmt(count)}</span> \${escapeHtml(name)}</span>\`
  ).join('');
}

// Render daily chart
function renderDailyChart() {
  if (!daily || daily.length === 0) {
    document.getElementById('dailyChart').innerHTML = '<div style="text-align:center;color:var(--muted);padding:60px;">暂无趋势数据</div>';
    return;
  }
  const recent = daily.slice(-30);
  const maxTokens = Math.max(...recent.map(d => d.totalTokens));
  const chart = document.getElementById('dailyChart');
  const labels = document.getElementById('dailyLabels');

  chart.innerHTML = recent.map(d => {
    const h = maxTokens > 0 ? (d.totalTokens / maxTokens * 180) : 0;
    return \`
      <div class="chart-bar" style="height:\${Math.max(4, h)}px;">
        <div class="chart-tooltip">\${d.date}<br>Token: \${fmt(d.totalTokens)}<br>会话: \${d.sessions}</div>
      </div>
    \`;
  }).join('');

  labels.innerHTML = recent.map((d, i) =>
    i % 5 === 0 || i === recent.length - 1 ? \`<span>\${d.date.slice(5)}</span>\` : '<span></span>'
  ).join('');
}

// Helpers
function fmt(n) { return n?.toLocaleString?.() ?? String(n); }
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Init
renderProjects();
populateProjectFilter();
filterSessions();
renderTools();
renderSkills();
renderDailyChart();
</script>

</body>
</html>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate trends console report
 * @param {Array} daily
 * @param {Array} weekly
 * @param {Object} cache
 */
function consoleTrends(daily, weekly, cache) {
  console.log('\n' + '═'.repeat(70));
  console.log('  Claude Code 趋势分析');
  console.log('═'.repeat(70));

  // Cache efficiency
  console.log(`\n💾 缓存效率分析`);
  console.log(`  Cache 读取 Token:  ${fmt(cache.totalCacheReadTokens)}`);
  console.log(`  Cache 创建 Token:  ${fmt(cache.totalCacheCreationTokens)}`);
  console.log(`  Cache 命中率:      ${(cache.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`  Cache 写入比例:    ${(cache.cacheWriteRatio * 100).toFixed(1)}%`);

  // Daily trends (last 14 days)
  console.log(`\n📅 每日趋势 (最近 14 天)`);
  const recentDaily = daily.slice(-14);
  const dailyRows = recentDaily.map(d => [
    d.date,
    fmt(d.sessions),
    fmt(d.totalTokens),
    fmt(d.inputTokens),
    fmt(d.outputTokens),
    fmt(d.toolCalls),
  ]);
  printTable(dailyRows, ['日期', '会话', '总Token', 'Input', 'Output', '工具']);

  // Weekly trends
  console.log(`\n📆 每周趋势`);
  const weeklyRows = weekly.slice(-8).map(w => [
    w.week,
    fmt(w.sessions),
    fmt(w.totalTokens),
    fmt(w.inputTokens),
    fmt(w.outputTokens),
    fmt(w.toolCalls),
  ]);
  printTable(weeklyRows, ['周', '会话', '总Token', 'Input', 'Output', '工具']);

  console.log('\n' + '═'.repeat(70));
}

module.exports = { consoleReport, jsonReport, htmlReport, consoleTrends };
