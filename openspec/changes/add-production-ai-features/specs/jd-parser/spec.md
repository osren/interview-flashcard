## ADDED Requirements

### Requirement: 招聘 URL 抓取
系统 SHALL 通过 Edge Function 尝试从用户提供的招聘 URL 提取 JD 正文；抓取失败时 MUST 提示用户粘贴 JD 文本作为兜底。

#### Scenario: URL 抓取成功
- **WHEN** 用户提供有效 http(s) URL 且服务端抓取返回非空正文
- **THEN** JD 文本区自动填充抓取内容，并进入解析流程

#### Scenario: URL 抓取失败
- **WHEN** URL 超时、非 200、正文为空或域名不可达
- **THEN** 显示友好错误，保留用户已填公司名/URL，焦点引导至 JD 文本粘贴区

### Requirement: JD 结构化解析
系统 SHALL 将 JD 文本解析为与内置校招 JSON 一致的 `CampusJobData` 结构，经用户预览确认后写入校招看板。

#### Scenario: LLM 解析输出
- **WHEN** 用户提供非空 JD 文本并确认解析
- **THEN** 返回包含 basic、extended（jd_responsibilities、jd_requirements、jd_summary、tech_stack 等）、match（qualified、category、confidence、reason）的结构化对象

#### Scenario: 预览后确认添加
- **WHEN** 用户在预览页点击确认
- **THEN** 岗位以 `source: 'custom'` 写入 `useCampusJobStore`，可在 JobsTab 与 Progress 模块使用

#### Scenario: 仅粘贴文本兜底
- **WHEN** 用户未提供 URL 或 URL 抓取失败，但粘贴了 JD 文本
- **THEN** 解析流程正常完成，不依赖 URL
