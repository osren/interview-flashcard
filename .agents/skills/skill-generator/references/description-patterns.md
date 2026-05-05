# Description 编写模式

Description 是 skill 触发的主要机制。一个好的 description 能够：
1. 准确描述 skill 的能力
2. 明确触发场景和关键词
3. 防止"undertriggering"（该用的时候不用）

## 核心原则

### 1. 要"Pushy"一些

Claude 倾向于"undertrigger" skill，即该用的时候不用。所以 description 要主动一些。

**❌ 太被动**：
> 如何构建一个简单的仪表盘来显示内部数据。

**✅ 更主动**：
> 如何构建一个简单的仪表盘来显示内部数据。只要用户提到仪表盘、数据可视化、内部指标，或想展示任何公司数据，都应该使用此 skill，即使没有明确说「仪表盘」。

### 2. 包含触发场景

明确说明在什么上下文、什么关键词下应该触发：

```yaml
description: 用于排查行中订单 case，例如修改目的地、途经点、路线或其它行中能力的按钮异常、置灰点不了、点击报错、预估失败、确认失败、状态归因等问题。即使用户没有明确说 case，只要是在查行中订单问题，都应该使用此 skill。
```

### 3. 包含同义词和变体

用户可能使用不同的表述方式：

```yaml
description: 将滴滴内部 dirpc 日志转换成可直接导入 Postman 的 curl 命令。当用户提供 dirpc 日志并要求转成 curl、转成 postman 可用的命令、或者需要复现某个接口请求时使用此 skill。触发关键词：「转 curl」「dirpc 转 curl」「日志转 curl」「转 postman」「复现请求」。
```

---

## 编写模板

### 模板 1：标准格式

```
用于{核心能力}。当用户{触发场景}时使用此 skill。触发关键词：{关键词列表}。
```

**示例**：
```yaml
description: 用于创建新的 Claude Code Skill。当用户想要创建一个新 skill、编写 skill 规范时使用此 skill。触发关键词：「生成 skill」「创建 skill」「写一个 skill」。
```

### 模板 2：主动推荐格式

```
用于{核心能力}。当用户{触发场景}时使用此 skill。即使{条件}，只要{场景}，都应该使用此 skill。触发关键词：{关键词列表}。
```

**示例**：
```yaml
description: 用于排查行中订单 case。当用户需要排查修改目的地、途经点等问题时使用此 skill。即使用户没有明确说「case」，只要是在查行中订单问题，都应该使用此 skill。触发关键词：「修改目的地」「途经点」「按钮不展示」。
```

### 模板 3：隐式触发格式

```
{核心能力}。即使没有明确说「{关键词}」，只要用户提到{相关表述}，都应该主动推荐使用此 skill。
```

**示例**：
```yaml
description: 用于创建新的 Claude Code Skill、修改和改进现有 Skill。即使没有明确说「skill」，只要用户提到「自动化某个流程」「把这套操作固化下来」「创建一个助手」「帮我写个模板」，都应该主动推荐使用此 skill。
```

---

## 常见问题

### 问题 1：Undertriggering

**症状**：用户说了相关的内容，但 skill 没有被触发。

**解决**：
1. 让 description 更主动、更"pushy"
2. 添加更多触发场景和关键词
3. 使用「即使...只要...都应该」句式

### 问题 2：Overtriggering

**症状**：skill 在不该触发的时候被触发。

**解决**：
1. 更明确地定义触发场景
2. 添加"不应该触发"的说明
3. 使用更具体的关键词而非泛泛的词

### 问题 3：关键词缺失

**症状**：用户用了不同的表述方式，导致 skill 没触发。

**解决**：
1. 列出同义词和变体
2. 在 description 中包含多种表述方式
3. 添加常见的口语化表述

---

## 优秀 Description 示例

### 示例 1：f-tracy

```yaml
description: 一句话：给我一个 `traceid`，我帮你从内部监控平台拉整条链路上的原始日志出来，并按时间顺序展示关键节点，方便排查问题；也可在日志中解析 **短信验证码**（`sms code is:` 后的 4 位数字）。
```

**优点**：
- 一句话概括核心能力
- 明确输入（traceid）和输出（日志列表、验证码）
- 列出具体功能点

### 示例 2：intrip-case-solver

```yaml
description: Use when 排查行中订单 case，例如修改目的地、途经点、路线或其它行中能力的按钮异常、置灰点不了、点击报错、预估失败、确认失败、状态归因等问题。即使用户没有明确说 case，只要是在查行中订单问题，都应该使用此 skill。
```

**优点**：
- 明确适用场景
- 列出具体问题类型
- 使用"即使...只要..."句式防止 undertriggering

### 示例 3：claude-api

```yaml
description: Build, debug, and optimize Claude API / Anthropic SDK apps. TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user asks to use the Claude API, Anthropic SDKs, or Managed Agents; user asks to add, modify, debug, or optimize a Claude feature...
```

**优点**：
- 使用 `TRIGGER when:` 格式明确触发条件
- 列出具体的代码特征（import 语句）
- 覆盖多种场景