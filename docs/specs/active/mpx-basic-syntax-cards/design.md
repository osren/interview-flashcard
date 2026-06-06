---
feature: mpx-basic-syntax-cards
created: 2026-06-06
project-mode: brownfield
approval: approved
---

# mpx-basic-syntax-cards — 设计方案

## 背景

- 需求来源：`docs/specs/active/mpx-basic-syntax-cards/proposal.md`
- 项目模式：`brownfield`（现有前端项目，已有 MPX 卡片数据）
- 设计目标：为 MPX 模块补充结构化的基础语法闪卡，参考 `src/data/core/javascript.ts` 的格式

## 设计目标

- **业务目标**：新增约 50-65 张结构化 MPX 基础语法闪卡，包含 category/difficulty/codeExample 等字段
- **非业务目标**：不破坏现有自动解析生成的 MPX 卡片，不影响其他模块

## 方案概览

在 `src/data/mpx/mpx.ts` 中追加新的手写 `FlashCard` 对象数组 `mpxBasicCards`，新增 `mpx-basic` 章节配置。整体结构：

```
mpxCards (现有自动解析) + mpxBasicCards (新增结构化)
mpxChapters (现有) + 新增 mpx-basic 章节
```

## 关键设计

### 模块与职责

| 模块 | 职责 |
|------|------|
| `src/data/mpx/mpx.ts` | MPX 闪卡数据，导出 `mpxCards`、`mpxChapters` |
| `mpxBasicCards` (新增) | 结构化基础语法闪卡数组 |
| `mpxBasicChapters` (新增) | 基础语法章节配置 |

### 数据结构

**新增闪卡格式示例**：

```typescript
{
  id: 'mpx-reactivity-001',
  module: 'mpx',
  chapterId: 'mpx-basic',
  category: '响应式',
  question: 'MPX 中如何定义响应式数据？data 选项的写法是什么？',
  answer: `## 响应式数据定义

**data 选项**用于定义组件的响应式数据：

\`\`\`javascript
data() {
  return {
    message: 'Hello MPX',
    count: 0,
    userInfo: { name: '', age: 0 },
    list: []
  }
}
\`\`\`

### 关键约束

- data 必须是一个**函数**（组件实例）
- 返回的对象属性会自动成为响应式
- 顶层属性必须是对象，不支持嵌套函数的响应式`,
  tags: ['MPX', '响应式', 'data'],
  status: 'unvisited',
  difficulty: 'easy',
}
```

**新增章节配置**：

```typescript
{
  id: 'mpx-basic',
  title: 'MPX 基础语法',
  description: 'MPX 框架核心语法闪卡，涵盖模板、响应式、组件、生命周期、插槽',
  cardCount: 55, // 预估
  cards: [],
}
```

### 分类卡片分布

| 分类 | 前缀 | 数量 | 内容来源（mpx-guide.md 章节） |
|------|------|------|-------------------------------|
| 模板语法 | `tmpl` | 15-20 | §3 模板语法 |
| 响应式 | `reactive` | 12-15 | §7 computed + §8 watch |
| 组件基础 | `comp` | 10-12 | §5 脚本语法 + §6 组件系统 + §12 组件通信 |
| 生命周期 | `lifecycle` | 8-10 | §9 生命周期 |
| 插槽 | `slot` | 6-8 | §13 插槽 |

### ID 命名规则

- 格式：`mpx-{category-abbr}-{NNN}`
- 示例：`mpx-tmpl-001`, `mpx-reactive-001`, `mpx-comp-001`
- NNN 从 001 开始，每个分类独立计数

### 导出更新

在 `src/data/mpx/mpx.ts` 中：

1. 新增 `mpxBasicCards` 和 `mpxBasicChapters` 作为独立数组和配置
2. 导出时将两者追加到主数组：

```typescript
// 合并后的导出
export const mpxCards: FlashCard[] = [
  ...parseTechDocCards(mpxGuideRaw, 'mpx-guide', 'core'),
  ...parseTechDocCards(mpxArchitectureRaw, 'mpx-architecture', 'core'),
  ...parseTechDocCards(devGuideRaw, 'dev-guide', 'core'),
  ...mpxBasicCards, // 新增结构化卡片
];

export const mpxChapters: Chapter[] = [
  { /* 现有章节 */ },
  ...mpxBasicChapters, // 新增基础语法章节
];
```

在 `src/data/mpx/index.ts` 中更新导出：

```typescript
export { mpxCards, mpxChapters } from './mpx';
```

## 风险与取舍

1. **内容一致性风险**：新增卡片内容必须与 `docs/Mpx/mpx-guide.md` 保持一致
   - 缓解：内容逐条对照文档，确保语法正确性
2. **ID 冲突风险**：新增卡片 ID 不得与现有自动解析卡片冲突
   - 缓解：现有卡片 ID 格式为 `{chapterId}-{num}`，如 `mpx-guide-1`，新增使用 `mpx-{cat}-{NNN}` 格式完全不同
3. **章节归并决策**：新卡片是否作为独立 chapter 或合并到现有章节
   - 决策：**独立章节** `mpx-basic`，因为现有 `mpx-guide` 章节已由自动解析生成，风格不同

## 验证与发布考虑

### 验证重点

1. **TypeScript 类型检查**：`npm run build` 必须通过
2. **卡片数量正确**：新增约 50-65 张，可在 devtools 中验证
3. **分类筛选**：按 category 筛选应返回正确结果
4. **难度显示**：difficulty 字段应正确显示
5. **ID 唯一性**：无重复 ID

### 发布/迁移

- 不涉及（纯数据添加，无迁移）
- 无需灰度，回滚只需撤销代码更改

## Constraints 映射

| 约束来源 | 约束规则 | 本方案处理方式 |
|---------|---------|--------------|
| `docs/harness/invariants/biz.md` | TypeScript 禁止 any | 所有字段使用具体类型 |
| `src/types/card.ts` | FlashCard 接口定义 | 完全遵循接口定义 |
| `src/data/mpx/mpx.ts` | 现有解析逻辑 | 不修改现有解析代码 |

## Notes

- WebFetch 无法访问 mpxjs.cn，内容来源限定为 `docs/Mpx/mpx-guide.md`
- 卡片数量为预估，实际以生成为准
- 分类前缀：tmpl/reactive/comp/lifecycle/slot