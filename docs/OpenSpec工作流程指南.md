# OpenSpec 工作流程指南

## 概述

OpenSpec 是一个需求变更管理工具，用于管理需求文档（PRD）、需求变更记录、代码改动说明。它通过 `/opsx:` 系列命令提供提案创建、任务实施、归档等能力。

## 完整开发链路

### 1. 提案阶段 (Propose)

使用 `/opsx:propose` 命令启动新提案，描述你想要构建的功能或修改。

### 2. 设计阶段 (Explore)

在设计阶段，AI 会：
- 分析需求背景
- 评估多种实现方案
- 做出技术决策
- 识别风险和权衡
- 制定实施计划

### 3. 实施阶段 (Apply)

使用 `/opsx:apply` 命令开始实施任务，按照 tasks.md 中的清单逐步完成。

### 4. 归档阶段 (Archive)

使用 `/opsx:archive` 命令完成归档，记录变更历史。

---

## 提案文件结构

每个提案位于 `openspec/changes/{change-name}/` 目录下，包含以下文件：

### 文件清单

```
openspec/
├── config.yaml                    # 全局配置
└── changes/
    └── {change-name}/
        ├── .openspec.yaml         # 提案元数据
        ├── proposal.md            # 提案文档
        ├── design.md             # 设计文档
        ├── specs/
        │   └── {feature-name}/
        │       └── spec.md        # 详细规范
        └── tasks.md               # 任务清单
```

---

## 各文件详细说明

### 1. .openspec.yaml

**作用**: 提案元数据文件

**内容示例**:
```yaml
schema: spec-driven
created: 2026-04-14
```

**字段说明**:
- `schema`: 固定值 `spec-driven`
- `created`: 创建日期

---

### 2. proposal.md

**作用**: 提案概述文档，用于快速了解变更内容

**内容结构**:

| 章节 | 说明 |
|-----|------|
| Why | 问题背景和原因 |
| What Changes | 具体变更内容 |
| Capabilities | 新增/修改的能力 |
| Impact | 影响范围（修改的文件、配置变更） |

**示例**:

```markdown
## Why

当前AI资讯模块缺少对GitHub热门项目的实时追踪...

## What Changes

1. 新增GitHub Trending模块...
2. 定时抓取数据...

## Capabilities

### New Capabilities
- `github-trending`: GitHub Trending热门项目展示模块

### Modified Capabilities
- 无

## Impact

- 新增数据源：`src/data/ai/github-trending.ts`
- 新增页面：`src/pages/AI/GithubTrending.tsx`
...
```

---

### 3. design.md

**作用**: 详细设计文档，包含技术决策和方案评估

**内容结构**:

| 章节 | 说明 |
|-----|------|
| Context | 项目背景和上下文 |
| Goals | 要达成的目标 |
| Non-Goals | 不做的事情（明确边界） |
| Decisions | 技术决策及方案对比 |
| Risks | 潜在风险 |
| Trade-offs | 权衡取舍 |
| Migration Plan | 实施计划 |
| Open Questions | 待定问题 |

**示例 - Decisions 章节**:

```markdown
### D1: 数据获取方案

**选择：** 使用第三方API或RSS抓取

**备选方案：**
| 方案 | 优点 | 缺点 |
|-----|-----|-----|
| 第三方API | 开箱即用 | 依赖外部服务 |
| RSS订阅源 | 稳定 | 数据不完整 |

**结论：** 优先使用客户端直接请求...
```

---

### 4. specs/{feature-name}/spec.md

**作用**: 详细需求规范，使用 Gherkin 风格描述场景

**内容结构**:

| 章节 | 说明 |
|-----|------|
| Requirement | 需求名称和描述 |
| Scenario | 具体场景（WHEN/THEN 格式） |

**示例**:

```markdown
### Requirement: GitHub Trending Tab 切换功能
用户 SHALL 能够在 GitHub Trending 模块中通过 Tab 切换查看每月 Trending 和每周 Trending 数据。

#### Scenario: 切换到每月 Trending
- **WHEN** 用户点击 "每月" Tab
- **THEN** 页面展示当月 GitHub Trending 项目列表

#### Scenario: 切换到每周 Trending
- **WHEN** 用户点击 "每周" Tab
- **THEN** 页面展示本周 GitHub Trending 项目列表
```

---

### 5. tasks.md

**作用**: 实施任务清单，用于跟踪开发进度

**内容格式**: Markdown checkbox 列表

**示例**:

```markdown
## 1. Data Layer

- [ ] 1.1 创建 `src/data/ai/github-trending.ts` 数据文件
- [ ] 1.2 定义 `TrendingProject` 类型

## 2. API / Data Fetching

- [ ] 2.1 创建 `src/utils/github-api.ts` 工具函数
- [ ] 2.2 实现 `fetchTrending(since: 'weekly' | 'monthly')` 函数
...
```

**状态标记**:
- `[ ]` - 待完成
- `[x]` - 已完成

---

### 6. config.yaml

**作用**: OpenSpec 全局配置文件

**内容示例**:

```yaml
schema: spec-driven

# Project context - 项目上下文信息
# context: |
#   Tech stack: TypeScript, React, Node.js
#   We use conventional commits

# Per-artifact rules - 各文件的生成规则
# rules:
#   proposal:
#     - Keep proposals under 500 words
#   tasks:
#     - Break tasks into chunks of max 2 hours
```

---

## 现有提案示例

### 示例 1: fix-vercel-npm-ci-failure

**问题**: Vercel 部署时 `npm ci` 失败

**生成文件**:
- `.openspec.yaml`
- `proposal.md`
- `design.md`
- `specs/vercel-deploy-fix/spec.md`
- `tasks.md`

### 示例 2: add-github-trending-module

**问题**: 缺少 GitHub Trending 展示功能

**生成文件**:
- `.openspec.yaml`
- `proposal.md`
- `design.md`
- `specs/github-trending/spec.md`
- `tasks.md`

---

## 命令汇总

| 命令 | 说明 |
|-----|------|
| `/opsx:propose` | 创建新提案 |
| `/opsx:explore` | 探索模式 - 思考伙伴 |
| `/opsx:apply` | 实施任务 |
| `/opsx:archive` | 归档完成的变化 |
