const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const STATS_FILE = path.join(process.env.HOME, '.claude/stats-cache.json');

const htmlPath = path.join(__dirname, 'claude-report.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// 简单的 API 端点
const apiHtml = html.replace(
  "await fetch('file:///Users/didi/.claude/stats-cache.json')",
  "await fetch('/api/stats')"
);

const server = http.createServer((req, res) => {
  if (req.url === '/api/stats') {
    try {
      const data = fs.readFileSync(STATS_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(apiHtml);
  }
});

server.listen(PORT, () => {
  console.log(`Claude Code 报告已启动: http://localhost:${PORT}`);
  console.log('按 Ctrl+C 停止');
});