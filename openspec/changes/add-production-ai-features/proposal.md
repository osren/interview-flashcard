# Proposal: InterviewFlash 生产级 AI 能力升级

## 问题背景

InterviewFlash 已部署为 Vercel 静态 SPA，具备闪卡刷题、校招岗位看板、简历管理等模块，但缺少生产级 AI 与账号体系：

- 卡片仅有静态问答，无法 AI 解释或模拟追问
- 校招岗位仅支持手动填写 4 个字段，无法从 JD/URL 解析为标准 `CampusJobData`
- 简历页嵌入 506 Resume，无法在 InterviewFlash 内按 JD 轻量优化并保存副本

## 决策约束（已确认）

| 决策项 | 选择 |
|--------|------|
| Supabase | **InterviewFlash 独立项目**（与 GResume 分离） |
| 简历优化 | **InterviewFlash 内轻量重做**（Markdown 简历 + LLM 改写，不依赖 GResume API） |
| JD 输入 | **优先 URL 抓取**，失败则 **粘贴 JD 文本** 兜底 |

## 目标

1. **账号体系**：Supabase Auth（邮箱密码），AI 功能需登录
2. **卡片 AI**：「AI 解释」「AI 追问」流式面板，结合题目与候选人背景
3. **岗位解析**：输入公司名 + URL/JD 文本 → 结构化 `CampusJobData` → 写入校招看板
4. **简历 JD 优化**：维护 Markdown 主简历 → 选 JD → 生成优化副本并可编辑/导出

## 非目标

- 不接入 GResume 的 TipTap/CRDT/Automerge 编辑器
- 不做 GResume 级别的 ATS 雷达图、字段 path 一键写回
- 不修改 `docs/秋招岗位/` 内置 JSON 文件（用户解析结果仅存 localStorage + 可选 Supabase）
- 不做多人协作、云端简历 CRDT 同步（v1 仅单用户 AI 日志与副本可选云存）

## 预期收益

- 面试可讲：独立 Supabase 项目、Edge Function 代理 LLM、结构化 Prompt、流式 UI、URL 抓取降级策略
- 产品闭环：刷题 → 解析岗位 → 针对性改简历 → 投递追踪（Campus 模块已有）

## 涉及能力域

- `auth-supabase`: 登录注册与会话
- `llm-proxy`: Edge Function 安全调用 DeepSeek
- `card-ai`: 闪卡 AI 解释/追问
- `jd-parser`: 岗位 URL 抓取 + LLM 结构化解析
- `resume-jd-optimize`: Markdown 简历 + JD 优化副本
