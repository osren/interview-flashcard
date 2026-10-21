## ADDED Requirements

### Requirement: 卡片 AI 解释
已登录用户 SHALL 在闪卡答案面请求 AI 对当前题目进行结合候选人背景的深度解释，响应 MUST 以流式方式展示。

#### Scenario: 发起 AI 解释
- **WHEN** 用户在卡片背面点击「AI 解释」
- **THEN** 系统发送 question、answer、extendQuestion（若有）、module、tags 至 LLM，Drawer 中流式渲染 Markdown 结果

#### Scenario: 展示静态延伸追问
- **WHEN** 卡片数据包含 `extendQuestion` 字段
- **THEN** 答案区在 AI 按钮上方展示该静态追问文本

### Requirement: 卡片 AI 追问
已登录用户 SHALL 可请求 AI 生成 2–3 个递进式模拟面试追问及简要答题思路。

#### Scenario: 发起 AI 追问
- **WHEN** 用户点击「AI 追问」
- **THEN** 系统基于当前卡片上下文生成追问列表，流式展示

#### Scenario: 切换卡片重置面板
- **WHEN** 用户切换到另一张卡片
- **THEN** AI 面板关闭或清空，避免上下文串题
