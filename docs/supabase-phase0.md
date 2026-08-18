# Supabase Phase 0 部署与验证

## 1. 本地环境变量

复制模板并填写真实值：

```bash
cp .env.example .env
```

`.env` 内容：

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## 2. 设置 DeepSeek Secret

```powershell
supabase secrets set DEEPSEEK_API_KEY=sk-你的新密钥
```

或在 Dashboard → **Edge Functions → Secrets** 添加 `DEEPSEEK_API_KEY`。

## 3. 部署 Edge Functions

```powershell
cd F:\InterviewFlash
supabase functions deploy llm-proxy --no-verify-jwt
supabase functions deploy fetch-jd-url --no-verify-jwt
supabase functions deploy parse-jd --no-verify-jwt
supabase functions deploy optimize-resume --no-verify-jwt
```

## 4. 启动前端

```powershell
pnpm install
pnpm dev
```

## 5. 验证流程

1. 打开 http://localhost:5173 ，点击 Header 右上角 **登录**
2. 注册/登录测试账号
3. 浏览器 Console 执行：

```javascript
const { data: { session } } = await (await import('/src/lib/supabase/client.ts')).supabase.auth.getSession()
console.log(session?.access_token?.slice(0, 20))
```

4. 或用 curl 测试流式：

```powershell
curl -N -X POST "https://<project-ref>.supabase.co/functions/v1/llm-proxy" `
  -H "Authorization: Bearer <access_token>" `
  -H "Content-Type: application/json" `
  -d "{\"model\":\"deepseek-chat\",\"messages\":[{\"role\":\"user\",\"content\":\"说你好\"}],\"stream\":true}"
```

## 6. Vercel 环境变量

在 Vercel 项目 Settings → Environment Variables 添加：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

修改后需 Redeploy。

## 7. 头像 Storage（用户名 / 头像功能）

在 Supabase Dashboard → **SQL Editor** 执行：

`supabase/migrations/20260818000000_avatars_storage.sql`

或在 Storage 页面手动创建 **public** bucket：`avatars`（2MB，允许 image/*）。

用户资料保存在 Auth `user_metadata`：

- `username` — 显示名（必填，2-16 字符）
- `avatar_url` — 头像 URL（上传后自动生成，或手动填外链）

首次登录若未设置用户名，会自动弹出「完善个人资料」。

## 文件清单

| 路径 | 说明 |
|------|------|
| `src/lib/supabase/client.ts` | Supabase 客户端 |
| `src/lib/llm/call.ts` | LLM 调用封装 |
| `src/components/Auth/*` | 登录注册 |
| `supabase/functions/llm-proxy/index.ts` | Edge Function 代理 |
