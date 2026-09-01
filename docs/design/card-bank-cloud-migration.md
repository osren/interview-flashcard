# 题库云端化设计备忘

> 状态：**备忘（未实施）**  
> 创建：2026-09-01  
> 当前决策：**继续使用静态题库 + `learning_sync` 同步用户数据**

---

## 1. 背景

### 1.1 现状

| 层级 | 存储 | 说明 |
|------|------|------|
| 题库内容 | `src/data/core/*.ts` | 200 道播面图解题 + `extra-chapters.ts` 等静态题 |
| 图解 | CDN URL（`answerImage`） | 图片不在本项目，仅存链接 |
| 用户进度 | `learning_sync.payload` (JSONB) | 登录后同步：状态、收藏、自定义题、修改 |
| 本地缓存 | Zustand + localStorage | 未登录也可刷题 |

### 1.2 已验证的前端约定

- 数据层：`FlashCard.answerImage?: string`（只存 URL）
- 展示：`AnswerImageViewer`（卡片内缩放 + 全屏 1316×740 + 遮罩关闭）
- 内容生成：`scripts/scrape-bomian-frontend.mjs` → `scripts/generate-bomian-core.mjs`

### 1.3 为何暂不上云

- 题库是**内容发布**，不是用户生成数据
- 图解已在 CDN，数据库只多存一份 URL
- 静态方案已跑通，复杂度低、首屏快、可离线

---

## 2. 何时考虑迁移（触发条件）

满足 **任一** 即可启动本备忘的实施：

- [ ] 非开发者需要后台改题/换图，且不能走发版
- [ ] 题库规模 > 500 题，或需频繁上下线章节
- [ ] 多端（Web + 小程序/App）共用同一实时题库
- [ ] 需要按用户/标签从云端动态推题
- [ ] 需要 A/B 测试不同版本题目

**不满足以上条件时，维持静态方案即可。**

---

## 3. 目标架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端 (React)                      │
├─────────────────────────────────────────────────────────┤
│  题库加载层          │  用户数据层（已有）               │
│  fetchCardBank()     │  learning_sync (进度/收藏/自定义) │
│  + 本地缓存 fallback │  Zustand persist                  │
└──────────┬───────────┴──────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│  card_chapters       │   │  learning_sync       │
│  flash_cards         │   │  (user_id + payload) │
│  (公共只读)          │   │  (用户私有)          │
└──────────────────────┘   └──────────────────────┘
           │
           ▼
   img.bomianfm.com (CDN，不变)
```

**原则：题库与用户数据分离。**

- `flash_cards`：全员共享、很少变更
- `learning_sync`：每人一份、频繁读写

---

## 4. 表结构设计（草案）

### 4.1 `card_chapters` — 章节元数据

```sql
create table public.card_chapters (
  id            text primary key,          -- 如 'javascript', 'webpack'
  module        text not null default 'core',
  title         text not null,
  description   text,
  icon          text,
  sort_order    int not null default 0,
  is_published  boolean not null default true,
  updated_at    timestamptz not null default now()
);
```

### 4.2 `flash_cards` — 题库主表

```sql
create table public.flash_cards (
  id            text primary key,          -- 如 'bomian-javascript-203'
  module        text not null default 'core',
  chapter_id    text not null references public.card_chapters(id),
  category      text,
  question      text not null,
  answer        text not null default '',
  answer_image  text,                    -- CDN URL，可为 null
  tags          text[] not null default '{}',
  difficulty    text check (difficulty in ('easy','medium','hard')),
  code_example  text,
  extend_question text,
  sort_order    int not null default 0,
  source        text,                    -- 如 'bomian', 'manual'
  source_id     text,                    -- 如播面 question id: '203'
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index flash_cards_chapter_id_idx on public.flash_cards(chapter_id);
create index flash_cards_published_idx on public.flash_cards(is_published) where is_published = true;
```

### 4.3 RLS 策略

```sql
-- 章节：已发布内容对所有人可读（含 anon）
alter table public.card_chapters enable row level security;
create policy "Public read published chapters"
  on public.card_chapters for select
  using (is_published = true);

-- 卡片：同上
alter table public.flash_cards enable row level security;
create policy "Public read published cards"
  on public.flash_cards for select
  using (is_published = true);

-- 写操作：仅 service_role / 管理员（后续可加 admin 角色）
```

### 4.4 与 `FlashCard` 类型映射

| TypeScript (`FlashCard`) | DB 列 |
|--------------------------|-------|
| `id` | `id` |
| `module` | `module` |
| `chapterId` | `chapter_id` |
| `category` | `category` |
| `question` | `question` |
| `answer` | `answer` |
| `answerImage` | `answer_image` |
| `tags` | `tags` |
| `difficulty` | `difficulty` |
| `codeExample` | `code_example` |
| `extendQuestion` | `extend_question` |
| `status` | **不在题库表**（仍在 `learning_sync.cardStatuses`） |

---

## 5. `learning_sync` 保持不变

迁移后 **不** 把静态题 bulk 写入 `learning_sync`。该表继续只存：

```typescript
interface LearningSyncPayload {
  cardStatuses: Record<string, CardStatus>;
  cardProgress: Record<string, number>;
  customCards: FlashCard[];      // 用户自建，仍可含 answerImage
  modifiedCards: Record<string, Partial<FlashCard>>;
  favorites: FlashCard[];
  checkInDates: Record<string, true>;
}
```

收藏/修改时，`answerImage` 会随 `FlashCard` 快照进入 payload——这是**用户行为数据**，不是题库源。

---

## 6. 迁移步骤（实施 checklist）

### Phase 1 — 数据库

- [ ] 新增 migration：`card_chapters` + `flash_cards`
- [ ] 配置 RLS（公开读、管理员写）
- [ ] 编写导入脚本：读 `docs/scrape/bomian-frontend-questions.json` + `extra-chapters` 静态 TS → SQL upsert

### Phase 2 — 前端加载层

- [ ] 新增 `src/lib/card-bank/`：
  - `fetchCardBank(): Promise<{ chapters, cards }>`
  - `mapRowToFlashCard(row)`（snake_case → camelCase）
- [ ] 启动时：优先拉云端 → 失败则 fallback 静态 `src/data/core/`（过渡期）
- [ ] 可选：IndexedDB 缓存题库 + `updated_at` 版本号

### Phase 3 — 切换

- [ ] 特性开关 `VITE_CARD_BANK_SOURCE=static|cloud`
- [ ] 验证 `/core/:chapterId` 刷题、收藏、进度同步
- [ ] 稳定后移除静态 bomian 文件（或保留为 fallback）

### Phase 4 — 运维

- [ ] 文档化「新增一题」流程（SQL / 管理脚本）
- [ ] 监控 Supabase 读 QPS 与缓存命中率

---

## 7. 导入脚本思路

基于现有工具链扩展：

```bash
# 1. 爬取（已有）
node scripts/scrape-bomian-frontend.mjs

# 2. 生成静态 TS（已有，过渡期保留）
node scripts/generate-bomian-core.mjs

# 3. 新增：写入 Supabase
node scripts/import-card-bank-to-supabase.mjs
```

导入逻辑伪代码：

```typescript
for (const group of scrapeData.data) {
  upsertChapter({ id, title, ... });
  for (const q of group.questions) {
    upsertCard({
      id: `bomian-${chapterId}-${q.id}`,
      question: q.title,
      answer_image: q.imageUrl,
      source: 'bomian',
      source_id: String(q.id),
    });
  }
}
```

---

## 8. 前端改造要点

### 8.1 数据流变化

```
现在：  coreCards (静态 import) → useCardStore.setCards()
以后：  fetchCardBank() → merge customCards → useCardStore.setCards()
```

### 8.2 不需要改的

- `FlashCard` 类型
- `AnswerImageViewer` / `FlashCard` 组件
- `learning_sync` 同步逻辑（cardId 保持一致即可）

### 8.3 需要注意

- **cardId 稳定**：迁移时 ID 必须与现有一致（如 `bomian-javascript-203`），否则用户进度丢失
- **加载态**：章节页需 skeleton，避免白屏
- **离线**：Service Worker 或 IndexedDB 缓存最后一次成功拉取的题库

---

## 9. 风险与对策

| 风险 | 对策 |
|------|------|
| CDN 图片失效 | `answer_image` 可批量更新；静态 fallback 保留 URL 列表 |
| 进度 ID 不一致 | 迁移前导出 ID 映射表；禁止随意改 `id` |
| 首屏变慢 | 章节级懒加载；IndexedDB 缓存 |
| Supabase 未部署 | 保持 `static` 模式；`learning_sync` 已有 graceful degrade |
| 播面内容版权 | 仅个人学习；商用需授权；source 字段标记来源 |

---

## 10. 开放问题（实施前确认）

1. **是否需要管理后台？** 还是 SQL + 脚本足够？
2. **extra-chapters（157 题）是否一并上云？** 还是仅 bomian 200 题？
3. **其他模块**（interview / projects / mpx）是否共用 `flash_cards` 表，还是分表？
4. **版本策略**：云端更新后，客户端如何感知（`If-Modified-Since` / 版本号字段）？

---

## 11. 相关文件索引

| 文件 | 用途 |
|------|------|
| `src/types/card.ts` | `FlashCard` / `answerImage` 定义 |
| `src/components/Card/AnswerImageViewer.tsx` | 图解展示约定 |
| `src/lib/supabase/learning-sync.ts` | 用户数据云同步 |
| `supabase/migrations/20260901000000_learning_sync.sql` | 现有 sync 表 |
| `docs/scrape/bomian-frontend-questions.json` | 播面爬取源数据 |
| `scripts/scrape-bomian-frontend.mjs` | 爬取脚本 |
| `scripts/generate-bomian-core.mjs` | 静态 TS 生成 |

---

## 12. 结论

**当前阶段**：静态题库 + 进度上云，性价最高。  
**本备忘作用**：触发条件满足时，按本文档实施，避免重复设计。  
**最小改动路径**：先建表 + 导入脚本 + 特性开关，静态与云端并行一段时间后再切。
