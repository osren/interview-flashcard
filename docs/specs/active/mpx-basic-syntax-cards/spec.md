# Spec: MPX 基础语法闪卡补充

## Purpose

为 MPX 模块补充结构化的基础语法闪卡，使候选人能够通过闪卡练习掌握 MPX 框架的核心语法概念。卡片格式参考 `src/data/core/javascript.ts`，包含 `category`（分类）、`difficulty`（难度）、`codeExample`（代码示例）等字段。

## Scope

### 新增内容范围

在 `src/data/mpx/mpx.ts` 中新增以下基础语法闪卡：

| 分类 | 语法点 | 卡片数量 | 说明 |
|------|--------|---------|------|
| 模板语法 | 文本插值、条件渲染、列表渲染、事件绑定、样式绑定、双向绑定 | 15-20 | 模板基础 |
| 响应式 | data 选项、计算属性 computed、监听器 watch | 12-15 | 响应式数据 |
| 组件基础 | props、methods、组件通信、$refs | 10-12 | 组件构建 |
| 生命周期 | 页面生命周期、组件生命周期、pageLifetimes | 8-10 | 钩子函数 |
| 插槽 | 默认插槽、命名插槽、作用域插槽 | 6-8 | 内容分发 |

**总计**：约 50-65 张新卡片

### 卡片结构

每张卡片必须包含以下字段：

```typescript
{
  id: string;           // 格式: mpx-{category}-{number}, 如 mpx-reactivity-001
  module: 'mpx';        // 固定值
  chapterId: string;    // 章节 ID，如 'mpx-basic'
  category: string;     // 分类，如 '响应式'
  question: string;     // 问题，简短明确
  answer: string;       // 答案，Markdown 格式，包含代码示例
  tags: string[];       // 标签，如 ['MPX', '响应式', 'computed']
  status: 'unvisited'; // 默认值
  difficulty?: 'easy' | 'medium' | 'hard'; // 难度等级
  codeExample?: string; // 代码示例（复杂概念时提供）
}
```

### 章节配置

新增 `mpx-basic` 章节：

```typescript
{
  id: 'mpx-basic',
  title: 'MPX 基础语法',
  description: 'MPX 框架核心语法闪卡，涵盖模板、响应式、组件、生命周期、插槽',
  cardCount: 50, // 预估数量
  cards: [],
}
```

## Requirements

### R1: 卡片内容必须基于已有文档

- 所有卡片内容必须来自 `docs/Mpx/mpx-guide.md`，不得凭空捏造
- 如需补充内容，标注 `<!-- TODO: 待确认 -->`

### R2: 卡片格式必须符合 FlashCard 接口

- 必须包含 `id`、`module`、`chapterId`、`category`、`question`、`answer`、`tags`、`status`
- `difficulty` 和 `codeExample` 对应复杂概念必填，简单概念可选

### R3: 分类必须与文档章节对应

- 分类标签应与 `docs/Mpx/mpx-guide.md` 中的目录结构对应
- 分类包括：模板语法、响应式、组件基础、生命周期、插槽

### R4: ID 必须唯一且有规律

- 格式：`mpx-{category-abbr}-{NNN}`
- category-abbr: `tmpl`（模板）、`reactive`（响应式）、`comp`（组件）、`lifecycle`、`slot`
- NNN: 三位数字，从 001 开始

### R5: 不得覆盖现有卡片

- 新卡片必须追加到现有 `mpxCards` 数组中
- 不得修改现有卡片的任何字段

## Scenario

### Scenario 1: 用户学习模板语法

**GIVEN** 用户在 MPX 基础语法章节
**WHEN** 用户查看第一张卡片
**THEN** 卡片显示问题："MPX 中如何实现条件渲染？"
**AND** 答案包含 `wx:if` vs `wx:show` 的区别及代码示例

### Scenario 2: 用户学习响应式

**GIVEN** 用户已完成模板语法学习
**WHEN** 用户继续学习响应式分类
**THEN** 可以看到 computed 和 watch 的对比卡片
**AND** 卡片包含代码示例和适用场景说明

### Scenario 3: 用户筛选特定分类

**GIVEN** 用户只想学习组件相关卡片
**WHEN** 用户在卡片列表中筛选 `category=组件基础`
**THEN** 仅显示组件相关的闪卡，不显示其他分类

## Constraints

1. **TypeScript 禁止 any** — 所有字段必须有明确类型
2. **卡片内容来自文档** — 不得凭空创造 MPX 语法知识
3. **不得破坏现有功能** — 现有解析生成的卡片必须保持不变

## Notes

- 由于 WebFetch 无法访问 mpxjs.cn，内容来源限定为 `docs/Mpx/mpx-guide.md`
- 现有 `parseTechDocCards` 解析逻辑保留，不影响现有卡片
- 新卡片以手写 `FlashCard` 对象字面量形式追加到 `mpxCards` 数组