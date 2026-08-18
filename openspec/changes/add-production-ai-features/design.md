# Design: InterviewFlash 生产级 AI 能力

## 1. 总体架构

```
┌─────────────────────────────────────────────────────────┐
│ InterviewFlash (Vercel SPA)                              │
│  ├─ AuthProvider (Supabase Auth)                         │
│  ├─ FlashCard + AIPanel (解释/追问)                       │
│  ├─ Campus JobsTab + JdParseModal (URL→文本→结构化)       │
│  └─ ResumePage + Markdown 主简历 + 优化副本               │
└──────────────────────────┬──────────────────────────────┘
                           │ JWT Bearer
                           ▼
┌─────────────────────────────────────────────────────────┐
│ InterviewFlash Supabase（独立项目）                       │
│  Edge Functions:                                         │
│   • llm-proxy      — 流式/非流式 LLM 代理                 │
│   • fetch-jd-url   — 服务端抓取招聘页正文（CORS 绕过）    │
│   • parse-jd       — LLM 结构化输出 CampusJobData        │
│   • optimize-resume — 简历 + JD → 优化 Markdown 副本     │
│  Tables (optional v1):                                   │
│   • ai_conversations (user_id, card_id, messages)      │
│   • resume_copies (user_id, title, content, source_jd)   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
                      DeepSeek API
```

### 环境变量

| 变量 | 位置 |
|------|------|
| `VITE_SUPABASE_URL` | 前端 |
| `VITE_SUPABASE_ANON_KEY` | 前端 |
| `DEEPSEEK_API_KEY` | Edge Function secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function（仅服务端） |

## 2. Supabase 独立项目

### Auth

- 邮箱 + 密码注册/登录
- `AuthProvider` 包裹 App，`useAuth()` 暴露 `session / user / signIn / signOut`
- Header 显示登录态；未登录点击 AI 功能 → 弹出登录 Modal

### Edge Function: `llm-proxy`

参考 GResume 模式（见 `docs/interview/11-AI集成实现方案.md`），适配 InterviewFlash：

```typescript
// 请求
POST /functions/v1/llm-proxy
Authorization: Bearer <user_jwt>
{ model, messages, temperature, stream, response_format? }

// 校验
- 验证 JWT（supabase.auth.getUser）
- 可选：按 user_id 日调用次数限流（内存/DB）
```

### Edge Function: `fetch-jd-url`

```typescript
POST /functions/v1/fetch-jd-url
{ url: string }
→ { ok: true, text: string } | { ok: false, error: string, fallback: 'paste' }
```

实现要点：

- 服务端 `fetch(url)` + `User-Agent` 伪装
- 简单 HTML → 正文提取（可读性优先：`article`/`main`/最大文本块，或 `cheerio` 若 Edge 支持）
- 超时 8s；非 200 / 空正文 → 返回 `fallback: 'paste'`
- **不**在前端直接抓 URL（CORS + 反爬）

### Edge Function: `parse-jd`

```typescript
POST /functions/v1/parse-jd
{ company?: string, jd_text: string, job_url?: string }
→ CampusJobParseResult（对齐 RawJobJson + match 字段）
```

Prompt 输出 JSON Schema（与 `docs/秋招岗位/腾讯/前端开发.json` 对齐）：

- `basic`: position, company, location
- `extended`: jd_responsibilities[], jd_requirements[], jd_summary, requirements_summary, tech_stack[], job_category
- `match`: qualified, category, confidence, reason（结合 CANDIDATE.md 背景判断）

前端：`JdParseModal` 预览 → 确认 → `useCampusJobStore.addCustomJob()` 扩展字段写入。

**Store 扩展**：`CustomJobInput` 与 `buildCustomJob` 需支持完整 `extended` 字段（当前仅部分字段）。

## 3. 卡片 AI 解释 / 追问

### UI

在 `FlashCard` 背面答案区下方增加操作栏（需登录）：

| 按钮 | 行为 |
|------|------|
| AI 解释 | 打开右侧 Drawer，流式生成「结合你的项目背景的深度讲解」 |
| AI 追问 | 流式生成 2–3 个面试官追问 + 简要答题思路 |

组件：`src/components/AI/CardAIPanel.tsx` + `useCardAI()` hook。

### Prompt 策略

**系统 Prompt** 注入精简候选人背景（来自 `CANDIDATE.md` 摘要，硬编码或 build 时注入常量文件）：

```
你是前端面试教练。候选人：谭成，滴滴商旅实习 + GResume 个人项目。
当前卡片模块：{module}，标签：{tags}。
要求：结合候选人真实经历举例，不要泛泛而谈。
```

**AI 解释**：输入 question + answer + extendQuestion（若有）。

**AI 追问**：在解释基础上生成递进追问（原理 → 场景 → 踩坑 → 项目关联）。

### 持久化（v1 可选）

- 默认：会话内 state，刷新丢失
- 增强：登录用户写入 `ai_conversations` 表（card_id + messages JSON）

### 静态 `extendQuestion`

在 `FlashCard` 答案区渲染已有 `extendQuestion` 字段（类型已存在，UI 未展示）。

## 4. 岗位 JD 解析流程

```
用户输入：公司名（可选自动填）+ URL + JD 文本（可空）
        │
        ▼
   [有 URL?] ──yes──► fetch-jd-url ──ok──► jd_text
        │                    │
        no                   fail
        │                    ▼
        └────────────► 提示粘贴 JD 文本
                           │
                           ▼
                      parse-jd (LLM)
                           │
                           ▼
                      预览 CampusJobData
                           │
                           ▼
                      addCustomJob → Campus 看板
```

### JobsTab 改造

- 「添加岗位」表单升级为 `JdParseModal`：
  - Step 1：公司、URL、JD 文本
  - Step 2：抓取状态 / 解析 loading
  - Step 3：结构化预览（职责、要求、tech_stack、match.reason）
  - Step 4：确认添加
- 岗位详情侧栏展示完整 `jd_summary` / `requirements_summary`

## 5. 简历 JD 优化（轻量重做）

### 数据模型

扩展 `useResumeStore`：

```typescript
interface MarkdownResume {
  id: string;
  title: string;           // 如「通用版」「腾讯前端-优化版」
  content: string;         // Markdown 全文
  sourceResumeId?: string; // 派生来源
  targetJobId?: string;    // 关联 Campus job
  jdSnapshot?: string;     // 优化时使用的 JD 文本
  createdAt: number;
}

interface ResumeState {
  primaryResumeId: string | null;
  markdownResumes: MarkdownResume[];
  // 保留现有 PDF resumes、introScript
}
```

### 初始内容

- 从 `docs/秋招简历/版本05-精简一页版.md` 或现有 intro 扩展导入为默认 Markdown 主简历（`?raw` import）

### UI（ResumePage 新 Tab「JD 优化」）

1. 左侧：Markdown 编辑器（`@uiw/react-md-editor`，项目已有）
2. 中间：选择 Campus 岗位 / 粘贴 JD
3. 右侧：流式优化结果预览
4. 操作：**保存为新副本** → 写入 `markdownResumes`，列表可切换/对比/导出 `.md`

### Edge Function: `optimize-resume`

```typescript
POST /functions/v1/optimize-resume
{ resume_markdown: string, jd_text: string, company?: string, position?: string }
→ { optimized_markdown: string, changes_summary: string[], match_score?: number }
```

Prompt 要点：

- 保留事实，不捏造经历
- 突出 JD 关键词匹配（技能、项目表述）
- 输出完整 Markdown 副本 + 修改摘要列表
- 温度偏低（0.3）保证稳定

### 与 506 Resume iframe

保留「在线简历」Tab 不变；JD 优化走 InterviewFlash 自有 Markdown 链路，两者并行。

## 6. 前端依赖新增

```json
"@supabase/supabase-js": "^2.x",
"ai": "^4.x"  // 可选，Vercel AI SDK 流式消费；或原生 fetch + SSE 解析
```

## 7. 目录结构（新增）

```
src/
├── lib/
│   ├── supabase/client.ts
│   └── llm/
│       ├── call.ts          # llm-proxy 封装
│       └── prompts/         # 卡片/JD/简历 prompt 模板
├── components/
│   ├── Auth/
│   │   ├── AuthProvider.tsx
│   │   └── LoginModal.tsx
│   └── AI/
│       ├── CardAIPanel.tsx
│       ├── StreamMarkdown.tsx
│       └── JdParseModal.tsx
├── store/
│   └── useAuthStore.ts      # 可选，或纯 Context
supabase/
├── functions/
│   ├── llm-proxy/index.ts
│   ├── fetch-jd-url/index.ts
│   ├── parse-jd/index.ts
│   └── optimize-resume/index.ts
└── config.toml
```

## 8. 安全与成本

| 项 | 策略 |
|----|------|
| API Key | 仅 Edge Function secrets |
| 鉴权 | 所有 AI Edge Function 校验 JWT |
| 限流 | v1：每用户每日 50 次（可配置）；超限友好提示 |
| URL 抓取 | 只允许 http(s)；禁止内网 IP；响应体上限 500KB |
| Prompt 注入 | JD/简历文本做长度截断（如 12k chars） |

## 9. 验证标准

- [ ] 未登录可刷卡片；点击 AI 弹出登录
- [ ] 登录后卡片 AI 解释流式正常结束
- [ ] URL 抓取成功时自动填充 JD 文本；失败时粘贴兜底可解析
- [ ] 解析结果字段与内置 JSON 结构一致，可加入 Campus 看板
- [ ] Markdown 主简历 + JD → 生成新副本，可编辑并持久化
- [ ] `pnpm build` 通过；Edge Functions 本地 `supabase functions serve` 可联调
