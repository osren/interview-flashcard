# Tasks: InterviewFlash 生产级 AI 能力

## Phase 0 — Supabase 基础设施

- [x] **T0.1** 创建 InterviewFlash 独立 Supabase 项目，配置 Auth（邮箱密码）
- [x] **T0.2** 添加依赖 `@supabase/supabase-js`，配置 `VITE_SUPABASE_*` 环境变量模板（`.env.example`）
- [x] **T0.3** 实现 `src/lib/supabase/client.ts`
- [x] **T0.4** 实现 `AuthProvider` + `LoginModal` + Header 登录态
- [x] **T0.5** 部署 Edge Function `llm-proxy`（JWT 校验 + DeepSeek 流式代理）
- [x] **T0.6** 实现 `src/lib/llm/call.ts`（stream / non-stream 封装）

## Phase 1 — 卡片 AI 解释 / 追问

- [x] **T1.1** `FlashCard` 渲染静态 `extendQuestion` 字段
- [x] **T1.2** 新增 `src/lib/llm/prompts/card-ai.ts`（解释 / 追问 system + user 模板）
- [x] **T1.3** 实现 `CardAIPanel.tsx` + `StreamMarkdown.tsx`（Drawer 流式展示）
- [x] **T1.4** 卡片背面接入「AI 解释」「AI 追问」按钮（未登录拦截）
- [ ] **T1.5** 验证：Core / Projects / Interview 模块卡片均可调用

## Phase 2 — 岗位 JD 解析

- [x] **T2.1** 扩展 `CustomJobInput` / `buildCustomJob` 支持完整 extended + match 字段
- [x] **T2.2** 部署 Edge Function `fetch-jd-url`（超时、体积限制、fallback）
- [x] **T2.3** 部署 Edge Function `parse-jd`（结构化 JSON 输出 + schema 校验）
- [x] **T2.4** 实现 `JdParseModal.tsx`（URL → 抓取 → 解析 → 预览 → 确认）
- [x] **T2.5** 改造 `JobsTab` 接入智能添加；岗位详情展示 jd_summary / tech_stack
- [ ] **T2.6** 验证：URL 成功路径 + 粘贴兜底路径 + 写入看板可追踪

## Phase 3 — 简历 JD 优化（轻量）

- [x] **T3.1** 扩展 `useResumeStore`：`MarkdownResume` 模型 + CRUD + persist
- [x] **T3.2** 导入默认 Markdown 主简历（秋招简历精简版）
- [x] **T3.3** 部署 Edge Function `optimize-resume`
- [x] **T3.4** `ResumePage` 新增「JD 优化」Tab（编辑器 + 岗位选择 + 流式预览）
- [x] **T3.5** 「保存为新副本」+ 副本列表切换 + 导出 `.md`
- [ ] **T3.6** 验证：选 Campus 岗位 JD → 生成副本 → 刷新后仍在

## Phase 4 — 收尾

- [ ] **T4.1** Vercel 环境变量配置文档（README 或 docs）
- [ ] **T4.2** `pnpm lint` + `pnpm build` 通过
- [ ] **T4.3** 手动 E2E：登录 → 卡片 AI → 解析岗位 → 优化简历 全链路

## 依赖关系

```
Phase 0 ──► Phase 1
         └──► Phase 2
         └──► Phase 3
Phase 1/2/3 ──► Phase 4
```

Phase 1 / 2 / 3 可在 Phase 0 完成后并行开发。
