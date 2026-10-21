## ADDED Requirements

### Requirement: Supabase 独立账号体系
InterviewFlash SHALL 使用独立 Supabase 项目提供邮箱密码登录，AI 功能 MUST 要求有效 JWT 会话。

#### Scenario: 未登录访问 AI 功能
- **WHEN** 未登录用户点击「AI 解释」「AI 追问」、岗位智能解析或简历 JD 优化
- **THEN** 系统显示登录 Modal，不发起 LLM 请求

#### Scenario: 登录后调用 Edge Function
- **WHEN** 已登录用户发起 AI 请求
- **THEN** 请求携带 `Authorization: Bearer <access_token>`，Edge Function 校验通过后代理 DeepSeek

### Requirement: LLM 密钥不出前端
DeepSeek API Key SHALL 仅存在于 Supabase Edge Function secrets，前端 MUST NOT 包含任何 LLM API Key。

#### Scenario: 前端 LLM 调用路径
- **WHEN** 前端需要 LLM 能力
- **THEN** 仅通过 `/functions/v1/llm-proxy` 或专用 Edge Function 间接调用
