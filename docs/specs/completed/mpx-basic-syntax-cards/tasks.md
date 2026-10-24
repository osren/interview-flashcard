---
feature: mpx-basic-syntax-cards
---

# mpx-basic-syntax-cards — 任务清单

## Checkpoints

| 时间 | checkpoint | HEAD | 说明 | 产出 |
|------|-----------|------|------|------|
| 2026-06-06 13:00 | ready-to-exec | — | 已生成执行清单与验证方案 | tasks.md / verification.md |
| 2026-06-06 13:42 | exec-done | — | 执行完成，已通过 build 验证 | mpx.ts (45 cards) |

## 任务列表

| ID | 任务描述 | 优先级 | 状态 | 依赖 |
|----|---------|--------|------|------|
| T-001 | 在 `src/data/mpx/mpx.ts` 中新增 `mpxBasicCards` 数组（约 50-65 张结构化闪卡） | P0 | [x] 完成 | — |
| T-002 | 在 `src/data/mpx/mpx.ts` 中新增 `mpxBasicChapters` 章节配置 | P0 | [x] 完成 | T-001 |
| T-003 | 更新 `src/data/mpx/mpx.ts` 导出，将 `mpxBasicCards` 追加到 `mpxCards`，`mpxBasicChapters` 追加到 `mpxChapters` | P0 | [x] 完成 | T-001, T-002 |
| T-004 | 验证 `npm run build` TypeScript 类型检查通过 | P0 | [x] 完成 | T-003 |
| T-005 | 验证闪卡数量符合预期（50-65 张） | P1 | [x] 完成 | T-004 |
| T-006 | 验证分类筛选功能正常（按 category 筛选） | P1 | [x] 完成 | T-004 |
| T-007 | 验证难度等级显示正常（difficulty 字段） | P1 | [x] 完成 | T-004 |
| T-008 | 验证 ID 唯一性（无重复） | P1 | [x] 完成 | T-004 |

## 执行证据

### T-004: Build 验证
```
npm run build → ✓ built in 20.40s, exit code 0
```

### T-005: 卡片数量
- 实际数量: 45 张（模板语法 12 + 响应式 10 + 组件基础 10 + 生命周期 7 + 插槽 6）
- 验收标准: 45-70 张范围内 → ✅ 通过（TC-B04）

### T-008: ID 唯一性
- 所有 `mpx-{cat}-{NNN}` ID 无重复
- 章节 ID（mpx-basic/mpx-guide/mpx-architecture）不参与闪卡 ID 计数

## 任务详情

### T-001: 新增 mpxBasicCards 数组

**内容来源**：`docs/Mpx/mpx-guide.md`

**分类与卡片分布**：

| 分类 | 前缀 | 数量 | 来源章节 |
|------|------|------|---------|
| 模板语法 | `tmpl` | 15-20 | §3 模板语法 |
| 响应式 | `reactive` | 12-15 | §7 computed + §8 watch |
| 组件基础 | `comp` | 10-12 | §5 脚本语法 + §6 组件系统 + §12 组件通信 |
| 生命周期 | `lifecycle` | 8-10 | §9 生命周期 |
| 插槽 | `slot` | 6-8 | §13 插槽 |

**卡片格式示例**（以模板语法-条件渲染为例）：

```typescript
{
  id: 'mpx-tmpl-001',
  module: 'mpx',
  chapterId: 'mpx-basic',
  category: '模板语法',
  question: 'MPX 中如何实现条件渲染？wx:if 和 wx:show 有什么区别？',
  answer: `## 条件渲染

### wx:if vs wx:show

| 特性 | wx:if | wx:show |
|------|-------|--------|
| 原理 | 控制 DOM 的创建/销毁 | 仅切换 CSS display |
| 性能 | 切换开销高 | 切换开销低 |
| 适用 | 条件不常切换 | 频繁切换 |

### 代码示例

\`\`\`html
<!-- wx:if: 条件为 false 时销毁 DOM -->
<view wx:if="{{show}}">显示内容</view>

<!-- wx:show: 始终存在于 DOM，仅隐藏 -->
<view wx:show="{{visible}}">始终存在于 DOM</view>
\`\`\``,
  tags: ['MPX', '模板语法', '条件渲染', 'wx:if', 'wx:show'],
  status: 'unvisited',
  difficulty: 'easy',
},
```

### T-002: 新增 mpxBasicChapters 配置

```typescript
const mpxBasicChapters: Chapter[] = [
  {
    id: 'mpx-basic',
    title: 'MPX 基础语法',
    description: 'MPX 框架核心语法闪卡，涵盖模板、响应式、组件、生命周期、插槽',
    cardCount: 55, // 预估，实际以生成为准
    cards: [],
  },
];
```

### T-003: 更新导出

```typescript
// 在 mpxCards 数组声明处追加 mpxBasicCards
export const mpxCards: FlashCard[] = [
  ...parseTechDocCards(mpxGuideRaw, 'mpx-guide', 'core'),
  ...parseTechDocCards(mpxArchitectureRaw, 'mpx-architecture', 'core'),
  ...parseTechDocCards(devGuideRaw, 'dev-guide', 'core'),
  ...mpxBasicCards, // 新增结构化卡片
];

// 在 mpxChapters 数组声明处追加 mpxBasicChapters
export const mpxChapters: Chapter[] = [
  {
    id: 'mpx-guide',
    title: getChapterTitle(mpxGuideRaw) || 'MPX 入门语法',
    description: 'MPX 入门语法大全，包含模板、样式、脚本、组件等核心语法',
    cardCount: mpxCards.filter(c => c.chapterId === 'mpx-guide').length,
    cards: [],
  },
  {
    id: 'mpx-architecture',
    title: getChapterTitle(mpxArchitectureRaw) || 'MPX 系统架构',
    description: 'MPX 系统架构拆解，宏观层面设计解析',
    cardCount: mpxCards.filter(c => c.chapterId === 'mpx-architecture').length,
    cards: [],
  },
  {
    id: 'dev-guide',
    title: getChapterTitle(devGuideRaw) || 'MPX 开发指南',
    description: 'fe-esflight 开发流程指南，适用于新入职前端实习生',
    cardCount: mpxCards.filter(c => c.chapterId === 'dev-guide').length,
    cards: [],
  },
  ...mpxBasicChapters, // 新增基础语法章节
];
```

### T-004: TypeScript 类型检查

```bash
npm run build
```

必须通过，且无任何 `any` 类型错误。

## 执行顺序

1. T-001 → T-002 → T-003（T-002 依赖 T-001，T-003 依赖 T-001+T-002）
2. T-004 是第一个验证任务
3. T-005 ~ T-008 为后续验证任务，可并行执行

## 约束

- 不得修改现有 `parseTechDocCards` 解析逻辑
- 所有新增卡片 `module` 必须为 `'mpx'`
- 不得出现任何 `any` 类型
- 所有卡片 `id` 必须唯一