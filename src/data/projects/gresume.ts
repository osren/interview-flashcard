import { FlashCard, Chapter } from '@/types';

export const gresumeCards: FlashCard[] = [
  {
    id: 'gresume-crdt-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'CRDT',
    question: '为什么选择 CRDT 而不是 OT（Operational Transformation）？',
    answer: `CRDT vs OT 对比：

| 特性 | CRDT (Automerge) | OT (Google Docs) |
|------|-------------------|-------------------|
| 架构 | 可无中心服务器 | 依赖中心服务器 |
| 冲突处理 | 自动合并 | 需转换操作 |
| 实现复杂度 | 数学证明复杂 | 服务器逻辑复杂 |
| 离线支持 | 原生支持 | 困难 |
| 适用场景 | 离线优先、P2P | 实时协同 |

选 CRDT 的原因：
• 项目定位是离线优先的简历编辑器
• 简历编辑不需要实时协同
• CRDT 的最终一致性足够`,
    tags: ['GResume', 'CRDT', 'Automerge'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-crdt-conflict-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'CRDT冲突',
    question: '简历的复杂嵌套结构如何处理冲突？请举例',
    answer: `处理策略：

简历数据结构建模：
• 每个字段用唯一 ID 标识（不是索引）
• 列表元素删除/移动用 ID 映射

冲突示例：
用户 A：把"第一家公司"从"滴滴"改为"滴滴出行"
用户 B：在"第一家公司"后添加新公司

处理结果：
• A 的修改正确应用到"滴滴"这条记录
• B 添加的新记录成为新的 ID
• 两个操作不冲突，自动合并 ✅`,
    tags: ['GResume', 'CRDT', '冲突处理'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-offline-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: 'IndexedDB 断网续传是如何实现的？',
    answer: `核心流程：

1. 检测网络状态
   navigator.onLine + online/offline 事件

2. 离线期间
   • 所有操作写入 IndexedDB
   • 标记 synced: false
   • UI 正常响应（从 IndexedDB 读取）

3. 网络恢复
   • 按 timestamp 顺序同步 pending operations
   • 增量同步（只传变化的部分）
   • 同步完成后标记 synced: true`,
    tags: ['GResume', 'IndexedDB', '离线'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-sync-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '数据同步',
    question: '用户在断网期间进行了大量编辑，网络恢复后如何处理？',
    answer: `海量数据同步方案：

方案：增量快照 + 操作日志

1. 每 N 次操作做一次快照（存储完整状态）
2. 同步时传：最新快照 + 快照之后的操作日志
3. 服务器重放操作，合并到最新状态

关键优化：
• 请求大小限制：超过阈值分批同步
• 操作日志定期清理（合并旧操作为快照）
• 冲突处理：CRDT 自动合并，无需人工`,
    tags: ['GResume', '数据同步', 'CRDT'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-ats-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI集成',
    question: '为什么选择 Supabase Edge Functions 而不是传统 Serverless？',
    answer: `选型对比：

| 特性 | Supabase Edge Functions | 传统 Serverless |
|------|-------------------------|-----------------|
| 冷启动 | 极快（V8 isolates）| 较慢（容器启动）|
| 数据库集成 | 原生 | 需单独连接 |
| 边缘部署 | 自动全球分布 | 需配置 |
| 成本 | 按请求计费 | 按计算时间 |

解决的核心问题：
• API Key 安全（不暴露在前端）
• 数据库直连减少延迟
• 流式响应支持`,
    tags: ['GResume', 'Supabase', 'AI集成'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-ats-score-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'ATS评分',
    question: 'AI 给出的"可视化优化建议"是如何渲染的？',
    answer: `数据结构：
interface ATSAdvice {
  score: number;           // 0-100
  breakdown: {
    keywords: { score: number; missing: string[] };
    skills: { score: number; matched: string[]; missing: string[] };
  };
  suggestions: Array<{
    type: 'add' | 'remove' | 'modify';
    target: { section: string; field: string };
    original: string;
    suggested: string;
  }>;
}

渲染策略：
1. 分数用进度条展示
2. suggestions 根据 target 定位到简历对应位置
3. 用高亮 + tooltip 显示修改建议
4. 用户可一键应用建议`,
    tags: ['GResume', 'ATS', 'AI集成'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-arch-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '架构设计',
    question: '四层同步架构具体是哪四层？每层的职责是什么？',
    answer: `四层同步架构：

| 层级 | 名称 | 职责 |
|------|------|------|
| L1 | UI 交互层 | 用户操作 → 乐观更新 → 即时反馈 |
| L2 | 本地状态层 | Zustand 状态管理，暂存操作 |
| L3 | CRDT 同步层 | Automerge 文档变更，自动合并冲突 |
| L4 | 持久化层 | IndexedDB 本地存储 + Supabase 远程同步 |

数据流向：
用户输入 → L1 乐观更新 → L2 记录操作 → L3 CRDT 合并 → L4 持久化`,
    tags: ['GResume', '架构设计', '同步'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-arch-002',
    module: 'projects',
    chapterId: 'gresume',
    category: '架构设计',
    question: '三步模型（乐观更新 → CRDT 同步 → 延迟持久化）具体流程是什么？',
    answer: `三步模型详解：

**Step 1: 乐观更新**
\`\`\`typescript
// 用户操作立即反映在 UI
setResume((prev) => ({
  ...prev,
  workExperience: [...prev.workExperience, newItem]
}));
\`\`\`
用户感受到"零延迟"响应

**Step 2: CRDT 同步**
\`\`\`typescript
// 生成 Automerge 操作
const op = { type: 'insert', path: [...], value: newItem };
doc = Automerge.change(doc, (d) => { /* 应用操作 */ });
\`\`\`
后台异步合并冲突

**Step 3: 延迟持久化**
\`\`\`typescript
// 批量写入 IndexedDB
setTimeout(() => {
  indexedDB.put('pending-ops', op);
  // 网络恢复后同步到 Supabase
}, 1000);
\`\`\``,
    tags: ['GResume', '架构设计', '乐观更新'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-optimistic-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '什么是乐观 UI？它在 GResume 中是如何实现的？',
    answer: `乐观 UI 核心思想：
"先显示结果，再同步确认"

实现方式：
1. Zustand store 直接更新 UI 状态
2. 操作队列记录 pending 状态
3. CRDT 同步后确认或回滚

\`\`\`typescript
// 乐观更新示例
const addExperience = async (exp: Experience) => {
  // 立即更新 UI
  useResumeStore.setState((s) => ({
    workExperience: [...s.workExperience, exp]
  }));

  // 后台同步
  try {
    await syncToServer(exp);
  } catch {
    // 失败则回滚
    useResumeStore.setState((s) => ({
      workExperience: s.workExperience.filter(e => e.id !== exp.id)
    }));
  }
};
\`\`\``,
    tags: ['GResume', '乐观UI', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-code-split-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '路由级代码分割是如何实现的？分割策略是什么？',
    answer: `Vite 代码分割配置：

\`\`\`typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit'],
          'ai': ['ai', 'llamaindex'],
        }
      }
    }
  }
});
\`\`\`

分割策略：
| 路由 | 按需加载的 Chunk |
|------|------------------|
| /editor | editor chunk |
| /analytics | ai chunk |
| /settings | react-vendor 复用 |

首屏只加载首页必要代码，其他路由懒加载`,
    tags: ['GResume', '代码分割', 'Vite'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-cursor-throttle-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '光标节流批处理是什么？为什么需要？具体实现细节？',
    answer: `问题背景：
简历编辑时，光标移动/内容变化会触发大量同步事件

节流策略：
\`\`\`typescript
// 节流阈值：300ms
// 批处理：将 300ms 内的多次操作合并为一次
let cursorOps: Operation[] = [];
let timer: number;

const flushCursorOps = () => {
  if (cursorOps.length > 0) {
    // 批量发送一次 CRDT 同步
    syncToCRDT(mergeOperations(cursorOps));
    cursorOps = [];
  }
};

document.addEventListener('selectionchange', () => {
  cursorOps.push({ type: 'cursor', timestamp: Date.now() });
  clearTimeout(timer);
  timer = setTimeout(flushCursorOps, 300);
});
\`\`\`

效果：
• 减少 80% 的同步请求
• 不影响用户编辑体验`,
    tags: ['GResume', '节流', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-css-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '原子化 CSS（Tailwind）在 GResume 中是如何优化渲染性能的？',
    answer: `原子化 CSS 优势：

1. **零运行时开销**
   • 类名在构建时生成
   • 无需 JS 计算样式

2. **更好的压缩**
   • 相同类名复用
   • 生产构建后极小

3. **CSS 体积控制**
\`\`\`javascript
// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  // 只打包实际使用的类
}
\`\`\`

4. **渲染优化**
   • 减少 DOM 节点的 class 字符串长度
   • 浏览器样式计算更快

对比：
| 方案 | 运行时开销 | CSS 体积 |
|------|-----------|----------|
| styled-components | 高 | 中 |
| Tailwind | 零 | 小 |
| CSS Modules | 零 | 大 |`,
    tags: ['GResume', 'Tailwind', 'CSS'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-deepseek-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI集成',
    question: '为什么选择 DeepSeek LLM 而不是 GPT？DeepSeek 的优势是什么？',
    answer: `选型对比（2024年）：

| 特性 | DeepSeek V2 | GPT-4 |
|------|-------------|-------|
| API 成本 | 低 95% | 高 |
| 中文能力 | 优秀 | 良好 |
| ATS 场景 | 深度优化 | 通用 |
| 部署方式 | 边缘 | 云端 |

选择 DeepSeek 的原因：
1. **成本驱动**：简历 ATS 分析需频繁调用
2. **中文优化**：中文简历解析更准确
3. **自主部署**：数据不经过第三方
4. **流式响应**：支持 SSE，体验更好`,
    tags: ['GResume', 'DeepSeek', 'AI集成'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-stream-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI集成',
    question: '流式响应（ SSE ）在前端是如何处理的？',
    answer: `Supabase Edge Functions 流式调用：

\`\`\`typescript
// 前端处理 SSE
const streamResumeAnalysis = async (resumeText: string) => {
  const response = await fetch(
    'https://xxx.supabase.co/functions/v1/ats-analysis',
    {
      method: 'POST',
      body: JSON.stringify({ resume: resumeText }),
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 增量处理每个 chunk
    const chunk = decoder.decode(value);
    console.log('Received:', chunk);
  }
};
\`\`\`

UI 更新策略：
1. 用 useState 收集流式数据
2. 解析 SSE 事件格式
3. 逐步更新 UI，显示打字机效果`,
    tags: ['GResume', 'SSE', '流式响应'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-ats-algo-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'ATS评分',
    question: 'ATS 多维度评分算法是怎么设计的？各维度如何权衡？',
    answer: `ATS 评分算法设计：

\`\`\`typescript
interface ATSScore {
  overall: number;        // 0-100
  breakdown: {
    keywords: number;    // JD 关键词匹配度 25%
    structure: number;    // 简历结构完整性 20%
    skills: number;       // 技能相关度 25%
    experience: number;   // 经历相关性 20%
    readability: number;  // 可读性 10%
  };
}

// 计算公式
const overall = (
  keywords * 0.25 +
  structure * 0.20 +
  skills * 0.25 +
  experience * 0.20 +
  readability * 0.10
);
\`\`\`

权重设计原则：
• **关键词匹配**：最高权重，因为 ATS 第一关是关键词扫描
• **结构完整性**：确保必填项齐全
• **技能相关度**： JD 与简历技能匹配
• **经历相关性**：工作时长/行业匹配度
• **可读性**：格式规范、无乱码`,
    tags: ['GResume', 'ATS', '评分算法'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-crdt-version-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '数据同步',
    question: 'CRDT 如何做版本控制？如何支持撤销/重做？',
    answer: `Automerge 版本管理：

\`\`\`typescript
// 每个文档快照都是不可变的
const doc = Automerge.init();
const doc2 = Automerge.change(doc, (d) => {
  d.title = 'Hello';
});

// 保存历史
const history = Automerge.getHistory(doc2);

// 撤销：用上一个快照
const [prevState] = history[history.length - 2];
const doc3 = Automerge.load(prevState.state);

console.log(doc3.title); // undefined（撤销了修改）
\`\`\`

撤销重做实现：
\`\`\`typescript
interface UndoManager {
  undoStack: Uint8Array[];
  redoStack: Uint8Array[];

  undo() {
    const prev = this.undoStack.pop();
    this.redoStack.push(this.currentState);
    this.currentState = Automerge.load(prev);
  }

  redo() {
    const next = this.redoStack.pop();
    this.undoStack.push(this.currentState);
    this.currentState = Automerge.load(next);
  }
}
\`\`\``,
    tags: ['GResume', 'CRDT', '版本控制'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-conflict-edge-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '数据同步',
    question: '网络恢复时的同步冲突具体是如何处理的？有没有边界情况？',
    answer: `同步冲突处理流程：

**场景：用户 A、B 同时离线编辑**

1. A、B 各自本地编辑，产生不同 CRDT 操作
2. A 先联网，同步成功
3. B 联网，操作自动合并

\`\`\`typescript
// 同步伪代码
const syncWithServer = async (localOps: Op[]) => {
  const serverState = await fetchServerState();

  // Automerge 自动合并
  const merged = Automerge.merge(localOps, serverState);

  // 冲突字段处理
  if (merged.conflicts) {
    // 最后写入胜出（Last Write Wins）
    // 或标记给用户手动选择
  }

  await pushToServer(merged);
};
\`\`\`

边界情况：
| 场景 | 处理方式 |
|------|----------|
| 同一字段同时编辑 | LWW（最后写入胜出）+ 通知用户 |
| 删除与修改冲突 | 删除优先，提示用户 |
| 大批量操作同步 | 分批同步 + 进度条 |
| 服务器拒绝操作 | 回滚本地 + 提示用户 |`,
    tags: ['GResume', '冲突处理', '数据同步'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-perf-metrics-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '性能优化的具体效果数据（FCP、加载时间）是多少？如何测量的？',
    answer: `性能优化数据：

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| FCP | 3.2s | 1.1s | 66% |
| LCP | 4.5s | 1.8s | 60% |
| TTI | 5.1s | 2.3s | 55% |
| 包体积 | 520KB | 180KB | 65% |

测量工具：
\`\`\`javascript
// Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);

// Lighthouse CI
// 在 CI 中自动化测量
\`\`\`

优化手段总结：
1. 路由代码分割 → 首屏 JS 减少 60%
2. 乐观 UI → 操作响应 < 16ms
3. 光标节流 → 同步请求减少 80%
4. 原子化 CSS → CSS 体积减少 40%`,
    tags: ['GResume', '性能优化', 'WebVitals'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-indexeddb-schema-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: 'IndexedDB 的数据结构是如何设计的？为什么这样设计？',
    answer: `IndexedDB Schema 设计：

\`\`\`typescript
// 数据库：gresume_db
// 版本：1

const stores = {
  // 1. 简历文档
  resumes: {
    keyPath: 'id',
    indexes: ['updatedAt', 'userId']
  },

  // 2. 待同步操作队列
  pendingOps: {
    keyPath: 'id',
    autoIncrement: true,
    indexes: ['timestamp', 'synced']
  },

  // 3. CRDT 文档快照
  snapshots: {
    keyPath: 'resumeId',
    indexes: ['version']
  },

  // 4. 用户设置
  settings: {
    keyPath: 'key'
  }
};
\`\`\`

设计理由：
| Store | 目的 |
|-------|------|
| resumes | 快速查询简历列表 |
| pendingOps | 离线操作队列，按时间排序同步 |
| snapshots | CRDT 版本快照，支持撤销 |
| settings | 用户偏好，本地缓存 |`,
    tags: ['GResume', 'IndexedDB', '离线'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-business-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '业务理解',
    question: 'GResume 解决了用户什么核心痛点？市面上已有的解决方案有什么不足？',
    answer: `用户痛点分析：

**现有方案问题：**
| 方案 | 问题 |
|------|------|
| Word/简历模板 | 格式难统一、跨设备困难 |
| 在线简历平台 | 无离线能力、数据不安全 |
| Google Docs | 无 ATS 优化、协作过于复杂 |
| 专业简历服务 | 收费高、不能即时修改 |

**GResume 核心价值：**
1. **离线优先**：地铁、飞机上都能编辑
2. **数据主权**：简历存储在自己手中
3. **AI 赋能**：不是填模板，是智能优化
4. **投递追踪**：管理多个岗位投递状态

目标用户：
• 海归求职（需中英简历）
• 跳槽高峰期（快速迭代简历）
• 跨地区求职（多设备同步）`,
    tags: ['GResume', '业务理解', '用户痛点'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-automerge-impl-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'CRDT',
    question: 'Automerge 的底层实现原理是什么？如何保证最终一致性？',
    answer: `Automerge 底层原理：

**核心数据结构：**
1. **Operation Log**：不可变的操作序列
2. **Document State**：当前状态的二进制编码
3. **Change Vector**：向量时钟，记录每个节点的逻辑时间

\`\`\`typescript
// 向量时钟示例
const clock = {
  'client-A': 3,  // A 已完成 3 次操作
  'client-B': 2,  // B 已完成 2 次操作
};
\`\`\`

**合并算法：**
\`\`\`typescript
// 两个客户端各自操作后
const docA = Automerge.change(doc, (d) => { d.x = 1; });
const docB = Automerge.change(doc, (d) => { d.y = 2; });

// 合并：取并集
const merged = Automerge.merge(docA, docB);
// 结果：{ x: 1, y: 2 }
\`\`\`

**数学保证：**
• **结合律**：(A ∪ B) ∪ C = A ∪ (B ∪ C)
• **交换律**：A ∪ B = B ∪ A
• **幂等律**：A ∪ A = A

无论合并顺序如何，最终状态一致。`,
    tags: ['GResume', 'Automerge', 'CRDT原理'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-resume-data-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '架构设计',
    question: '简历文档的数据模型是如何设计的？为什么用嵌套结构？',
    answer: `简历数据模型：

\`\`\`typescript
interface Resume {
  id: string;
  version: number;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location?: string;
  };
  workExperience: WorkItem[];  // 嵌套数组
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  awards?: Award[];
}

interface WorkItem {
  id: string;          // 唯一 ID，不是索引
  company: string;
  position: string;
  startDate: string;
  endDate: string | 'present';
  highlights: string[]; // 关键成就
}
\`\`\`

**设计决策：**
| 决策 | 原因 |
|------|------|
| 每个元素用 ID | CRDT 冲突处理更简单 |
| 嵌套结构 | 语义清晰，便于渲染 |
| 可选字段 | 支持不同国家简历格式 |
| version 字段 | CRDT 快照管理 |

**ID 策略优势：**
\`\`\`typescript
// ❌ 用索引（会冲突）
[0].company = '滴滴'  // A
[0].company = '字节'  // B → 冲突

// ✅ 用 ID（不冲突）
items['w1'].company = '滴滴'     // A
items['w2'].company = '字节'    // B → 无冲突
\`\`\``,
    tags: ['GResume', '数据模型', '架构设计'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-supabase-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI集成',
    question: 'Supabase Edge Functions 的冷启动问题如何处理？',
    answer: `冷启动优化策略：

**问题：** V8 isolates 冷启动约 100-500ms

**优化方案：**

1. **预热机制**
\`\`\`typescript
// 定期 ping 函数保持活跃
cron.schedule('*/5 * * * *', () => {
  fetch('https://xxx.supabase.co/functions/v1/ats-analysis', {
    method: 'POST',
    body: JSON.stringify({ warmup: true })
  });
});
\`\`\`

2. **连接复用**
\`\`\`typescript
// 全局复用数据库连接
const supabase = createClient(...);

Deno.serve(async (req) => {
  // 复用 supabase 实例
  const { data } = await supabase.from('resumes').select();
  return new Response(JSON.stringify(data));
});
\`\`\`

3. **请求合并**
\`\`\`typescript
// 批量请求合并处理
if (batchRequests.length > 1) {
  return batchProcess(batchRequests);
}
\`\`\`

4. **边缘缓存**
• ATS 结果缓存到 Supabase
• 相同简历内容 5 分钟内不重复调用`,
    tags: ['GResume', 'Supabase', '冷启动'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-ide-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '工程化',
    question: '项目如何保证代码质量？用了哪些 CI/CD 流程？',
    answer: `代码质量保障：

**Prettier + ESLint**
\`\`\`yaml
# .eslintrc.yml
extends:
  - next/core-web-vitals
  - plugin:@typescript-eslint/recommended

# pre-commit hook
npx lint-staged
\`\`\`

**CI Pipeline（GitHub Actions）**
\`\`\`yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - run: npm run preview &
      - run: npx lighthouse http://localhost:4173 --output json
      - uses: actions/upload-artifact@v4
        with: name: lighthouse-report
\`\`\`

**发布流程**
1. PR → CI 检查 → Review
2. Merge → 自动部署到 Preview
3. Release Tag → 自动部署到 Production`,
    tags: ['GResume', 'CI/CD', '代码质量'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-error-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '工程化',
    question: '同步失败或 AI 接口报错时，如何做错误处理和用户提示？',
    answer: `错误处理策略：

**分层错误处理**
\`\`\`typescript
// 1. 网络错误 - 自动重试
const withRetry = async (fn: () => Promise<T>, retries = 3) => {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0) {
      await delay(1000);
      return withRetry(fn, retries - 1);
    }
    throw e;
  }
};

// 2. CRDT 同步错误 - 回滚
} catch (syncError) {
  useResumeStore.setState({ status: 'sync-failed' });
  showToast('同步失败，已保存本地');
}

// 3. AI 接口错误 - 降级
try {
  const score = await callDeepSeek(resume);
} catch (aiError) {
  // 降级：使用规则引擎
  return ruleBasedScore(resume);
}
\`\`\`

**用户提示设计**
| 错误类型 | 提示文案 | 行为 |
|----------|----------|------|
| 同步失败 | "网络不稳定，已保存本地" | 自动重试 |
| AI 超时 | "AI 分析稍后再试" | 手动重试按钮 |
| 配额用尽 | "今日分析次数已用完" | 升级提示 |`,
    tags: ['GResume', '错误处理', '工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-ux-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '用户体验',
    question: '离线优先架构下，用户如何感知网络状态？有哪些 UX 设计？',
    answer: `离线 UX 设计：

**1. 网络状态感知**
\`\`\`typescript
// 监听网络状态
window.addEventListener('online', () => {
  showToast('网络已恢复，正在同步...');
  syncPendingOps();
});

window.addEventListener('offline', () => {
  showToast('已切换到离线模式');
});
\`\`\`

**2. 视觉指示器**
| 状态 | 指示器 |
|------|--------|
| 在线 + 已同步 | 绿色勾号 |
| 在线 + 同步中 | 蓝色旋转图标 |
| 在线 + 待同步 | 橙色待同步图标 |
| 离线 | 灰色断网图标 |

**3. 离线操作队列展示**
\`\`\`tsx
{pendingOps.length > 0 && (
  <div className="pending-sync">
    <SyncIcon className={isSyncing ? 'animate-spin' : ''} />
    <span>{pendingOps.length} 个操作待同步</span>
  </div>
)}
\`\`\`

**4. 数据安全保障**
• 离线操作永不丢失（IndexedDB）
• 同步失败明确告知用户
• 提供手动同步按钮`,
    tags: ['GResume', '离线UX', '用户体验'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-collab-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '数据同步',
    question: 'GResume 支持多人协作吗？如果支持，同步机制是什么？',
    answer: `协作模式设计：

**当前定位：** 个人简历编辑器，以离线为主
**未来扩展：** 家庭成员帮填/HR 反馈

**如果实现多人协作：**
\`\`\`typescript
// 基于 Automerge 的 P2P 同步
const syncWithPeer = async (peerId: string) => {
  // 1. 发现对等节点
  const peers = await discoveryService.findPeers(peerId);

  // 2. 交换 CRDT 状态
  for (const peer of peers) {
    const localState = Automerge.save(doc);
    const remoteState = await peer.getState();

    // 3. 合并状态
    doc = Automerge.merge(doc, remoteState);

    // 4. 广播本地更新
    peer.send(localState);
  }
};

// 或通过 Supabase Realtime 中转
const channel = supabase.channel('resume-sync');
channel.on('broadcast', (payload) => {
  doc = Automerge.merge(doc, payload.state);
});
\`\`\`

**冲突处理：**
• 简历以个人为主，不需要实时协同
• 若扩展为协作：CRDT 自动合并 + 操作溯源`,
    tags: ['GResume', '多人协作', '数据同步'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-security-001',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI集成',
    question: '简历数据通过 Supabase Edge Functions 调用 AI 时，如何保证数据安全？',
    answer: `数据安全保障：

**1. API Key 安全**
\`\`\`typescript
// ✅ 正确：Key 在 Edge Function 中，不暴露前端
const deepseek = new DeepSeekAPI(process.env.DEEPSEEK_KEY);

// ❌ 错误：暴露在前端
const deepseek = new DeepSeekAPI('sk-xxxx'); // 被爬取
\`\`\`

**2. 数据最小化**
\`\`\`typescript
// 只传输必要字段
const resumeForAI = {
  text: extractText(resume),  // 不传 ID/元数据
  jdKeywords: extractKeywords(jobDescription)
};
\`\`\`

**3. Supabase RLS（行级安全）**
\`\`\`sql
-- 只有简历所有者可以访问
CREATE POLICY "Users can only access own resumes"
ON resumes
FOR ALL
USING (user_id = auth.uid());
\`\`\`

**4. 传输加密**
• HTTPS（Supabase 默认）
• AI 返回数据不持久化到日志

**5. 审计日志**
\`\`\`typescript
// 记录 AI 调用（非内容）
await supabase.from('ai_logs').insert({
  user_id: user.id,
  action: 'ats_analysis',
  timestamp: new Date().toISOString()
});
\`\`\``,
    tags: ['GResume', '数据安全', 'AI集成'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-diff-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '简历编辑器的 Diff 算法是如何设计的？如何高效渲染变化部分？',
    answer: `Diff 算法设计：

**问题：** 简历是大嵌套对象，直接 diff 无意义

**设计思路：**
1. **字段级 Diff**（不是整体 diff）
2. **操作类型 Diff**

\`\`\`typescript
// 计算两个简历版本的差异
const diffResumes = (prev: Resume, next: Resume) => {
  const changes: Change[] = [];

  // 比较每个字段
  if (prev.personalInfo.name !== next.personalInfo.name) {
    changes.push({
      path: 'personalInfo.name',
      type: 'modify',
      from: prev.personalInfo.name,
      to: next.personalInfo.name
    });
  }

  // 数组元素比较用 ID
  prev.workExperience.forEach((item, i) => {
    if (item.id !== next.workExperience[i]?.id) {
      changes.push({ type: 'reorder', path: 'workExperience' });
    }
  });

  return changes;
};
\`\`\`

**增量渲染策略：**
\`\`\`typescript
// React 18 的 startTransition
const updateResume = (changes: Change[]) => {
  startTransition(() => {
    // 只更新变化的字段
    changes.forEach(applyChange);
  });
};

// 编辑器局部刷新
<ResumeField path={change.path}>
  <HighlightedText old={change.from} new={change.to} />
</ResumeField>
\`\`\``,
    tags: ['GResume', 'Diff', '性能优化'],
    status: 'unvisited',
    difficulty: 'hard',
  },
];

export const gresumeChapter: Chapter = {
  id: 'gresume',
  module: 'projects',
  title: 'GResume 智能简历平台',
  description: 'CRDT文档冲突、IndexedDB离线、AI集成ATS评分',
  cardCount: gresumeCards.length,
  icon: '📝',
};
