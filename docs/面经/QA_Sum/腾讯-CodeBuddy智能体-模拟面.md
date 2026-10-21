# 腾讯 - CodeBuddy智能体 - 模拟面

## 1. 协同编辑时怎么确定哪些操作是离线时期的操作？是否有额外的字段存储离线期间的操作？

## 答案

### 核心要点

GResume 使用 **Automerge (CRDT)** 实现协同编辑，通过以下机制确定离线操作：
1. **状态标记**：`pendingChanges` 标识本地有待同步的变更
2. **Change 对象**：Automerge 自动记录每个操作的变更集（Change），包含操作ID和时间戳
3. **本地队列**：离线操作先存入本地队列，恢复后批量同步

### 详细说明

在 GResume 中，离线操作的识别和同步流程如下：

**1. 本地状态标记**

```typescript
// src/store/resumeStore.ts
interface ResumeState {
  // ... 其他状态
  pendingChanges: boolean;      // 是否有待同步的变更
  lastSyncedAt: number;         // 上次同步时间戳
  offlineQueue: Change[];     // 离线操作队列
}
```

**2. Change 对象结构**

Automerge 的每个变更包含：
- `hash`：唯一操作ID
- `message`：变更描述
- `timestamp`：操作时间
- `actorId`：操作者ID

```typescript
interface Change {
  hash: string;        // 操作唯一标识
  message: string;     // 变更消息
  timestamp: number;  // 时间戳 - 用于判断离线期间
  actorId: string;    // 操作者ID
  ops: Op[];          // 具体操作列表
}
```

**3. 离线操作检测逻辑**

```typescript
// 判断是否为离线期间的操作
function isOfflineOperation(change: Change): boolean {
  const offlineStart = navigator.onLine ? null : Date.now();

  // 如果当前离线，时间戳在离线开始之后视为离线操作
  if (!navigator.onLine && change.timestamp >= offlineStart!) {
    return true;
  }

  // 或者变更时间戳晚于上次同步时间，且未收到服务器确认
  return change.timestamp > lastSyncedAt && !change.synced;
}
```

**4. 离线同步流程**

```
用户离线编辑
    ↓
写入本地 Automerge 文档 + 标记 pendingChanges = true
    ↓
存入 offlineQueue 数组
    ↓
网络恢复后
    ↓
批量同步到 Supabase（通过 Realtime 或 HTTP）
    ↓
服务器确认 → 清除 pendingChanges + 更新 lastSyncedAt
```

**5. 当前实现方式**

GResume 采用 **简历ID前缀（local-）** 判定离线模式，而非显式的时间戳：
- `isOfflineResumeId(resumeId)` 判断简历是否为离线模式
- 离线模式下直接写入 IndexedDB，不走云端同步
- `pendingChanges` 字段标识有待同步的变更（区别离线 vs 未同步到云端）

---

## 2. 系统内部如何判定离线和在线状态的？

## 答案

### 核心要点

GResume 判定离线/在线状态采用 **简历ID前缀 + 编辑模式状态** 的方式，而非依赖 `navigator.onLine` API。核心逻辑：

1. **ID 前缀判定**：`local-` 开头 = 离线简历
2. **模式状态字段**：`mode: 'online' | 'offline' | null`
3. **变更标记**：`pendingChanges: boolean` 标识有待同步的变更

### 详细说明

**1. 简历ID判定（离线简历识别）**

```typescript
// src/lib/offline-resume-manager.ts:237-239
export function isOfflineResumeId(resumeId: string): boolean {
  return resumeId.startsWith('local-')
}
```

- `local-` 前缀的简历ID → 离线模式
- 云端简历ID（非 `local-` 开头）→ 在线模式

**2. Store 中的模式状态**

```typescript
// src/store/resume/form.ts:21,40
type EditorMode = 'online' | 'offline' | null

interface ResumeState {
  // ...
  mode: EditorMode                    // 当前编辑模式
  pendingChanges: boolean          // 是否有待同步变更
  lastSyncTime: number | null      // 上次同步时间
  isSyncing: boolean             // 是否正在同步
  syncError: string | null      // 同步错误信息
}
```

**3. 模式切换逻辑**

```typescript
// src/store/resume/form.ts:370-378
const setCurrentResumeId = (resumeId: string | null) => {
  // ...
  const mode = isOfflineResumeId(resumeId) ? 'offline' : 'online'
  set({
    currentResumeId: resumeId,
    mode,
    // 离线模式不进行同步操作
    pendingChanges: isOfflineResumeId(resumeId) ? false : state.pendingChanges
  })
}
```

**4. 离线与在线的同步差异**

| 场景 | 离线模式 | 在线模式 |
|------|----------|----------|
| 数据存储 | IndexedDB | Supabase 云端 |
| 同步触发 | 写入 IndexedDB | Automerge CRDT + Supabase |
| 标记 | `mode = 'offline'` | `mode = 'online'` |
| pendingChanges | 始终 `false` | 有变更时 `true` |

**5. 为什么不用 navigator.onLine？**

GResume **没有使用** 浏览器原生的 `navigator.onLine` API，原因：

1. **设计理念**：离线优先 + 渐进式增强
   - 区分"离线简历"（故意不上传）和"网络中断"（临时离线）
   - 用户可以主动创建离线简历，与网络状态无关

2. **用户体验**：离线简历是核心功能
   - 用户无需联网即可创建、编辑简历
   - 登录后可批量迁移到云端

3. **简化逻辑**：用ID前缀代替网络检测
   - 无需监听网络事件
   - 无需处理网络状态变化边界情况

---

## 3. 发起人A向协作者B和C发送了协作链接，此时A网络延迟断开链接，那B和C也会断开吗？如果B和C其中一个断开链接，会影响到A和其他人的协作通道吗？

## 答案

### 核心要点

GResume 的协作通道采用 **无中心化 P2P 架构**，每个参与者的连接是**独立的**，不存在"主从关系"：

1. **连接独立**：A、B、C 各自连接到同一个 Supabase Realtime Channel，但彼此独立
2. **断开不影响他人**：任意一方网络断开/主动离开，不会导致其他参与者断开
3. **去中心化**：没有"房主"概念，所有参与者平等

### 详细说明

**1. 协作通道架构**

```
┌─────────────────────────────────────────────────┐
│  Supabase Realtime Channel                       │
│  Channel Name: automerge:resume:{resumeId}:{sessionId} │
│                                                  │
│   ┌──────┐   ┌──────┐   ┌──────┐            │
│   │  A   │◄──┼──►  B  │◄──┼──►  C  │            │
│   └──────┘   └──────┘   └──────┘            │
│      │           │           │                  │
│      └───────────┴───────────┘                  │
│              CRDT 同步                         │
└─────────────────────────────────────────────────┘
```

- Channel 名称格式：`automerge:resume:{resumeId}:{sessionId}`
- 每个参与者独立创建 `SupabaseNetworkAdapter`
- 参与者通过 Supabase Presence 机制互相发现

**2. 断开连接的代码逻辑**

```typescript
// src/lib/automerge/collaboration/supabase-network-adapter.ts:193-205
this.channel?.on('presence', { event: 'leave' }, ({ leftPresences }) => {
  leftPresences.forEach((presence: any) => {
    const remotePeerId = presence.key || presence.peerId || presence.metadata?.peerId

    if (remotePeerId && String(remotePeerId) !== String(this.peerId)) {
      this.emit('peer-disconnected', {
        peerId: String(remotePeerId) as unknown as PeerId,
      })

      this.callbacks.onPeerLeave?.({ peerId: String(remotePeerId) })
    }
  })
})
```

- 监听 `presence.leave` 事件
- 当某参与者离开时，向其他参与者广播 `peer-disconnected` 事件
- **不执行任何断开其他参与者连接的操作**

**3. 参与者离开的 UI 反馈**

```typescript
// src/lib/collaboration/session/callbacks.ts:32-39
onPeerLeave: ({ peerId }) => {
  setState(state => ({
    participants: removeParticipant(state.participants, peerId),
  }))

  if (peerId !== adapterPeerIdRef.current) {
    toast.info('协作者已离开', { description: `Peer ${peerId.slice(-4)}` })
  }
}
```

- 只是从参与者列表中移除该用户
- 显示 toast 通知
- **不会断开其他人的连接**

**4. 场景分析**

| 场景 | A 的状态 | B 和 C 的状态 | 结论 |
|------|----------|---------------|------|
| A 网络断开 | A 的 Realtime 连接断开 | B、C 继续在 channel 中 | B、C 不受影响 |
| A 网络恢复后重新加入 | A 重新连接 | 收到 A 重新加入通知 | 无缝恢复 |
| B 主动离开 | 保留在 channel | C 继续在 channel 中 | A、C 不受影响 |
| B 网络中断 | B 的连接断开 | A、C 继续协作 | 其他人无感知 |

---

## 4. 协作链接是怎么生成的？有效期多久？

## 答案

### 核心要点

GResume 的协作链接通过 **URL 参数** 携带 Session ID 生成：
1. **链接格式**：`{origin}/resume/editor?resumeId={id}&collabSession={sessionId}`
2. **Session ID**：16位随机字符串，由 `crypto.randomUUID()` 生成
3. **有效期**：**无过期时间**，但仅存在于 sessionStorage 中

### 详细说明

**1. 链接生成代码**

```typescript
// src/lib/collaboration/shared/session.ts:3-21
export function createCollaborationSessionId() {
  // 生成16位随机字符串（去掉UUID横杠）
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

export function buildCollaborationShareUrl(
  resumeId: string,
  sessionId: string,
  documentUrl?: string,
) {
  const url = new URL(`${window.location.origin}/resume/editor`)
  url.searchParams.set('resumeId', resumeId)
  url.searchParams.set('collabSession', sessionId)  // 核心参数

  if (documentUrl) {
    url.searchParams.set('docUrl', documentUrl)
  }

  return url.toString()
}
```

**2. 链接结构**

| 参数 | 说明 | 示例 |
|------|------|------|
| `resumeId` | 简历ID | `abc123-def456` |
| `collabSession` | 协作会话ID | `a1b2c3d4e5f6g7h8` |
| `docUrl` | 文档URL（可选） | `https://xxx.supabase.co/...` |

**3. Session Role 存储**

```typescript
// src/lib/collaboration/session/storage.ts
const STORAGE_KEY = 'resume:collaboration:sessions'

interface StoredSession {
  sessionId: string
  resumeId: string
  userId: string
  role: 'host' | 'guest'
}
```

- 存储在 **sessionStorage**（页面关闭后清除）
- 存储用户的角色（host/guest），用于刷新后恢复

**4. 有效期分析**

| 维度 | 结论 |
|------|------|
| **技术层面** | **无过期时间**（Session ID 本身不过期） |
| **产品层面** | 发起者"停止共享"后链接失效 |
| **浏览器层面** | 关闭 Tab 后 sessionStorage 清除 |

---

## 4.1 协作链接的安全性是否有考虑？

### 核心要点

GResume 的协作链接**没有严格的访问控制**，采用"知道链接即可访问"的设计：

1. **需要登录**：使用协作功能必须先登录（验证用户身份）
2. **无权限验证**：链接不携带 token 或签名，任何人拿到链接都能加入
3. **URL参数裸奔**：Session ID 以明文形式存在于 URL 参数中

### 详细说明

**1. 协作的前提条件**

```typescript
// src/pages/resume/editor/hooks/useCollaborationPanelValue.ts:53-58
const canStartSharing = Boolean(
  activeResumeId &&
  currentUser &&           // 必须登录
  !collabDisabledReason &&
  !isCollabConnecting
)
```

- 必须已登录（`currentUser` 存在）
- 协作者也必须登录

**2. 安全性现状**

| 安全维度 | 现状 | 说明 |
|---------|------|------|
| **链接加密** | ❌ | Session ID 是16位随机字符串，无签名/加密 |
| **权限验证** | ❌ | 不检查用户是否是简历所有者 |
| **访问控制** | ❌ | 无黑名单/白名单机制 |
| **IP限制** | ❌ | 无 IP 地理位置限制 |
| **有效期** | ❌ | 无时间过期（见问题4） |
| **单次使用** | ❌ | 可重复使用 |

**3. 当前的安全措施**

```
唯一的安全措施：
├── 1. 需要登录才能使用协作
├── 2. Supabase Realtime 有频道概念（隔离不同简历）
└── 3. Session ID 随机生成（不可预测）
```

**4. 为什么这样设计？**

1. **产品定位**：协作链接是"私密分享"，类似 Google Docs 的邀请制
2. **简化用户体验**：无需配置权限，点击链接直接加入
3. **无后端复杂度**：不需要存储和管理访问令牌

---

## 5. 登陆以及身份验证这一块是怎么设计的？

## 答案

### 核心要点

GResume 使用 **Supabase Auth** 实现登录认证：

1. **登录方式**：邮箱 + 密码
2. **用户信息**：Supabase 管理用户表
3. **Token 结构**：JWT（access_token + refresh_token）
4. **状态管理**：React Hook + onAuthStateChange 监听

### 详细说明

**1. 登录 API**

```typescript
// src/lib/supabase/user/auth.ts
export async function SignUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function SignInWithEmailAndPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function SignOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

**2. 用户状态 Hook**

```typescript
// src/hooks/use-current-user.ts
export default function useCurrentUser() {
  const [auth, setAuth] = useState<User>()

  useEffect(() => {
    // 1. 首次加载获取 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user)
    })

    // 2. 订阅认证状态变化
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user)  // 登录/登出/token刷新 自动更新
    })

    return () => subscription.unsubscribe()
  }, [])

  return auth
}
```

**3. Supabase 客户端配置**

```typescript
// src/lib/supabase/client.ts
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    realtime: {
      heartbeatIntervalMs: 30000,
      reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000),
    },
  }
)
```

### 5.2 Token 刷新机制

**核心要点**

GResume 使用 **Supabase 内置的 Token 刷新机制**，无需手动处理：

1. **Supabase 自动刷新**：客户端库自动处理 access token 刷新
2. **Refresh Token 存储**：存储在 HTTP-only cookie 或 localStorage
3. **onAuthStateChange 监听**：状态变化时自动同步

**Token 流程图**

```
登录成功
    ↓
Supabase 返回 session
    ├── access_token（短期，通常1小时）
    └── refresh_token（长期）
    ↓
每次 API 请求携带 access_token
    ↓
Token 快过期时
    ↓
Supabase 自动用 refresh_token 换取新的 access_token
    ↓
onAuthStateChange('TOKEN_REFRESHED', session)
    ↓
继续使用新的 access_token
```

---

### 5.3 JWT 和 Cookie 认证的区别

| 维度 | Cookie | JWT |
|------|-------|-----|
| **存储位置** | 浏览器（自动发送） | 客户端手动存储和发送 |
| **状态管理** | 有状态（服务端记录） | 无状态（信息自包含） |
| **适用场景** | 同源请求 | 跨域/API 调用 |
| **安全性** | CSRF 风险 | XSS 风险 |

**GResume 采用混合模式**：Supabase 认证（本质 JWT）+ 客户端库自动管理

---

### 5.4 localStorage vs SessionStorage

| 维度 | localStorage | sessionStorage |
|------|--------------|----------------|
| **生命周期** | 永久（手动清除） | 页面会话结束清除 |
| **作用域** | 同一浏览器、同一域名 | 同一标签页 |
| **容量** | 约 5-10MB | 约 5-10MB |

**GResume 中使用 sessionStorage**：协作会话信息（页面关闭后自动清除，更安全）

---

## 6. 实时协作的冲突有哪些是如何解决？并且同步到本地和多个协作者的端上的？

## 答案

### 核心要点

GResume 使用 **Automerge (CRDT)** 实现实时协作冲突解决：

1. **CRDT 理论**：无冲突合并（Last-Writer-Wins / 按操作类型合并）
2. **四层同步架构**：Content → Session → UI → Cursor
3. **Heads 机制**：通过操作历史（Heads）检测和合并冲突

---

### 1. 什么是 CRDT？

**CRDT (Conflict-free Replicated Data Type)**：无冲突复制数据类型

- 每个客户端独立处理操作
- 操作可以以任意顺序应用
- 最终结果一致（

---

### 2. Automerge 的冲突解决策略

| 数据类型 | 策略 | 说明 | 示例 |
|----------|------|------|------|
| **Text** | 按位置 + ID 合并 | 文本编辑 | 简历描述 |
| **Map** | Last-Writer-Wins | 最后写入胜出 | 基本信息 |
| **List/Array** | 按索引 + ID 合并 | 列表操作 | 工作经历 |
| **Set** | 并集合并 | 集合操作 | 技能标签 |
| **Counter** | 加法合并 | 计数累加 | 访问量 |

**Text 冲突解决**
```
A 的操作：在"热爱技术"后插入"，擅长前端开发"
B 的操作：在"热爱技术"前插入"熟练掌握"

结果：个人积极向上，熟练掌握，热爱技术，擅长前端开发。
✅ 自动按位置合并，保留双方内容
```

**Map 冲突解决**
```
A 修改：basics.phone = "13800001111"
B 修改：basics.email = "a@b.com"

结果：两者都保留 ✅

A 和 B 同时修改同一字段：
basics.name = "张三" vs "李四" → LWW，时间戳最晚的胜出
```

**List 冲突解决**
```
A 操作：push(工作B)
B 操作：push(工作C)

结果：work_experience = [工作A, 工作B, 工作C] ✅
```

---

### 3. GResume 的四层同步架构

```
┌─────────────────────────────────────────────────────┐
│           GResume 协作同步架构                    │
├─────────────────────────────────────────────────────┤
│  Layer 1: Content（简历内容 - CRDT）              │
│  位置：src/lib/automerge/*                       │
│  目的：多端文档最终一致                           │
├─────────────────────────────────────────────────────┤
│  Layer 2: Session（参与者会话状态）               │
│  位置：src/lib/collaboration/session/*          │
│  目的：加入/离开、在线状态                        │
├─────────────────────────────────────────────────────┤
│  Layer 3: UI（界面状态同步）                     │
│  位置：src/lib/collaboration/ui/*              │
│  目的：抽屉、标签页、滚动位置、主题              │
├─────────────────────────────────────────────────────┤
│  Layer 4: Cursor（光标位置）                    │
│  位置：src/lib/collaboration/cursor/*          │
│  目的：实时显示其他人的鼠标位置                   │
└─────────────────────────────────────────────────────┘
```

---

### 4. 三端同步流程

**Step 1：A 发起协作，生成 Channel**

```
A 开启协作
    ↓
创建 Session ID
    ↓
连接 Supabase Channel
    ↓
B、C 加入 Channel
    ↓
三方互相发现（Presence）
```

**Step 2：A 编辑，广播给 B 和 C**

```
A 编辑"工作经历"
    ↓
doc.change(doc => { ... })
    ↓
生成 Change + Heads
    ↓
通过 Channel 广播
    ↓
B 和 C 分别解码、合并、更新
```

**Step 3：三人同时断网场景**

```
A 断网 → 编辑：工作A
B 断网 → 编辑：工作B
C 断网 → 编辑：工作C

三人陆续上线后，Automerge 自动合并：
work_experience = [原工作, 工作A, 工作B, 工作C]
✅ 三端最终一致
```

---

### 5. 本地存储与多端同步

**本地存储（IndexedDB）**

```typescript
// Automerge 使用 IndexedDB 存储本地文档
const repo = new Repo({
  storage: new IndexedDBStorageAdapter(),
})
```

**同步到 Supabase 云端**

```typescript
// 保存文档快照 + 操作历史（Heads）
await supabase.from('automerge_documents').upsert({
  resume_id: this.resumeId,
  binary: Automerge.save(doc),
  heads: Automerge.getHeads(doc),
  updated_at: new Date().toISOString(),
})
```

**架构图**

```
┌─────────┐     Realtime      ┌─────────┐
│  客户端 A│ ◄─────────────►│ 客户端 B│
│         │                │         │
│ IndexedDB              │  (无本地存储)│
└─────────┘                └─────────┘
     │                          │
     └──────────┬──────────────┘
                │
         ┌─────▼─────┐
         │ Supabase  │
         │ Realtime │
         └─────────┘
                │
         ┌─────▼─────┐
         │ Cloud DB  │
         │ (快照)   │
         └─────────┘
```

---

### 注意事项

- **最终一致性**：不是实时一致，而是最终一致（通常毫秒级）
- **无用户可见冲突**：冲突在底层自动解决，用户无感知
- **Heads 作用**：记录操作历史，用于增量同步和冲突解决
- **Offline 场景**：离线编辑后重新上线，会自动合并到最新状态

---

## 7. 离线后操作到重连恢复并同步的完整流程是怎样的？如果离线期间有相当多次的操作和在线版本相差甚远，是怎么处理和恢复的，是否有缓存或历史版本等机制？

## 答案

### 核心要点

GResume 的离线恢复和同步机制包含三个层面：

1. **Automerge 自动合并**：通过 Heads 差异检测自动合并
2. **云端快照**：Supabase 存储文档快照
3. **历史版本**：支持版本回溯（resume_config_versions 表）

---

### 1. 离线期间的本地操作

**离线时的处理**：

```
用户离线编辑
    ↓
写入本地 Automerge 文档（IndexedDB）
    ↓
记录本地 Change + Heads
    ↓
标记 pendingChanges = true
    ↓
下次网络恢复后自动同步
```

**本地存储（IndexedDB）**：

```typescript
// src/lib/automerge/repo/repo-instance.ts
const repo = new Repo({
  storage: new IndexedDBStorageAdapter(),
  // 文档持久化到 IndexedDB
})
```

- 离线期间所有操作先写入本地 IndexedDB
- Automerge 在本地维护完整的变更历史（Heads）

---

### 2. 重连恢复流程

**完整流程图**：

```
┌─────────────────────────────────────────────────────────┐
│                   离线 → 重连 → 同步                   │
└─────────────────────────────────────────────────────────┘

Step 1: 网络恢复检测
    ↓
    检测到 Supabase Channel 可用
    ↓
Step 2: 拉取云端最新状态
    ↓
    fetchSnapshotRow() → 获取云端 binary + heads
    ↓
Step 3: 导入云端文档
    ↓
    repo.import(bytes) → 获取云端 Heads
    ↓
Step 4: Automerge 自动合并
    ↓
    本地 Heads vs 云端 Heads → 计算差异 → 合并
    ↓
Step 5: 生成新快照
    ↓
    合并后的新状态 → 保存到云端
    ↓
Step 6: UI 更新
    ↓
    触发 React 渲染 → 显示最终内容
```

**代码实现**：

```typescript
// src/lib/automerge/document/persistence.ts:50-76
async loadPersistedHandle(repo: Repo): Promise<DocHandle<AutomergeResumeDocument> | null> {
  // 1. 拉取云端快照
  const snapshot = await this.fetchSnapshotRow()

  if (!snapshot?.document_data) {
    return null
  }

  // 2. 解码为二进制
  const bytes = decodeDocumentData(snapshot.document_data)

  // 3. 导入到本地 Automerge
  const handle = repo.import<AutomergeResumeDocument>(bytes)
  await handle.whenReady()

  // 4. 本地自动合并（通过 Heads 差异）
  return handle
}
```

---

### 3. 离线期间大量操作的处理

**场景**：离线编辑 50 次，与云端差异甚远

```
离线期间的本地修改：
┌──────────────────────────────────────┐
│  版本 1 → 2 → 3 → ... → 50       │
│  每次操作记录在本地 Heads 中          │
└──────────────────────────────────────┘
              ↓
        重连时自动合并
              ↓
云端版本 + 本地 50 次操作
              ↓
         Automerge 合并算法
              ↓
┌──────────────────────────────────────┐
│  最终状态 = 合并后的结果            │
│  所有操作都被保留                  │
└──────────────────────────────────────┘
```

**Automerge 的合并特性**：
- 不需要逐个应用操作
- 基于 Heads 计算差异，一次性合并
- 保留所有有效修改

---

### 4. 历史版本机制

**版本表设计**：

```typescript
// src/lib/supabase/resume/history.ts
interface ResumeHistoryVersion {
  id: number
  resume_id: string
  version_no: number          // 版本号（自增）
  version_name: string       // 版本名（手动/自动）
  description: string       // 描述
  snapshot: ResumeSnapshot // 完整快照
  created_at: string       // 创建时间
  source_type: 'manual' | 'autosave' | 'restore' | 'ai_optimize'
}
```

**版本操作**：

| 操作 | 说明 |
|------|------|
| **创建版本** | 手动保存、自动保存（定时）、AI优化后 |
| **查看历史** | 列表展示、时间线 |
| **回溯版本** | 恢复到指定版本（自动备份当前） |
| **对比版本** | Diff 显示差异 |

---

## 8. 如果引入AI来解决操作冲突，该如何设计（不破坏原有架构基础上进行优化）？

## 答案

### 核心要点

在 Automerge 基础上引入 AI 辅助冲突解决，核心思路是：

1. **保持 CRDT 不变**：AI 仅作为决策建议层
2. **冲突检测**：识别可能的语义冲突
3. **智能合并建议**：由用户确认而非自动合并
4. **无感升级**：不改变现有同步流程

---

### 1. AI 冲突解决的整体架构

```
┌─────────────────────────────────────────────────────────────┐
│              引入 AI 的协作架构（灰色为新增模块）             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  客户端 A  │    │  客户端 B  │    │  客户端 C  │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘          │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Automerge Layer（原有 CRDT）             │    │
│  │  • 本地合并  • Heads 同步  • 最终一致              │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                               │
│                         ▼                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │         AI Conflict Analyzer（新增）            │    │
│  │  配置层级冲突检测  • 意图分析  • 合并建议生成    │    │
│  └──────────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │      User Decision Layer（用户确认）             │    │
│  │  • 展示冲突选项  • 用户选择  • 确认执行        │    │
│  └─────────────────────────────────────────────────┘    │
│                            │                            │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Supabase Layer（存储）               │    │
│  │  • 快照存储  • 版本历史  • 同步             │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. 冲突类型与 AI 处理策略

| 冲突类型 | 示例 | AI 处理策略 |
|----------|------|-----------|
| **语义冲突** | A 修改"薪资"为 10k，B 修改为 15k | 分析职位市场行情，给出建议范围 |
| **重复内容** | A 和 B 都添加了相同技能 | 检测重复，询问保留哪个 or 合并 |
| **矛盾信息** | A 写"2024 毕业"，B 写"2023 毕业" | 联系上下文，判断时间线错误 |
| **格式不一致** | A 用 Markdown，B 用纯文本 | 统一格式化为一种风格 |
| **删除冲突** | A 删除某段，B 修改了这段 | 询问是否恢复并应用 B 的修改 |

---

### 3. AI 模块设计

**3.1 冲突检测服务**

```typescript
// src/lib/ai/conflict-analyzer.ts
interface ConflictAnalysis {
  type: 'semantic' | 'duplicate' | 'contradiction' | 'format' | 'delete'
  severity: 'low' | 'medium' | 'high'
  description: string
  options: ConflictOption[]
}

interface ConflictOption {
  value: any
  reason: string
  score: number  // AI 置信度
}

export async function analyzeConflicts(
  localDoc: AutomergeResumeDocument,
  remoteDoc: AutomergeResumeDocument,
): Promise<ConflictAnalysis[]> {
  // 1. 比较本地和远程文档
  // 2. 检测语义差异
  // 3. 生成冲突报告
}
```

**3.2 改写建议服务**

```typescript
// src/lib/ai/merge-suggester.ts
export async function suggestMerge(
  conflict: ConflictAnalysis,
  context: { jobIntent?: JobIntent },
): Promise<ConflictOption[]> {
  // 根据上下文生成最佳选项
  // 例如：针对目标岗位调整薪资描述
}
```

**3.3 UI 层**

```tsx
// 冲突解决弹窗
function ConflictResolver({ conflicts, onResolve }) {
  return (
    <Dialog>
      <ConflictCard type={conflicts[0].type}>
        <Description>{conflict.description}</Description>

        {conflict.options.map(option => (
          <OptionButton
            onClick={() => onResolve(option.value)}
            confidence={option.score}
          >
            {option.value} - {option.reason}
          </OptionButton>
        ))}
      </ConflictCard>
    </Dialog>
  )
}
```

---

## 9. 项目出发点、应用面、产品交互过程及优化点

## 答案

### 1. 项目出发点

**GResume（Granular Resume）** 定位：智能简历创建平台

| 维度 | 说明 |
|------|------|
| **核心目标** | 让学生/求职者高效创建、编辑、优化简历 |
| **解决痛点** | 简历信息散落、不会优化、AI ATS 适配困难、无法离线编辑 |
| **差异化** | 离线优先 + AI ATS 优化 + 多人协作 + 专业导出 |

---

### 2. 应用场景

| 场景 | 用户 | 核心功能 |
|------|------|----------|
| **日常维护** | 在校生/职场人 | 离线创建、多版本管理、长期维护 |
| **求职投递** | 求职者 | AI 优化、岗位匹配、一键投递 |
| **协作编辑** | 求职者 + 朋友/导师 | 实时协作、版本对照 |
| **企业招聘** | HR | 简历解析、ATS 对接 |

---

### 3. 产品交互流程

**3.1 核心页面**

```
首页（仪表盘）
    │
    ├── 创建简历 → 编辑器
    │           ├── 12 模块编辑
    │           ├── 实时预览
    │           └── 协作面板
    │
    ├── AI 优化
    │           ├── ATS 评估
    │           ├── 优化建议
    │           └── 一键应用
    │
    ├── 求职追踪
    │           ├── 投递记录
    │           ├── 进度管理
    │           └── 企业互动
    │
    └── 模板管理
                ├── 模板选择
                └── 导出 PDF
```

**3.2 典型用户旅程**

```
┌──────────────────────────────────────────────────────────┐
│               用户旅程：大学生求职                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. 注册登录                                            │
│     ↓                                                   │
│  2. 首次创建简历                                        │
│     • 选择空白/模板                                      │
│     • 离线优先（无需登录也能编辑）                         │
│     ↓                                                   │
│  3. 填写 12 个模块                                     │
│     • 基本信息 / 求职意向 / 教育背景                      │
│     • 工作经历 / 项目经历 / 校园经历                      │
│     • 技能 / 证书 / 荣誉                              │
│     • 自我评价 / 兴趣爱好                               │
│     ↓                                                   │
│  4. AI ATS 优化                                         │
│     • 评估报告（格式/内容/关键词）                       │
│     • 优化建议（改写/量化/润色）                        │
│     • 一键应用                                          │
│     ↓                                                   │
│  5. 邀请朋友协作                                        │
│     • 生成分享链接                                      │
│     • 实时同步编辑                                      │
│     • 协作者光标可见                                    │
│     ↓                                                   │
│  6. 导出投递                                           │
│     • PDF 导出（网页/本地）                              │
│     • 简历追踪                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 4. 优化点分析

**4.1 功能层面**

| 模块 | 当前状态 | 优化方向 |
|------|---------|----------|
| **离线** | ✅ 基础离线编辑 | 支持多端合并冲突解决 |
| **协作** | ✅ 基础实时编辑 | 支持部分字段锁定/权限控制 |
| **AI** | ✅ ATS 评估 + 改写 | 大模型润色、岗位推荐 |
| **导出** | ✅ PDF | 支持 Word/JSON/图片多格式 |
| **追踪** | ✅ 基础投递记录 | 支持邮件追踪、企业对接 |

**4.2 技术层面**

| 维度 | 优化方向 |
|------|----------|
| **性能** | 大文档分片加载、虚拟列表 |
| **安全** | 协作链接加密、权限控制 |
| **体验** | 离线操作队列、断点续传 |
| **成本** | Supabase 边缘计算、CDN 优化 |

**4.3 产品层面**

| 方向 | 说明 |
|------|------|
| **模板市场** | 用户自制模板、模板商店 |
| **企业版** | ATS 批量管理、团队协作 |
| **移动端** | 小程序/App |
| **开放 API** | 第三方简历导入 |

---

### 5. 项目架构总结

```
GResume 技术栈
├── Frontend: React 19 + TypeScript + Vite
├── UI: Radix + Tailwind + Shadcn
├── Editor: Tiptap (ProseMirror)
├── State: Zustand
├── Collab: Automerge (CRDT) + Supabase Realtime
├── AI: DeepSeek + Supabase Edge Functions
└── Backend: Supabase (PostgreSQL + Auth + Storage)
└── Export: html2pdf + 浏览器打印 API
```

**核心理念**：
- **离线优先**：无需登录即可创建、编辑
- **渐进增强**：联网后自动同步
- **智能辅助**：AI 赋能 ATS 优化
- **协作透明**：CRDT 无感同步

---

## 10. 简历导出这块怎么做的？

## 答案

### 核心要点

GResume 的简历导出使用 **浏览器原生打印 API + react-to-print 库**，支持两种格式：

1. **PDF 导出**：调用浏览器打印对话框，使用系统打印或"另存为PDF"
2. **Word 导出**：生成 HTML 包装的 .doc 文件

---

### 1. 技术选型

```
┌───────────────────────────────────────────────────┐
│              GResume 导出方案                   │
├───────────────────────────────────────────────────┤
│                                                   │
│  PDF 导出                                          │
│  └── react-to-print (React 打印封装库)          │
│      └── window.print() (浏览器原生 API)        │
│          └── "另存为 PDF" / 物理打印机      │
│                                                   │
│  Word 导出                                         │
│  └── file-saver (保存文件)                   │
│      └── HTML 包装为 .doc (MIME: msword)     │
│                                                   │
└───────────────────────────────────────────────────┘
```

**为什么不用 html2pdf.js？**
- 浏览器原生打印质量更高（矢量字体、精确分页）
- 无需额外依赖 PDF 库
- 支持物理打印机直接输出

---

### 2. PDF 导出流程

**2.1 核心代码**

```typescript
// src/pages/resume/editor/index.tsx:36-47
import { useReactToPrint } from 'react-to-print'

const resumeRef = useRef<HTMLDivElement>(null)

const handlePrint = useReactToPrint({
  contentRef: resumeRef,
  documentTitle: resumeName ? `${resumeName}-简历` : '我的简历',
})

// 点击导出按钮
const handleExportPdf = async () => {
  handlePrint()  // 触发浏览器打印对话框
}
```

**2.2 导出流程**

```
导出 PDF
    ↓
handlePrint()
    ↓
react-to-print 获取 DOM 内容
    ↓
浏览器打印对话框
    ↓
用户选择"另存为 PDF" 或 打印机
```

**2.3 Word 导出**

```typescript
// src/store/resume/export.ts:47-89
exportToDoc: () => {
  const rawHtml = firstPage.innerHTML

  // 清理脚本和事件
  const contentHtml = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')

  const html = createResumeDocHtml(contentHtml, {
    baseFontSize: fontSize,
    fontFamily: getFontFamilyCSS(fontConfig.fontFamily),
    // ...
  })

  const blob = new Blob([html], {
    type: 'application/msword',
  })

  saveAs(blob, `${resumeName}-简历.doc`)
}
```

---

### 3. 打印样式

**3.1 CSS 媒体查询**

```css
/* src/index.css */
@media print {
  .no-print {
    display: none !important;
  }

  .resume-page {
    page-break-after: always;
  }

  @page {
    size: A4;
    margin: 15mm;
  }
}
```

**3.2 简历分页**

```typescript
// src/components/resume/paged-resume-shell.tsx
// 使用 CSS 控制分页
.resume-page {
  width: 210mm;
  min-height: 297mm;
  page-break-after: always;
}
```

---

## 11. 经过富文本编辑后，简历的内容是如何实时展示渲染的？

## 答案

### 核心要点

GResume 使用 **Tiptap 编辑器 + html-react-parser 渲染** 实现富文本的编辑和展示：

1. **编辑层**：Tiptap（基于 ProseMirror）
2. **存储层**：HTML 字符串存入 Zustand Store + Automerge
3. **渲染层**：html-react-parser 解析为 React 组件

---

### 1. 技术栈

```
┌─────────────────────────────────────────────────────┐
│              富文本编辑与渲染技术栈                   │
├─────────────────────────────────────────────────────┤
│                                                   │
│  编辑器：Tiptap                                    │
│  └── 基于 ProseMirror                              │
│  └── 支持 contenteditable                     │
│                                                   │
│  存储格式：HTML 字符串                            │
│  └── content = "<p>...</p>"                  │
│                                                   │
│  渲染器：html-react-parser                       │
│  └── 解析 HTML 为 React 组件                   │
│                                                   │
└─────────────────────────────────────────────────────┘
```

---

### 2. 编辑到存储

**2.1 表单组件（SelfEvaluationForm）**

```typescript
// src/pages/resume/editor/components/forms/SelfEvaluationForm.tsx
<SimpleEditor
  content={field.value || ''}
  onChange={(editor) => {
    // 获取 HTML
    field.onChange(editor.getHTML())
  }}
/>
```

**2.2 Store 更新**

```typescript
const subscription = form.watch((value) => {
  updateForm('self_evaluation', value as ShallowPartial<SelfEvaluationFormType>)
})
```

---

### 3. 存储到渲染

**3.1 模板中使用 html-react-parser**

```typescript
// src/pages/template/components/basic/Basic.tsx
import parser from 'html-react-parser'

function SelfEvaluationModule() {
  const { self_evaluation } = useResumeStore()

  return (
    <ProseBlock>
      {parser(self_evaluation.content)}
    </ProseBlock>
  )
}
```

**3.2 ProseBlock 组件**

```typescript
function ProseBlock({ children, style }) {
  const { font, spacing } = useResumeContext()

  return (
    <div
      className="prose"
      style={{
        fontSize: font.contentSize,
        lineHeight: spacing.proseLineHeight,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
```

---

### 4. 数据流图

```
┌─────────────────────────────────────────────────────┐
│           富文本数据流                              │
├─────────────────────────────────────────────────────┤
│                                                   │
│  Tiptap 编辑器                                     │
│  └── 键入内容                                     │
│      ↓                                            │
│  editor.getHTML() → "<p>Hello</p>"                │
│      ↓                                            │
│  Zustand Store                                    │
│  └── self_evaluation.content = "..."             │
│      ↓                                            │
│  Automerge 文档 → 云端同步                         │
│      ↓                                            │
│  html-react-parser                                │
│  └── parser("<p>Hello</p>")                      │
│      ↓                                            │
│  React 组件渲染                                   │
│      ↓                                            │
│  预览区显示                                       │
└─────────────────────────────────────────────────────┘
```

---

## 12. 简历内容这里一共有12个语义区块，可以支持拖拽排序，这个拖拽如何实现的？如果我想增加到13个语义区块，该怎么修改？

## 答案

### 核心要点

GResume 使用 **自定义 DragContext + 数组顺序** 实现拖拽排序：

1. **数据结构**： ORDERType[] 数组存储区块顺序
2. **拖拽实现**：自定义 DragContext（不依赖第三方库）
3. **状态管理**：Zustand Store + Automerge 同步

---

### 1. 12个语义区块定义

```typescript
// src/lib/schema/resume/form/index.ts:49-62
export const DEFAULT_ORDER: ORDERType[] = [
  'basics',                 // 基本信息
  'job_intent',            // 求职意向
  'application_info',      // 附件信息
  'edu_background',        // 教育背景
  'work_experience',      // 工作经历
  'internship_experience',// 实习经历
  'campus_experience',   // 校园经历
  'project_experience',   // 项目经历
  'skill_specialty',     // 专业技能
  'honors_certificates', // 荣誉证书
  'self_evaluation',    // 自我评价
  'hobbies',           // 兴趣爱好
]
```

---

### 2. 拖拽实现原理

**2.1 自定义 DragContext**

```typescript
// src/contexts/DragContext.tsx
interface DragContextValue {
  draggedItem: DragItem | null
  overIndex: number | null
  registerItem: (index: number, id: string, element: HTMLElement) => void
  startDrag: (index: number, id: string, startX: number, startY: number) => void
  endDrag: () => void
  updateOverIndex: (clientX: number, clientY: number) => void
}
```

**2.2 拖拽流程**

```
┌─────────────────────────────────────────────────────┐
│           拖拽排序流程                    │
├─────────────────────────────────────────────────────┤
│                                             │
│  1. 开始拖拽 (mousedown)             │
│     └── registerItem()                     │
│           ↓                             │
│  2. 拖拽中 (mousemove)             │
│     └── updateOverIndex() 计算新位置   │
│           ↓                             │
│  3. 结束拖拽 (mouseup)             │
│     └── 触发 onOrderChange()          │
│           ↓                             │
│  4. 更新 Store                    │
│     └── updateOrder(newOrder)         │
│           ↓                             │
│  5. 同步到 Automerge + 云端        │
│           ↓                             │
│  6. UI 响应式更新                 │
└─────────────────────────────────────────────────────┘
```

**2.3 侧边栏拖拽组件**

```typescript
// src/pages/resume/editor/components/sidebar/SidebarEditor.tsx
export function SidebarEditor({ order, onUpdateOrder }) {
  const orderDraggable = order.filter(id => id !== 'basics')  // basics 不可拖动

  return (
    <DraggableList
      items={orderDraggable}
      onOrderChange={order => onUpdateOrder(['basics', ...order])}
    >
      {/* ... */}
    </DraggableList>
  )
}
```

---

### 3. 扩展到13个区块

如果需要添加第13个语义区块（如"语言能力"），需要修改以下位置：

**3.1 定义区块类型**

```typescript
// src/lib/schema/resume/form/index.ts

// 添加新类型
export const DEFAULT_ORDER: ORDERType[] = [
  'basics',
  'job_intent',
  'application_info',
  'edu_background',
  'work_experience',
  'internship_experience',
  'campus_experience',
  'project_experience',
  'language',           // ← 新增：语言能力
  'skill_specialty',
  'honors_certificates',
  'self_evaluation',
  'hobbies',
]
```

**3.2 创建表单组件**

```typescript
// src/pages/resume/editor/components/forms/LanguageForm.tsx
export function LanguageForm() {
  const form = useForm()
  // ...表单逻辑
}
```

**3.3 注册路由**

```typescript
// src/pages/resume/editor/const.ts
export const ITEMS = [
  { id: 'basics', label: '基本信息', icon: UserIcon },
  // ...
  { id: 'language', label: '语言能力', icon: LanguageIcon },
]
```

**3.4 创建模板组件**

```typescript
// src/pages/template/components/basic/Basic.tsx
function LanguageModule({ data }: { data: ResumeSchema }) {
  const { language } = data
  // ...渲染逻辑
}
```

**3.5 添加 Store 默认值**

```typescript
// src/lib/schema/index.ts
export const DEFAULT_LANGUAGE: LanguageFormType = {
  items: [],
}
```

**3.6 注册 Automerge 文档**

```typescript
// src/lib/automerge/document/schema.ts
interface AutomergeResumeDocument extends PersistedResumeSnapshot {
  language?: LanguageFormType
}
```

---

### 4. 新增模块清单

| 步骤 | 文件 | 修改内容 |
|------|------|----------|
| 1 | schema/resume/form/index.ts | 添加到 ORDERType |
| 2 | schema/index.ts | 添加 DEFAULT 值 |
| 3 | editor/components/forms/LanguageForm.tsx | 创建表单组件 |
| 4 | editor/const.ts | 注册到 ITEMS |
| 5 | template/components/basic/Basic.tsx | 创建模板组件 |
| 6 | automerge/document/schema.ts | 类型定义 |

---

## 13. AI大模型分析后，推导过程是怎么设计展示出来的，怎么实现流式输出？

## 答案

### 核心要点

GResume 使用 **Server-Sent Events (SSE)** + **DeepSeek reasoning_content** 实现流式输出：

1. **后端**：Supabase Edge Function 返回 SSE 流
2. **前端**：for await 遍历流式数据
3. **展示**：ChainOfThought 组件展示推导过程

---

### 1. 技术架构

```
┌─────────────────────────────────────────────────────┐
│           AI 流式输出技术架构                        │
├─────────────────────────────────────────────────────┤
│                                                   │
│  前端请求                                          │
│  └── callLLM({ stream: true })                    │
│        ↓                                         │
│  Supabase Edge Function (llm-proxy)              │
│        ↓                                         │
│  DeepSeek API (SSE 流)                           │
│        ↓                                         │
│  返回 chunks                                     │
│        ├── content: "{"score": 85, ...}"          │
│        └── reasoning_content: "分析步骤..."        │
│                                                   │
│  前端处理                                         │
│  └── for await chunk of stream                     │
│        ├── 累加 content                          │
│        ├── 累加 reasoning                        │
│        └── 触发 onUpdate (节流)                  │
│                                                   │
│  UI 展示                                          │
│  └── ChainOfThought 组件                         │
└─────────────────────────────────────────────────────┘
```

---

### 2. 流式调用核心代码

**2.1 LLM 调用（src/lib/llm/call.ts）**

```typescript
import { Stream } from 'openai/streaming'

export async function callLLM(req: ChatCompletionCreateParams) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/llm-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ...req, stream: true }),
  })

  // 将 SSE 响应转换为 Stream 对象
  const streamData = Stream.fromSSEResponse(response, controller)

  return streamData
}
```

**2.2 流式处理（src/lib/llm/index.ts）**

```typescript
interface StreamUpdate {
  content?: string
  reasoning?: string
}

async function streamStructuredJson(req, onUpdate, options) {
  const stream = await callLLM(req)

  let fullContent = ''
  let fullReasoning = ''

  // 节流更新，避免频繁渲染
  const throttledUpdate = throttle((data) => {
    onUpdate(data)
  }, 100)

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta
    const content = delta?.content || ''
    const reasoning = delta?.reasoning_content || ''

    fullContent += content
    fullReasoning += reasoning

    throttledUpdate({
      content: fullContent,
      reasoning: fullReasoning,
    })
  }

  return { content: fullContent, reasoning: fullReasoning }
}
```

**2.3 前端调用**

```typescript
// src/pages/optimize/components/header/index.tsx
await runAtsStructured(resumeData, ({ content, reasoning }) => {
  if (reasoning) {
    setAnalysisState({ status: 'thinking', reasoning })
  }
  if (content) {
    setAnalysisState({ status: 'generating', content })
  }
})
```

---

### 3. 推导过程展示（ChainOfThought 组件）

```typescript
// src/components/ai/chain-of-thought.tsx
export function ChainOfThought({ open, children }) {
  return (
    <Collapsible open={open}>
      <CollapsibleTrigger>
        <BrainIcon />
        推导过程
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ChainOfThoughtStep({ label, status }) {
  return (
    <div className={statusStyles[status]}>
      <Icon className="size-4" />
      <div>{label}</div>
    </div>
  )
}
```

---

### 4. UI 展示效果

```
┌─────────────────────────────────────────────────────┐
│  ▼ 推导过程 (展开)                                 │
├─────────────────────────────────────────────────────┤
│  ● 步骤1: 分析简历结构          [已完成]            │
│  ● 步骤2: 提取关键信息           [已完成]            │
│  ◐ 步骤3: 评估 ATS 兼容性        [进行中]            │
│     └── reasoning_content 流式输出...             │
│  ○ 步骤4: 生成优化建议          [待处理]            │
└─────────────────────────────────────────────────────┘
```

---

### 5. 总结

| 层级 | 技术 |
|------|------|
| **传输协议** | Server-Sent Events (SSE) |
| **模型支持** | DeepSeek reasoning model |
| **内容分离** | content + reasoning_content |
| **前端渲染** | for await + throttle |
| **UI 组件** | ChainOfThought |
```

---

## 14. 自动保存是防抖来实现的吗？时间怎么确定？历史版本是怎么来保存实现的？

## 答案

### 核心要点

GResume 的自动保存使用 **Zustand + 防抖 + 定时器** 结合：

1. **自动保存**：延时防抖 + 定时自动保存
2. **历史版本**：手动保存 + 自动保存 + AI优化后保存

---

### 1. 自动保存机制

**1.1 防抖延时保存**

```typescript
// src/store/resume/form.ts:69-88
let syncTimer: ReturnType<typeof setTimeout> | null = null
let onlineSyncTimer: ReturnType<typeof setTimeout> | null = null

function scheduleOfflinePersist(flushFn: () => Promise<void>) {
  if (syncTimer) {
    clearTimeout(syncTimer)
  }
  syncTimer = setTimeout(() => {
    flushFn()
  }, SYNC_DELAY)  // 2秒防抖
}

function scheduleOnlinePersist(flushFn: () => Promise<void>) {
  if (onlineSyncTimer) {
    clearTimeout(onlineSyncTimer)
  }
  onlineSyncTimer = setTimeout(() => {
    flushFn()
  }, ONLINE_SYNC_DELAY)  // 3秒防抖
}
```

**1.2 保存触发时机**

| 类型 | 触发条件 | 延时 |
|------|----------|------|
| **离线模式** | 每次编辑操作 | 2秒 |
| **在线模式** | 每次编辑操作 | 3秒 |
| **定期保存** | 定时器触发 | 30秒 |

**1.3 核心流程**

```
用户编辑
    ↓
applyResumeChange()
    ↓
设置 pendingChanges = true
    ↓
scheduleOnlinePersist(syncToSupabase)
    ↓
延时 3 秒后触发
    ↓
保存到 Supabase
    ↓
设置 pendingChanges = false
```

---

### 2. 历史版本机制

**2.1 版本表结构**

```typescript
// src/lib/supabase/resume/history.ts
interface ResumeHistoryVersion {
  id: number
  resume_id: string
  version_no: number          // 版本号（自增）
  version_name: string       // 版本名
  description: string       // 描述
  snapshot: ResumeSnapshot // 完整快照
  created_at: string       // 创建时间
  source_type: 'manual' | 'autosave' | 'restore' | 'ai_optimize'
}
```

**2.2 版本保存时机**

| 时机 | source_type | 说明 |
|------|------------|------|
| 用户手动保存 | manual | 手动触发版本 |
| 自动保存 | autosave | 定时触发 |
| 版本恢复 | restore | 恢复前备份 |
| AI优化后 | ai_optimize | AI优化后自动保存 |

**2.3 版本查询**

```typescript
const versions = await supabase
  .from('resume_config_versions')
  .select('*')
  .eq('resume_id', resumeId)
  .order('version_no', { ascending: false })
```

---

### 3. 总结

| 功能 | 实现方式 | 延时 |
|------|----------|------|
| **自动保存** | 防抖（setTimeout） | 2-3秒 |
| **定期保存** | setInterval | 30秒 |
| **版本保存** | 插入数据库 | 实时 |

---

## 15. 协作会话通道是建立在什么上面的？和SSE的区别？

## 答案

### 核心要点

GResume 的协作会话使用 **Supabase Realtime**（基于 WebSocket），而不是 SSE：

1. **协作通道**：Supabase Realtime Channel（WebSocket）
2. **AI 流式输出**：Server-Sent Events（SSE）
3. **区别**：WebSocket 双向通信 vs SSE 单向推送

---

### 1. 协作通道架构

**1.1 基于 Supabase Realtime**

```typescript
// src/lib/automerge/collaboration/supabase-network-adapter.ts
export class SupabaseNetworkAdapter extends NetworkAdapter {
  private channel: RealtimeChannel | null = null
  private readonly channelName: string

  constructor(resumeId: string, sessionId: string) {
    this.channelName = `automerge:resume:${resumeId}:${sessionId}`
  }

  connect(peerId: PeerId) {
    this.channel = supabase.channel(this.channelName)
    this.registerSyncBroadcast()
    this.registerControlBroadcast()
    this.registerPresenceEvents()
    this.channel.subscribe()
  }
}
```

**1.2 Channel 名称格式**

```
automerge:resume:{resumeId}:{sessionId}

示例：
automerge:resume:abc123:session456
```

---

### 2. Supabase Realtime 的三种模式

| 模式 | 说明 | 用途 |
|------|------|------|
| **Broadcast** | 广播给同一频道的所有客户端 | CRDT 操作同步 |
| **Presence** | 跟踪客户端在线状态 | 协作者在线状态 |
| **Postgres Changes** | 监听数据库变化 | 云端数据变更 |

**2.1 Broadcast（广播）**

```typescript
// 发送
this.channel.send({
  type: 'broadcast',
  event: 'automerge-sync',
  payload: { senderId, targetId, message: '...' },
})

// 接收
this.channel?.on('broadcast', { event: 'automerge-sync' }, (payload) => {
  // 处理接收到的操作
})
```

**2.2 Presence（在线状态）**

```typescript
// 上线报道
this.channel?.track({
  peerId: String(this.peerId),
  metadata: { userId, userName, color },
})

// 监听加入
this.channel?.on('presence', { event: 'join' }, ({ newPresences }) => {
  // 协作者加入
})

// 监听离开
this.channel?.on('presence', { event: 'leave' }, ({ leftPresences }) => {
  // 协作者离开
})
```

---

### 3. WebSocket vs SSE 对比

| 维度 | Supabase Realtime（WebSocket） | Server-Sent Events（SSE） |
|------|------------------------------|-------------------------|
| **协议** | WebSocket | HTTP |
| **方向** | 双向通信 | 单向推送 |
| **使用场景** | 协作同步 | AI 流式输出 |
| **连接方式** | 长期保持 | 每次请求新建 |
| **示例** | 协作者 A → B 同步操作 | AI 逐步返回结果 |

**3.1 WebSocket（协作）**

```
┌─────────┐                                              ┌─────────┐
│  客户端 A│◄─────────────────►│ Supabase │◄───────────►│ 客户端 B│
│         │    WebSocket      │ Realtime │   WebSocket   │        │
│         │                  │ Channel  │              │        │
│  操作 A │─────────────────►│          │◄─────────────│ 操作 B  │
└─────────┘                  └──────────┘              └─────────┘
```

- **双向**：A 和 B 都可以主动发送
- **实时**：一方发送，另一方立即收到
- **持久**：连接保持不断

**3.2 SSE（AI 流式输出）**

```
┌─────────┐    HTTP 请求     ┌──────────┐    SSE 流      ┌─────────┐
│  前端   │─────────────────►│ llm-proxy │◄─────────────│ DeepSeek │
│        │    (POST)        │           │   (stream)    │          │
│        │◄─────────────────│          │◄─────────────│          │
│ 结果   │                 │           │ 逐步返回      │          │
└─────────┘                 └───────────┘              └─────────┘
```

- **单向**：只能服务端推送给前端
- **流式**：分块返回逐步渲染
- **短连接**：请求结束即断开

---

### 4. 总结对比表

| 特性 | 协作通道（Realtime） | AI 流式输出（SSE） |
|------|---------------------|-------------------|
| **协议** | WebSocket | HTTP + SSE |
| **连接** | 长连接 | 短连接 |
| **方向** | 双向 | 单向 |
| **触发** | 任意操作事件 | 请求-响应 |
| **应用** | 多人实时协作 | AI 逐步返回 |
| **库** | @supabase/supabase-js | openai/streaming |

---

### 5. 为什么这样设计？

| 场景 | 选择 WebSocket | 选择 SSE |
|------|---------------|----------|
| **协作** | 需要多端实时双向同步 | 不需要 |
| **AI** | 不需要服务端主动推送 | 需要流式返回结果 |
| **连接** | 长期保持 | 按需创建 |
| **复杂度** | 需要管理连接状态 | 相对简单 |