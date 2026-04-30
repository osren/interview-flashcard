---
name: cc-showtime
description: |
  分析本地 Claude Code 历史会话数据并生成交互式可视化报告。
  当用户想要查看 Claude Code 使用统计、Token 消耗分析、项目维度的话费看板、
  工具调用分析、Skill 使用频率、或时间趋势时，使用此 skill。
  也适用于用户说"分析一下我的 Claude 使用情况"、"看看我最近在做什么项目"、
  "Token 用在哪里了"、"生成使用报告"等场景。
  支持多种输出格式：浏览器可视化（默认）、控制台、JSON、HTML、单文件前端。
---

# cc-showtime

分析本地 `~/.claude` 历史会话，按项目聚合统计 Token 消耗、工具调用、Skill 使用等数据，输出可视化报告。

## 触发场景

- 用户询问 Claude Code 使用统计或历史分析
- 用户想看 Token 消耗、项目分布、时间趋势
- 用户说"分析一下我的使用情况"、"最近用了多少 token"
- 用户想导出报告（JSON / HTML / 单文件）

## 用法

```bash
/cc-showtime [选项]
```

## 选项

| 选项 | 说明 |
|------|------|
| `-f, --format <格式>` | `serve`（默认，启动浏览器）、`console`、`json`、`html`、`singlefile` |
| `-o, --output <路径>` | 输出文件路径（json/html/singlefile 时有效） |
| `-p, --project <名称>` | 只分析指定项目（可多次使用） |
| `--since <YYYY-MM-DD>` | 起始日期筛选 |
| `--until <YYYY-MM-DD>` | 结束日期筛选 |
| `--top <N>` | 控制台输出时只显示前 N 个项目 |
| `--trends` | 显示时间趋势和缓存效率分析 |
| `--full-path` | 显示完整项目路径 |
| `install-hooks` | 安装 PreToolUse hook 增强工具统计 |

## 输出格式说明

- **serve（默认）**：启动本地 HTTP 服务器，自动打开浏览器展示交互式报告
- **console**：终端表格输出，适合快速查看
- **json**：结构化数据导出
- **html**：内联所有数据的独立 HTML 文件，可离线查看
- **singlefile**：纯前端壳（单文件 HTML，需配合数据目录或静态服务器）

## 报告内容

- **会话看板**：项目 → 会话 → 详情三级看板，支持搜索过滤
- **项目概览**：各项目的 Token 消耗、会话数、活跃度
- **工具分析**：Read / Edit / Bash / Grep 等工具的调用分布
- **Skill 统计**：各 Skill 的调用次数和 Token 消耗
- **趋势图表**：按天统计 Token 消耗和会话活跃度

## 可用脚本

产物 `scripts/` 目录下的可执行脚本：

| 脚本 | 用途 |
|------|------|
| `cli.js` | 统一入口，解析参数、调用各模块生成报告 |
| `parser.js` | 读取 `~/.claude` 历史会话数据 |
| `analyzer.js` | 按项目聚合统计 Token、工具调用、Skill 使用 |
| `trends.js` | 日/周趋势和缓存效率分析 |
| `reporter.js` | 控制台/JSON/HTML 报告输出 |
| `stats-hook.js` | `PreToolUse` hook，增强工具调用统计精度 |

Claude 通过 `node scripts/cli.js [选项]` 执行分析任务。

## 数据来源

直接读取本地 `~/.claude` 目录：
- `history.jsonl` — 会话索引
- `projects/<项目>/<sessionId>.jsonl` — 会话详情（含 usage token 数据）

## 安装 Hook（可选）

```bash
node scripts/cli.js install-hooks
```

将 `PreToolUse` hook 写入 `~/.claude/settings.json`，增强工具调用统计精度。
