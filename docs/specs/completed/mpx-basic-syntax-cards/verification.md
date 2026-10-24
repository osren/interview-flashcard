---
feature: mpx-basic-syntax-cards
---

# mpx-basic-syntax-cards — 验收验证文档

## 轻量交付门禁

在进入 review / archive / 完成声明前，以下门禁必须全部通过：

| # | 门禁条件 | 验证命令/方法 | 通过标准 |
|---|---------|-------------|---------|
| G-01 | TypeScript 类型检查通过 | `npm run build` | exit code 0，无 any 类型错误 |
| G-02 | 新卡片已正确导出 | 检查 `src/data/mpx/index.ts` | 导出 `mpxCards` 包含新增的 `mpxBasicCards` |
| G-03 | 章节配置正确 | 检查 `mpxChapters` 包含 `mpx-basic` | `id: 'mpx-basic'` 存在 |
| G-04 | 无重复 ID | 代码检查 | 所有卡片 id 唯一 |

## 轻量证据门禁

声称"完成/测试通过/finding 已修复"时，必须提供以下证据：

| # | 证据要求 | 证据来源 |
|---|---------|---------|
| E-01 | `npm run build` 输出截图或日志 | 终端输出 |
| E-02 | 新卡片数量统计（50-65 张） | 代码行数或计数输出 |
| E-03 | 分类覆盖确认（5 个分类） | 代码抽查 |

## 功能测试用例

### TC-001: 模板语法-条件渲染卡片

**GIVEN** 用户在 MPX 基础语法章节
**WHEN** 用户查看第一张条件渲染卡片
**THEN** 问题为"MPX 中如何实现条件渲染？wx:if 和 wx:show 有什么区别？"
**AND** 答案包含 `wx:if` vs `wx:show` 的对比表格和代码示例

### TC-002: 响应式-computed 卡片

**GIVEN** 用户学习响应式分类
**WHEN** 用户查看 computed 相关卡片
**THEN** 卡片包含 getter/setter 用法说明
**AND** 卡片包含与 Store 结合使用的示例

### TC-003: 组件基础-props 卡片

**GIVEN** 用户学习组件基础分类
**WHEN** 用户查看 props 相关卡片
**THEN** 卡片说明 props 的类型定义方式（String/Number/Boolean/Object/Array）
**AND** 卡片说明默认值函数写法

### TC-004: 生命周期-页面钩子卡片

**GIVEN** 用户学习生命周期分类
**WHEN** 用户查看页面生命周期卡片
**THEN** 卡片覆盖 onLoad/onShow/onReady/onHide/onUnload/onError
**AND** 每种钩子包含常用场景说明

### TC-005: 插槽-命名插槽卡片

**GIVEN** 用户学习插槽分类
**WHEN** 用户查看命名插槽卡片
**THEN** 卡片说明 slot name 属性用法
**AND** 卡片包含父组件传值示例

## 边界测试用例

### TC-B01: 空 category 筛选

**GIVEN** 用户筛选不存在的 category
**WHEN** 用户在筛选框输入 "不存在的分类"
**THEN** 返回空结果，不报错

### TC-B02: ID 唯一性

**GIVEN** 所有新增卡片
**WHEN** 代码中检查所有 id
**THEN** 无重复 id，新增卡片 id 格式为 `mpx-{cat}-{NNN}`

### TC-B03: difficulty 字段缺失

**GIVEN** 简单概念的卡片
**WHEN** 卡片未设置 difficulty 字段
**THEN** 类型检查通过（difficulty 为可选字段 `?`）

### TC-B04: 卡片数量边界

**GIVEN** 预估 50-65 张新卡片
**WHEN** 实际生成后统计
**THEN** 总数在 45-70 张范围内（允许合理偏差）

## 异常测试用例

### TC-E01: module 与 chapterId 不匹配

**GIVEN** 新卡片
**WHEN** 某张卡片 `module` 设置为 `'core'` 但 `chapterId` 为 `'mpx-basic'`
**THEN** TypeScript 检查报错（module='core' 与 chapterId='mpx-basic' 不匹配，MPX 基础语法章节的卡片 module 应为 'mpx'）

### TC-E02: 状态字段缺失

**GIVEN** 新卡片
**WHEN** 某张卡片缺少 `status` 字段
**THEN** TypeScript 检查报错（status 为必填字段）

## Invariants 检查清单

| # | 规则 | 检查方法 | 通过标准 |
|---|------|---------|---------|
| INV-01 | TypeScript 禁止 any | `npm run build` 输出 | 无 `any` 类型错误 |
| INV-02 | 组件 Props 必须定义接口 | N/A（纯数据文件） | — |
| INV-03 | useEffect 依赖完整 | N/A（纯数据文件） | — |
| INV-04 | 所有卡片 module 必须是有效 ModuleType | 代码检查 | 所有 `module` 值为 `'mpx'` |
| INV-05 | 所有卡片 status 必须有效 | 代码检查 | 所有 `status` 值为 `'unvisited' \| 'forgotten' \| 'fuzzy' \| 'mastered'` |
| INV-06 | ID 格式正确（mpx-{cat}-{NNN}） | 代码检查 | 所有 id 匹配正则 `/^mpx-(tmpl|reactive|comp|lifecycle|slot)-\d{3}$/` |

## 验收通过条件

- G-01 ~ G-04 全部通过
- E-01 ~ E-03 证据齐全
- TC-001 ~ TC-005 功能正常
- TC-B01 ~ TC-B04 边界测试通过
- TC-E01 ~ TC-E02 异常测试通过
- INV-01 ~ INV-06 全部检查通过