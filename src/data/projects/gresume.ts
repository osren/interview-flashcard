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
  // ===== 面试指南补充：Zustand + IndexedDB 回滚机制 =====
  {
    id: 'gresume-rollback-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '架构设计',
    question: '你在简历中提到的"乐观更新 → CRDT 同步 → 延迟持久化"三步模型，在实际操作中如果 IndexedDB 写入失败了，你是怎么回滚的？',
    answer: `三步模型回滚机制：

### 1. 三步模型流程
\`\`\`
1. 乐观更新：立即更新 UI（Zustand）
2. CRDT 同步：本地 Automerge 同步
3. 延迟持久化：批量写入 IndexedDB
\`\`\`

### 2. 回滚场景
\`\`\`typescript
// 延迟持久化阶段可能失败的情况
const persistToIndexedDB = async (data: string) => {
  try {
    await db.put('resumes', data);
  } catch (error) {
    // 需要回滚的情况：
    // - 磁盘空间不足
    // - 数据库损坏
    // - 浏览器限制了存储
  }
};
\`\`\`

### 3. 回滚方案设计
\`\`\`typescript
// 方案 1：事务 + 检查点
const saveWithRollback = async () => {
  const checkpoint = await createCheckpoint(); // 保存当前 CRDT 状态

  try {
    await db.transaction('rw', db.resumes, async () => {
      await db.put('resume', currentDoc);
    });
  } catch (error) {
    // 回滚到检查点
    await restoreFromCheckpoint(checkpoint);
    // 重新尝试保存
    await retrySave();
  }
};

// 方案 2：双写 + 对比
const dualWriteSave = async () => {
  const localData = autocommitJSON(currentDoc);

  try {
    // 同时写入两个存储
    await Promise.all([
      db.put('resume_backup', localData), // 备份
      db.put('resume', localData),        // 主存储
    ]);
  } catch (error) {
    // 从备份恢复
    const backup = await db.get('resume_backup');
    applyToZustand(backup);
  }
};
\`\`\`

### 4. 实际实现
\`\`\`typescript
// Zustand 中间件捕获异常
const persistMiddleware: StateCreator<ResumeState> = (set, get) => {
  return {
    ...set((state) => {
      try {
        // 尝试持久化
        batchPersist(state);
      } catch (error) {
        console.error('持久化失败，触发回滚:', error);
        // 标记状态为"未同步"
        return { syncStatus: 'pending_rollback' };
      }
      return state;
    }),
  };
};
\`\`\`

### 5. 用户感知
\`\`\`
- 写入失败不会导致白屏
- 显示"同步中"状态
- 下次打开自动重试
- 严重错误引导用户导出 JSON 备份
\`\`\``,
    tags: ['GResume', 'Zustand', 'IndexedDB', '回滚机制'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  // ===== GResume 缺陷处理 =====
  {
    id: 'gresume-limitation-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '架构设计',
    question: 'GResume 目前有什么技术缺陷或局限性？你是如何认知和应对的？',
    answer: `GResume 技术局限性分析：

### 1. 已识别的局限性

#### a. 大文档性能
\`\`\`
问题：简历超过 50KB 时，Automerge 同步变慢
原因：CRDT 需要遍历整个文档树
缓解：分块同步，只同步变更的部分
\`\`\`

#### b. 冲突展示
\`\`\`
问题：复杂冲突时只能"最后写入胜出"
原因：没有实现可视化的冲突解决 UI
缓解：记录冲突日志，供用户手动处理
\`\`\`

#### c. 冷启动
\`\`\`
问题：首次打开需要重建 CRDT 状态
原因：从 IndexedDB 加载后需要转换为 Automerge 对象
缓解：缓存转换结果，小型简历无感知
\`\`\`

### 2. 应对策略
\`\`\`typescript
// 限制策略
const LIMIT = {
  maxSections: 20,        // 最多 20 个模块
  maxItemsPerSection: 50, // 每个模块最多 50 条
  maxTextLength: 10000,   // 单个文本字段上限
};

// 性能监控
useEffect(() => {
  const metrics = getPerformanceMetrics();
  if (metrics.syncTime > 1000) {
    // 触发优化
    optimizeCRDT();
  }
}, []);
\`\`\`

### 3. 技术债务
\`\`\`
1. 没有单元测试（时间优先）
2. 文档不完整
3. 错误处理可以更精细

### 4. 回答策略
- 诚实承认局限性
- 展示已经想到的优化方向
- 体现技术判断力和诚实态度`,
    tags: ['GResume', '局限性', '技术复盘'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-realtime-edit-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '协同编辑',
    question: '两三个人实时在线编辑是怎么实现的？',
    answer: `通过 Supabase Realtime 广播频道实现 P2P 式的多用户同步：

架构：
\`\`\`
用户 A ──┐
用户 B ──┼── Supabase Realtime Channel ──→ 所有人收到消息
用户 C ──┘         │
                   └── broadcast（广播）+ presence（在线状态）
\`\`\`

源码实现：
\`\`\`typescript
// 创建 Supabase Realtime 频道
this.channelName = \`automerge:resume:\${resumeId}:\${sessionId}\`
this.channel = supabase.channel(this.channelName)

// 注册 CRDT 消息广播
this.registerSyncBroadcast()

// 注册用户在线状态（presence）
this.registerPresenceEvents()

// 订阅频道
this.channel.subscribe(async (status) => {
  if (status !== 'SUBSCRIBED') return
  await this.channel?.track({ peerId: String(this.peerId), ... })
  this.ready = true
})
\`\`\`

当 handle 发生变化时，Automerge 会自动通过 send() 方法将 CRDT change 编码为 bytes，通过 Supabase 频道广播给所有在线协作者。`,
    tags: ['GResume', '实时编辑', 'Supabase', '协同'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-websocket-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '协同编辑',
    question: 'WebSocket 怎样建立连接？',
    answer: `本项目不直接使用 WebSocket，而是通过 Supabase Realtime 间接实现。

Supabase Realtime 底层基于 WebSocket 协议，建立连接的过程：
\`\`\`
supabase.channel(name)  →  创建 RealtimeChannel 实例
       ↓
channel.subscribe()      →  建立 WebSocket 长连接（自动重连）
       ↓
channel.track()         →  注册用户在线状态（Presence）
       ↓
ready = true            →  连接建立完成，触发回调
\`\`\`

源码：
\`\`\`typescript
private subscribeToChannel(peerMetadata?: PeerMetadata) {
  this.channel?.subscribe(async (status) => {
    if (status !== 'SUBSCRIBED') return
    await this.channel?.track({
      peerId: String(this.peerId),
      metadata: { ...peerMetadata, ...this.presenceMetadata },
      online_at: new Date().toISOString(),
      sessionId: this.sessionId,
    })
    this.ready = true
    this.callbacks.onChannelReady?.(this.channelName)
  })
}
\`\`\`

Supabase Realtime 自动处理：
- WebSocket 握手和心跳
- 自动重连（网络波动时）
- 多路复用（同一个连接承载多个频道）`,
    tags: ['GResume', 'WebSocket', 'Supabase', '连接管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-cursor-sync-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '协同编辑',
    question: '光标同步的时机是什么？发送端和接收端分别怎么处理？',
    answer: `两个维度：发送时机 + 接收时机。

**发送端（节流 + rAF 调度）：**
\`\`\`typescript
const scheduleOutgoingCursorFlush = useCallback(() => {
  if (sendFrameRef.current !== null) return  // 已有待发送帧，跳过
  sendFrameRef.current = requestAnimationFrame((frameTime) => {
    flushOutgoingCursorRef.current(frameTime)  // 下一帧发送
  })
}, [])

const flushOutgoingCursor = useCallback((frameTime: number) => {
  if (frameTime - lastSentAtRef.current < throttleMs) {
    // 节流：未到时间，调度到下一帧
    sendFrameRef.current = requestAnimationFrame((nextFrameTime) => {
      flushOutgoingCursorRef.current(nextFrameTime)
    })
    return
  }
  // 实际广播光标
  broadcastCursorPayload(channelRef.current, payload)
  lastSentAtRef.current = frameTime
}, [throttleMs, ...])
\`\`\`

throttleMs 默认约 50ms（每帧约 16ms，所以约每 3 帧发一次）。

**接收端（批量合并 + rAF）：**
\`\`\`typescript
const scheduleRemoteCursorFlush = useCallback(() => {
  if (flushRemoteFrameRef.current !== null) return
  flushRemoteFrameRef.current = requestAnimationFrame(flushRemoteCursors)
}, [])

const flushRemoteCursors = useCallback(() => {
  flushRemoteFrameRef.current = null
  const batch = Object.values(pendingRemoteCursorsRef.current)
  pendingRemoteCursorsRef.current = {}
  if (batch.length === 0) return
  // 批量更新状态，合并同一帧内的多次光标移动
  setCursors(prev => upsertRealtimeCursorBatch(prev, batch))
}, [])
\`\`\`

**时序总结：**
\`\`\`
PointerMove → requestAnimationFrame → 节流检查 → 广播
                                           ↓
                                    对方接收 → requestAnimationFrame → 批量合并 → 渲染
\`\`\``,
    tags: ['GResume', '光标同步', '协同编辑', '节流'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-cursor-position-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '协同编辑',
    question: '显示光标同步的位置怎么实现？坐标如何转换？',
    answer: `通过 CursorEventPayload 携带屏幕绝对坐标实现：

\`\`\`typescript
export interface CursorEventPayload {
  position: { x: number; y: number }   // 屏幕绝对坐标
  viewport?: { width: number; height: number }  // 视口尺寸
  user: { id: number; name: string }
  color: string
  timestamp: number
}
\`\`\`

**收集光标位置：**
\`\`\`typescript
const handlePointerMove = useCallback((event: PointerEvent) => {
  latestPointerPositionRef.current = {
    x: event.clientX,  // 相对于视口的坐标
    y: event.clientY,
  }
  scheduleOutgoingCursorFlush()
}, [scheduleOutgoingCursorFlush])

const payload = createCursorPayload({
  position: latestPosition,
  viewport: getViewportSize(),
  userId,
  username,
  color,
})
\`\`\`

**投影到本地视口（坐标转换）：**
远程光标坐标需要从发送者的视口投影到接收者的视口：
\`\`\`typescript
export function projectRealtimeCursor(
  payload: CursorEventPayload,
  projectPoint: (point, viewport) => CursorEventPayload['position'],
): CursorEventPayload {
  return {
    ...payload,
    position: projectPoint(payload.position, payload.viewport),
  }
}
\`\`\`

实际投影函数 projectPointToViewport 会根据双方视口宽高比进行线性变换。

**渲染光标：**
光标数据存储在 cursors state 中，UI 层直接读取并渲染带颜色标签的光标 DOM 元素（通常用 position: fixed + left/top 定位）。`,
    tags: ['GResume', '光标位置', '协同编辑', '坐标转换'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-offline-design-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '离线优先怎么设计和实现的？',
    answer: `三层存储架构：
\`\`\`
内存（Zustand 状态）
    ↓ 变化时延迟写入
IndexedDB（Automerge 文档 + 离线简历）
    ↓ 在线时异步同步
Supabase（云端持久化）
\`\`\`

两条独立路径：

路径 A — 在线简历（Supabase 关联）：
\`\`\`
编辑 → Zustand → Automerge Document → 延迟 3s → Supabase
                                   → IndexedDB（Automerge Repo 自动持久化）
\`\`\`

路径 B — 离线简历（纯本地）：
\`\`\`
编辑 → Zustand → 延迟 3s → IndexedDB（offline-resume-manager）
\`\`\`

关键代码：
\`\`\`typescript
function applyResumeChange(set, get, stateUpdate, docUpdate?) {
  // 1. Optimistic UI - 立即更新本地状态
  set({ ...stateUpdate, pendingChanges: true })

  // 2. 离线模式 → 写 IndexedDB
  if (freshState.mode === 'offline' || isOfflineResumeId(resumeId)) {
    scheduleOfflinePersist(() => get().syncToSupabase())
    return
  }

  // 3. 在线模式 → 更新 Automerge + 延迟同步 Supabase
  if (docUpdate) {
    freshState.docManager?.change(doc => docUpdate(doc))
  }
  scheduleOnlinePersist(() => get().syncToSupabase())
}
\`\`\``,
    tags: ['GResume', '离线优先', 'IndexedDB', 'Zustand'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-storage-type-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '本地保存的是全量还是增量？',
    answer: `两者结合：

- IndexedDB 中的 Automerge 文档：保存的是全量快照（Automerge.save(doc) 序列化的完整二进制）
- Supabase 中的 automerge_documents 表：也是全量快照（document_data 字段存 Base64 编码的完整二进制，heads 字段记录当前 Heads）

\`\`\`typescript
// src/lib/automerge/document/persistence.ts
const binary = Automerge.save(doc)      // 全量序列化
const heads = Automerge.getHeads(doc)   // 当前 heads（用于增量同步判断）
\`\`\`

注意：Automerge Repo 本身支持增量 sync（只同步 diff），但本项目的 Supabase Network Adapter 实现的是完整二进制广播，没有使用 Automerge 的增量 sync 协议。`,
    tags: ['GResume', '存储', '全量', '增量'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-cleanup-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '什么时候清理数据？清理机制是什么？',
    answer: `三个清理时机：

**1. 简历切换时（useResumeLoader.ts）：**
\`\`\`typescript
useEffect(() => {
  return () => {
    useResumeStore.getState().cleanup()
    useCollaborationStore.getState().stopSharing({ silent: true })
  }
}, [])
\`\`\`

**2. cleanup() 函数（form.ts）：**
\`\`\`typescript
cleanup: () => {
  const { cleanupFns, docManager } = get()
  cleanupFns.forEach(fn => fn())    // 注销所有事件监听
  docManager?.destroy()              // 销毁 Automerge 文档句柄
  if (syncTimer) clearTimeout(syncTimer)
  if (onlineSyncTimer) clearTimeout(onlineSyncTimer)
  set({ cleanupFns: [], docManager: null, ... })
}
\`\`\`

**3. docManager.destroy()（manager.ts）：**
\`\`\`typescript
destroy() {
  this.saveListeners.clear()
  this.saveStartListeners.clear()
  this.collaboration?.disable()      // 断开协作连接
  this.collaboration = null
  this.repo = null
  this.handle = null
}
\`\`\`

IndexedDB 数据清理：用户需手动删除（deleteOfflineResume），没有自动过期策略。`,
    tags: ['GResume', '数据清理', '内存管理'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-offline-upload-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '离线之后怎么上传云端？',
    answer: `登录后触发迁移（migrateOfflineResumesToCloud）：

\`\`\`typescript
export async function migrateOfflineResumesToCloud(
  uploadFn: (resume) => Promise<string>,  // 创建云端简历
  selectedIds?: string[],
): Promise<{ success: number, failed: number, errors: string[] }> {
  const offlineResumes = await getAllOfflineResumes()
  // 遍历每个离线简历，上传到云端
  for (const resume of offlineResumes) {
    await uploadFn({ ... })     // 调用 Supabase 创建简历
    await deleteOfflineResume(resume.resume_id)  // 上传成功后删除本地副本
  }
}
\`\`\`

触发场景：用户从离线模式登录后，在 Dashboard 页面选择要同步的简历。`,
    tags: ['GResume', '离线上传', '云端同步'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-online-upload-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '联网了就需要立即上传吗？',
    answer: `不是立即上传，而是延迟批量同步。

编辑产生变化后，通过 scheduleOnlinePersist() 延迟 3 秒执行上传：
\`\`\`typescript
export const ONLINE_SYNC_DELAY = 3000

function scheduleOnlinePersist(flushFn) {
  if (onlineSyncTimer) clearTimeout(onlineSyncTimer)
  onlineSyncTimer = setTimeout(flushFn, ONLINE_SYNC_DELAY)
}
\`\`\`

即：用户停止编辑 3 秒后，才触发 Supabase 持久化。如果用户在 3 秒内继续编辑，计时器被重置。`,
    tags: ['GResume', '延迟同步', '批量上传'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-offline-sync-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '离线没有编辑也会同步吗？',
    answer: `离线场景下，即使没有编辑，也会将当前状态持久化到 IndexedDB。

但不会主动上传云端（因为离线）。上线后：
- 如果有 pending changes，会在 syncToSupabase() 时上传
- 如果无编辑变化，则没有需要同步的内容

**自动恢复机制**：重新打开已离线编辑的简历时，会从 IndexedDB 恢复最后一次保存的状态。`,
    tags: ['GResume', '离线同步', '状态恢复'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-version-def-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '离线优先',
    question: '版本怎么定义的？有哪些维度？',
    answer: `多维度版本体系：

**1. Automerge 文档内部版本（_metadata.version）：**
\`\`\`typescript
// 每次 handle.change() 时自增
metadata.version = typeof metadata.version === 'number' ? metadata.version + 1 : 1
\`\`\`

**2. Supabase resume_config_versions 表（快照版本）：**
\`\`\`typescript
interface ResumeHistoryVersionBase {
  id: number
  version_no: number           // 版本序号
  version_name: string | null  // 用户自定义名称
  source_type: ResumeVersionSourceType  // 'manual' | 'autosave' | 'restore' | 'ai_optimize' | 'import'
  snapshot: ResumeSnapshot     // 完整快照
  content_hash: string | null // SHA-256 哈希
  base_updated_at: string | null
}
\`\`\`

**3. 版本来源类型：**
| source_type | 说明 |
|---|---|
| manual | 用户手动保存 |
| autosave | 自动保存 |
| restore | 从历史版本恢复 |
| ai_optimize | AI 优化后生成 |
| import | 外部导入 |

**内容哈希用于检测内容是否变化：**
\`\`\`typescript
// SHA-256 哈希 + key 排序确保序列化稳定
const content = stableSerializeSnapshot(snapshot)
const digest = await crypto.subtle.digest('SHA-256', encoded)
\`\`\``,
    tags: ['GResume', '版本控制', '快照'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-module-design-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '编辑架构',
    question: '模块化编辑有设计吗？简历模块是如何划分的？',
    answer: `有。简历内容按模块划分，每个模块独立编辑：

\`\`\`typescript
export interface FormDataMap {
  basics: BasicFormType               // 基础信息
  job_intent: JobIntentFormType        // 求职意向
  application_info: ApplicationInfoFormType  // 报名信息
  edu_background: EduBackgroundFormType  // 教育背景
  work_experience: WorkExperienceFormType  // 工作经历
  internship_experience: InternshipExperienceFormType  // 实习经历
  campus_experience: CampusExperienceFormType  // 校园经历
  project_experience: ProjectExperienceFormType  // 项目经历
  skill_specialty: SkillSpecialtyFormType  // 专业技能
  honors_certificates: HonorsCertificatesFormType  // 荣誉证书
  self_evaluation: SelfEvaluationFormType  // 自我评价
  hobbies: HobbiesFormType              // 兴趣爱好
}
\`\`\`

每个模块对应左侧边栏的一个可拖拽 Tab，模块顺序由 order: ORDERType[] 控制，支持拖拽排序。`,
    tags: ['GResume', '模块化', '编辑架构'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rich-text-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '编辑架构',
    question: '富文本编辑是怎么实现的？用了什么技术栈？',
    answer: `使用了 TipTap（基于 ProseMirror）作为富文本编辑器核心：

模块化架构：
\`\`\`
src/components/tiptap-icons/      → 各格式图标组件
src/components/tiptap-node/      → 自定义节点（如图片上传、分割线）
src/components/tiptap-templates/  → 编辑器模板（simple 等）
src/components/tiptap-ui/         → 格式化操作按钮（bold/italic/code/heading 等）
src/components/tiptap-ui-primitive/ → 基础 UI 原语（Toolbar、Popover 等）
\`\`\`

关键扩展：
\`\`\`typescript
'tiptap-editor': [
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@tiptap/extension-highlight',
  '@tiptap/extension-image',
  '@tiptap/extension-text-align',
  '@tiptap/extension-typography',
  '@tiptap/extension-horizontal-rule',
  '@tiptap/extension-list',
  '@tiptap/extension-subscript',
  '@tiptap/extension-superscript',
]
\`\`\``,
    tags: ['GResume', 'TipTap', '富文本', 'ProseMirror'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-lazy-load-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '按需加载怎么实现的？有哪些层次？',
    answer: `三层按需加载：

**1. 路由级代码分割（动态 import）：**
\`\`\`typescript
// vite.config.ts
Pages({
  importMode: 'async',  // 路由页面 → 独立 chunk
})
\`\`\`

访问 /resume/editor 才加载对应的页面组件。

**2. 组件库分包（manualChunks）：**
将大型库（TipTap、Radix UI、Automerge）单独打包，只有访问编辑页时才加载对应 chunk。

**3. 依赖预构建（optimizeDeps.include）：**
\`\`\`typescript
optimizeDeps: {
  include: [
    'react', 'react-dom', 'react-router-dom',
    '@supabase/supabase-js', '@automerge/automerge',
    'motion', 'react-markdown', 'openai/streaming', 'shiki',
  ]
}
\`\`\`

确保这些库在首次访问前完成 Vite 的依赖预构建，避免生产环境懒加载时的卡顿。`,
    tags: ['GResume', '按需加载', '代码分割', 'Vite'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-perf-metrics-002',
    module: 'projects',
    chapterId: 'gresume',
    category: '性能优化',
    question: '提升的指标是怎么统计的？有哪些测量方式？',
    answer: `本项目使用自定义指标 + AI 辅助评判两种方式。

**自定义指标（src/pages/optimize/）：**
简历优化模块会分析：
- 关键词匹配度：JD 中的关键词在简历中的出现频率
- ATS 通过率模拟：根据简历完整度、结构化程度打分
- 内容质量：通过 OpenAI API 分析简历内容的专业程度

**AI 评判（src/lib/llm/）：**
\`\`\`typescript
// 调用 AI 分析
const response = await streamText({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: resumeContent },
  ],
})
\`\`\`

AI 评判维度：
- 简历与 JD 的匹配度
- 技能描述的专业性
- 工作经历描述的量化程度
- 整体可读性和结构`,
    tags: ['GResume', '性能指标', 'AI评判', 'ATS'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-project-owner-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '项目理解',
    question: 'GResume 是个人项目还是共同完成？性能优化是自己做的吗？',
    answer: `根据 git 提交记录分析：本项目为个人项目（commit 作者均为同一账号），但引入了多个第三方协作库（Automerge、Supabase Realtime）来支持多用户功能。

性能优化部分（自己实现）：

1. Vite 手动分包（vite.config.ts）：
\`\`\`typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'radix-ui': [多个 @radix-ui/* 包],
  'tiptap-editor': [9个 TipTap 扩展],
  'automerge-core': [4个 Automerge 包],
  'motion': ['motion'],
  'icons': ['@tabler/icons-react', 'lucide-react'],
  'supabase': ['@supabase/supabase-js'],
  'utils': ['clsx', 'tailwind-merge', 'dayjs', 'zod', 'zustand', 'shiki'],
}
\`\`\`

2. 路由异步加载（vite-plugin-pages）：
\`\`\`typescript
Pages({
  importMode: 'async',  // 每个页面组件独立 chunk
})
\`\`\`

3. CSS 按路由分割：
\`\`\`typescript
cssCodeSplit: true  // 每个 chunk 独立 CSS
\`\`\``,
    tags: ['GResume', '项目归属', '性能优化'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-rb-001',
    module: 'projects',
    chapterId: 'gresume',
    category: '错误处理',
    question: "更新日志里说 ErrorBoundary 全局兜底、再离谱也不会白屏——什么是 ErrorBoundary？它如何确保不会白屏？",
    answer: `**是什么**：ErrorBoundary 是 React 的错误边界机制——在组件树里包一层「安全网」，专门捕获**子树在渲染阶段抛出的 JS 异常**，避免整棵树卸载后只剩空白 DOM（白屏）。

**为什么会白屏**：React 默认遇到渲染期未捕获错误会卸载整棵组件树；\`#root\` 里没东西可画 → 用户看到空白页。编辑器、拖拽、模板渲染等「离谱操作」一旦踩到脏数据/空引用，就容易触发。

**怎么兜住（本项目落地）**：
1. 在 \`main.tsx\` 用 \`react-error-boundary\` 的 \`<ErrorBoundary>\` **包住整棵应用**（\`BrowserRouter\` + \`App\`），作为全局兜底
2. 子树任意处渲染出错 → Boundary 拦截，**不再向上炸掉整个 root**
3. 用自定义 \`ErrorFallback\` 替换出错子树：展示「应用出错了」+ 错误信息，并提供「重试 / 刷新页面」
4. \`resetErrorBoundary\` 清掉错误状态后重新挂载子树；刷新则整页重载——用户始终有可交互界面，而不是白屏

**一句话**：错误从「整页崩溃」变成「可控降级 UI」；全局包一层 = 再离谱的操作也至少还能看到兜底页并恢复。

**边界（面试加分）**：ErrorBoundary **只吃渲染期 / 生命周期 / 子组件 constructor** 的错误；**事件回调、异步、\`setTimeout\`、服务端、Boundary 自身**里的错误管不到——那些要靠 try/catch、Promise 兜底或页面级 Boundary 补强。`,
    tags: ["GResume","错误处理"],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-rb-002',
    module: 'projects',
    chapterId: 'gresume',
    category: '项目总览',
    question: "完整精简总结该项目（动机、技术选型、迭代周期、功能、技术难点）",
    answer: `**定位**：GResume（仓库名 \`granular-resume\`）——智能简历创作与求职管理平台。求职既要过人审也要过 ATS；把「写简历 → 换模板 → AI 优化 → 多人协作 → 投递追踪 → 版本回溯 → 导出」收成一站式产品。**离线优先**：未登录即可用（IndexedDB），登录后同步云端（Supabase）。

---

### 动机

| 痛点 | 产品回应 |
|------|----------|
| 简历内容散、改一版丢一版 | Schema 驱动多模块编辑器 + 实时预览 + 版本历史 |
| 好看但过不了 ATS / 和 JD 不对口 | 五维 ATS 评分 + 可执行修复 + 划词改写 + JD 派生简历 |
| 投递进度靠 Excel | Tracker 看板/列表全流程 |
| 想找人一起改又怕冲突覆盖 | Automerge CRDT 协作（后续富文本再加 Yjs） |
| 换模板要重排内容 | 模板与内容解耦 + 可视化模板工作台 |

---

### 技术选型（及理由）

| 层 | 选型 | 为何 |
|----|------|------|
| 前端 | React 19 + TS 5.9 + Vite 7 | 类型安全、文件路由（vite-plugin-pages）、分包（tiptap / automerge / supabase） |
| UI | shadcn/ui + Radix + Tailwind 4 | 可组合、无重型设计系统包袱 |
| 状态 | Zustand（应用级 / 页面级 store） | 轻量，适合表单+协作+任务等跨组件领域态 |
| 表单 | RHF + Zod | Schema 即校验、模块可增删 |
| 富文本 | TipTap 3 | 所见即所得 + 可挂协作/划词 AI |
| 协作主文档 | Automerge + automerge-repo | CRDT 无冲突合并；IndexedDB 持久化 + Supabase Realtime 同步 |
| 富文本协作（深化） | Yjs + TipTap Collaboration | 解决 HTML 镜像 LWW「后写覆盖」，字符级合并 + awareness 光标 |
| 后端 | Supabase（Auth / PG / Realtime / Edge Functions） | BaaS 覆盖账号、存储、实时、LLM 代理 |
| AI | Vercel AI SDK + DeepSeek（经 \`llm-proxy\`） | 流式结构化输出；密钥不出前端 |
| 离线 | idb / IndexedDB | 先本地后云端，派生/血缘离线也可用 |
| 导出 | react-to-print（PDF）+ docx（Word） | 高保真排版投递 |
| 部署 | Vercel | 前端一键发布 |

---

### 开发迭代周期（changelog 实锤，约 8 个月）

\`\`\`
2025-10  v0.1  编辑器 MVP（TipTap + 10+ 模块 + 拖拽 + 预览 + ErrorBoundary）
2025-10  v0.2  Automerge 实时协作（分享链接 / 远程光标 / 离线合并）
2025-11  v0.3  PDF 导出 + 账号；A4 智能分页
2026-01  v0.5  ATS 优化引擎 + Dashboard
2026-02  v0.6  版本历史 + LLM 自动修复（对比后应用）
2026-03  v0.8  求职 Tracker（看板+列表）+ JD 匹配 + UI 大改
2026-03  v0.9  完整外观配置 + 移动端 PDF
2026-04  v1.0  模板中心 / 工作台 / 可视化编辑器（里程碑：主链路齐备）
2026-05  v1.1  划词 AI 改写（5 动作、多候选、安全 HTML）
2026-06  v1.2  JD 派生简历（两阶段、事实字段保护、后台任务、血缘树）
2026-07        协作深化（字段级 Automerge sync + 富文本 Yjs，见 design spec）
\`\`\`

节奏：**先能写 → 能协作/导出 → AI 过 ATS → 管投递 → 模板产品化 → JD 工作流闭环**。

---

### 实现功能（按产品面）

1. **简历编辑**：12 模块 Schema 表单；拖拽显隐排序；TipTap 富文本；并排实时预览；外观工具栏
2. **简历列表**：创建/删改；本地↔云端同步；原始/派生筛选；JD 派生入口与后台任务
3. **模板**：官方 6 套（基础/简约/现代/商务侧栏/ATS 紧凑/分段）+ 社区/我的；manifest 驱动；可视化改布局与样式；一键绑定
4. **AI / ATS**：五维分（解析度/可读性/完整度/量化/职位匹配）；字段级修复建议；JD 比对、格式化、ATS 纯文本预览、行业基准；划词 5 种改写
5. **JD 派生**：解析关键词 → 只改描述性字段 → 对比+匹配度 → 独立新简历；血缘树；在线/离线双路径
6. **协作**：多人实时编辑、邀请链接、在线成员、远程光标、变更提示
7. **Tracker**：看板（保存→投递→筛选→面试→录用）+ 列表搜索筛选；面试轮次/备注
8. **历史**：云端时间线预览与非破坏恢复
9. **导出**：PDF（智能分页，含移动端）+ Word
10. **账号 / Dashboard / Changelog**：Auth；首页统计与待办；MDX 更新日志

---

### 技术难点与攻克

| 难点 | 怎么解 |
|------|--------|
| **结构化数据并发冲突** | Automerge CRDT：同时改不互相覆盖；离线回来自动合并 |
| **富文本并发后写覆盖** | 文档层 Automerge 存 HTML 镜像供预览/导出；会话内 TipTap 字段走 Yjs 字符级合并，再桥回 Automerge |
| **ATS「只打分不落地」** | LLM 结构化 JSON + 字段 path 定位 + 可执行 suggestion（替换/填充/日期规范化）+ Schema 驱动自定义编辑器写回 |
| **PDF 分页与移动端打印** | 自研按模块高度断页；移动端独立打印窗口规避 iframe/Safari 弹窗坑 |
| **模板与内容纠缠** | Manifest 运行时与简历 JSON 解耦；binding 存 \`resume_config\`，换皮不改内容 |
| **离线 / 云端双轨** | IndexedDB 先行；登录批量同步；派生字段/血缘在线离线同抽象 |
| **JD 派生误改事实** | 两阶段生成 + 事实字段保护白名单；后台任务可取消/重试；深度上限防血缘爆炸 |
| **AI 内容安全** | Edge Function 代理密钥；划词结果 DOMPurify 再写回选区 |
| **渲染崩溃白屏** | 全局 ErrorBoundary 降级 UI（见 Q1） |

**面试收束一句话**：这是一个以离线优先编辑器为内核、用 CRDT 扛协作、用 Schema+LLM 闭环 ATS/JD、用模板运行时做外观产品化的全链路求职工具；迭代从 MVP 写简历走到 v1.2 的「一份底稿 → 多岗位派生」工作流。`,
    tags: ["GResume","项目总览"],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'gresume-rb-003',
    module: 'projects',
    chapterId: 'gresume',
    category: '富文本',
    question: "为什么选择 TipTap 富文本编辑器？和普通编辑器有何不同？怎样接入使用的？",
    answer: `**选型结论**：简历描述字段需要「所见即所得 + 可编程扩展 + 可挂协作/AI」，不是简单多行输入。TipTap（基于 ProseMirror）同时满足：结构化文档模型、React 友好、扩展生态、能接 Yjs 协作与划词改写。

---

### 为什么选 TipTap（相对「普通编辑器」）

| 对比维度 | \`textarea\` / contentEditable 裸写 | 重量级套件（如 Quill/CKEditor 黑盒） | **TipTap（本项目）** |
|----------|-----------------------------------|--------------------------------------|----------------------|
| 文档模型 | 纯字符串 / 不可控 DOM | 有模型但扩展受限、定制成本高 | ProseMirror 文档树；命令/事务清晰 |
| 输出形态 | 难稳定拿到结构化 HTML | 有，但难深入 | \`editor.getHTML()\` / JSON，直接喂预览、PDF、历史、Automerge |
| UI 定制 | 自己造 | 默认皮肤难改 | Headless：工具栏、BubbleMenu 全自建（贴 shadcn） |
| 扩展能力 | 几乎没有 | 插件有限 | Extension 拼装：StarterKit + Highlight/Image/对齐/任务列表… |
| 协作 | 要自研 OT/CRDT | 少见一等公民 | 官方 \`Collaboration\` / \`CollaborationCaret\` + Yjs |
| AI 划词 | 难拿精确选区 | 难插业务面板 | \`BubbleMenu\` + 选区 API → 改写后 \`insertContentAt\` 写回 |

**一句话**：普通编辑器管「能打字」；TipTap 管「可扩展的富文本文档运行时」——简历场景后续要协作、划词 AI、安全 HTML、模板预览，扩展点必须从第一天就在。

changelog（v0.1）原话：基于 TipTap，「不是普通的 textarea」，工具栏/快捷键/格式都齐。

---

### 和「普通富文本」在本项目中的关键差异

1. **数据契约是 HTML，不是黑盒**：表单字段存 HTML；预览/导出/ATS/历史都消费同一份，编辑器只是生产者。
2. **双模式**：standalone 用 \`content\` prop；协作时 **Yjs fragment 为真源**，禁止再注入初始 content（防多端重复），HTML 去抖镜像回 Automerge。
3. **业务能力挂在编辑器上，而不是旁边另起一套**：\`AiRewriteBubble\` 直接拿 \`Editor\` 实例读写选区。

---

### 怎样接入使用（本仓库真实链路）

**依赖**：\`@tiptap/react\` / \`starter-kit\` / 各类 extension（highlight、image、list、collaboration…），Vite 单独 chunk \`tiptap-editor\`。

**接入分层**：

\`\`\`
表单模块（工作/项目/实习…）
  → RichTextFieldEditor（包 hook，避免 map 里违规调 hook）
    → useRichTextCollab（有会话则给 collab 配置，否则 undefined）
      → SimpleEditor（useEditor + 工具栏 + EditorContent）
        → buildEditorExtensions（StarterKit + 自研 ImageUpload/HR + 可选 Collaboration）
        → onUpdate → editor.getHTML() → RHF / store
        → 可选 AiRewriteBubble（fieldContext）
\`\`\`

**核心用法**（\`SimpleEditor\`）：
1. \`useEditor({ extensions: buildEditorExtensions({ collab, onImageError }), content? })\`
2. 协作：关 StarterKit 自带 history，挂 \`Collaboration\` + 去重版 \`CollaborationCaret\`
3. \`EditorContent\` 渲染；\`EditorContext\` 供工具栏按钮读 editor
4. \`editor.on('update')\`：standalone 即时 \`onChange\`；collab 300ms 去抖镜像
5. 外部 \`content\` 变化：仅 standalone 下 \`setContent\`，并用 flag 防回环

**业务侧一行式接入**（\`rich-text-field-editor.tsx\`）：

\`\`\`tsx
<SimpleEditor
  content={value || ''}
  onChange={editor => onChange(editor.getHTML())}
  fieldContext={fieldContext}  // 划词 AI 用
  collab={collab}              // 协作会话用
/>
\`\`\`

各经历表单把 \`fieldContext={{ sectionKey, fieldLabel, jobIntent }}\` 传下去，AI 就知道「改的是哪块、岗位意向是什么」。

**面试可补一句**：选 TipTap 不是因为「富文本好看」，而是因为它是后续协作 CRDT、划词 LLM、HTML 管道（预览/PDF）的同一编辑运行时；换 textarea 这些能力都要重做。`,
    tags: ["GResume","富文本"],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-rb-004',
    module: 'projects',
    chapterId: 'gresume',
    category: '富文本',
    question: "追问：TipTap 拖拽排序如何实现设计的？",
    answer: `**先纠偏**：changelog 里「拖拽排序」和 TipTap **不是一件事**。

- **TipTap**：负责模块内富文本的编辑（加粗、列表、图片等）
- **拖拽排序**：负责简历**模块 Tab 的顺序**（教育 / 工作 / 项目…谁在前），落在侧边栏 \`order[]\`，驱动预览与导出结构

面试时若被问「TipTap 怎么拖拽排序」，应明确说：**排序不在 TipTap 里实现**；TipTap 里只有图片上传节点的拖入/节点拖动，没有「模块重排」产品能力。

---

### 产品设计目标

| 约束 | 设计 |
|------|------|
| 基本信息固定 | \`basics\` **不进**可拖列表，始终钉在最前 |
| 排序结果持久化 | 写入 Zustand \`order\`，随简历配置同步云端/离线 |
| 预览跟随 | 渲染按 \`order\` + \`visibility\` 排模块 |
| 桌面 / 移动体验分离 | 桌面：侧栏横滑 + **Grip 手柄**；移动：底部 Sheet 里竖排长按拖，确认才提交 |

---

### 演进（真实历史）

1. **v0.1**：自研 \`DragContext\`（mouse 事件 + Portal 预览 + 手算让位动画），changelog 写「不依赖第三方拖拽库」
2. **2026-04-19**：迁移到 \`@hello-pangea/dnd\`（设计文档明确：触摸/键盘 a11y、误触、动画抖动、维护成本）
3. **现状**：侧栏只用 hello-pangea；自研 \`DragContext\` 栈已删除（spec 要求删除；当前仓库已无该接入）

---

### 当前实现设计

**数据流**：

\`\`\`
用户拖拽 Tab
  → handleDragEnd(splice 重排 orderDraggable)
  → onUpdateOrder(['basics', ...next])
  → useResumeStore.updateOrder
  → 持久化 resume 配置（含 order）
  → 预览/导出按新 order 渲染
\`\`\`

**桌面**（\`sidebar/index.tsx\`）：
- \`DragDropContext\` → \`Droppable(direction="horizontal")\` → 每个模块 \`Draggable\`
- \`SortableTab\`：\`dragHandleProps\` 只挂在 \`GripVertical\` 上（整块点不会误拖）
- Switch 外包 \`onPointerDownCapture stopPropagation\`，避免拖动手柄抢开关
- 拖动中 \`createPortal(..., document.body)\`，避免被侧栏 overflow 裁切

**移动**（\`MobileSortDialog\`）：
- 侧栏本身不拖（\`StaticTab\`），打开 Sheet
- 本地 \`draft\` 上拖拽；点确认才 \`onConfirm(['basics', ...draft])\`，取消不污染正式 order

**重排算法**（经典 splice）：

\`\`\`ts
const next = [...orderDraggable]
const [moved] = next.splice(source.index, 1)
next.splice(destination.index, 0, moved)
onUpdateOrder(['basics', ...next])
\`\`\`

无 destination 或 index 不变 → 直接 return。

---

### TipTap 里和「拖」相关的能力（勿与模块排序混淆）

| 能力 | 作用 |
|------|------|
| \`ImageUploadNode\` 拖放区 | 拖文件进编辑器上传图片 |
| 节点 \`draggable: true\` | ProseMirror 文档内挪节点位置 |
| dropcursor 样式 | 文档内放置指示线 |

这些都不改简历 \`order[]\`，也不决定「工作经历模块排在项目前面」。

---

### 面试话术（30 秒）

「拖拽排序是简历模块级能力，不是 TipTap 插件。早期自研 DragContext，后来迁到 hello-pangea/dnd：basics 固定，其余进 Droppable；桌面手柄拖、移动端对话框确认；\`updateOrder\` 写进 store，预览跟 order 走。TipTap 只管字段里的富文本。」`,
    tags: ["GResume","富文本"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-005',
    module: 'projects',
    chapterId: 'gresume',
    category: '富文本',
    question: "富文本编辑时的实时预览怎么做？个性化配置如何做、怎样实时预览？会不会重排重绘拖垮性能？",
    answer: `### 先用一句话说清楚

编辑页是「左边写、右边看」。右边看到的不是把左边编辑器截一张图贴过去，而是：**同一份简历数据存在全局状态里**；左边一改，状态更新，右边用同一套「简历排版引擎」再画一遍。个性化（字体、间距、主题色）也是同一思路：改配置 → 配置状态变 → 右边用新样式再画一遍。

所以「实时」的本质是：**共享数据源 + 状态变化触发重新渲染**，不是两套各写各的。

---

### 一、富文本编辑时，实时预览到底怎么串起来的？

#### 1. 页面长什么样

打开简历编辑器后，大致是：

- **左侧**：各个模块的表单（基本信息、工作经历等），经历描述用 TipTap 富文本
- **右侧**：A4 纸效果的简历预览（和最终导出长得一样的那套排版）

两边同时挂在编辑页上，用户打字时右边跟着变。

#### 2. 数据存在哪

简历内容（姓名、经历、富文本 HTML、模块顺序、显隐等）放在 **Zustand 的简历表单状态**里（\`useResumeStore\`）。

可以把它理解成「内存里的那份当前简历」。左侧编辑器负责改它，右侧预览负责读它。

#### 3. 你在富文本里敲一个字之后，发生了什么（按顺序）

用「改工作经历描述」举例：

1. **TipTap 内部文档变了**  
   你每输入一点，编辑器自己的内容先更新（光标、加粗等还是编辑器自己管）。

2. **导出成 HTML 字符串**  
   编辑器通过 \`getHTML()\` 把当前内容变成一段 HTML（比如带 \`<p>\`、\`<strong>\` 的字符串）。  
   简历里存的就是这段 HTML，而不是「编辑器组件本身」。

3. **表单收到新值**  
   外层用 React Hook Form 管字段；富文本一变，就 \`onChange\` 把这段 HTML 写进对应字段（例如某段工作经历的描述）。

4. **表单和全局简历状态对齐**  
   项目里有一层同步逻辑（\`useResumeFormSync\`）：表单值一变，就对比「刚才全局状态里是什么」和「现在表单是什么」，只把真正变了的字段写回全局状态。  
   这样做的好处：不要每次都整段覆盖整个「工作经历」模块，减少误伤其他字段（协作时尤其重要）。

5. **右侧预览订阅了这份全局状态**  
   预览组件一发现简历数据变了，就重新组装一份给排版引擎用的数据（\`buildTemplateResumeData\`）：把基本信息、各模块、顺序、显隐、当前模板绑定等打包。

6. **排版引擎按「模板说明书」把简历画出来**  
   \`ResumeTemplateRuntime\` 做的事可以理解为：
   - 先搞清楚当前用哪套模板布局（单栏、左右栏、分段等）——来自模板配置（manifest）
   - 再按用户的模块顺序，决定教育、工作、项目谁先谁后
   - 每个模块有对应的「小渲染器」，把数据画成标题、公司名、时间、正文等
   - 富文本 HTML 会先做安全清理，再解析成页面上能显示的内容（避免危险标签）

7. **套上 A4「分页纸壳」**  
   外面还有一层 \`PagedResumeShell\`：按 A4 高度估算要几页，用「同一份内容 + 不同裁剪窗口」做出第 1 页、第 2 页…的效果，接近真实打印/导出。

8. **小屏再整体缩小**  
   预览区宽度不够时，不是把内容挤扁重排字号，而是量好纸的宽高后，用 **整体缩放（scale）** 塞进可视区域，看起来仍是完整 A4 比例。

#### 4. 为什么说「不是截图预览」

| 做法 | 本项目有没有 |
|------|----------------|
| 左边编辑器截屏贴右边 | 没有 |
| 左边改完，右边读同一份状态再画 | 有（这是主路径） |
| 导出 PDF 时另起一套完全不同的排版 | 尽量共用同一套运行时，保证「预览即所得」 |

面试时可以强调：**预览和导出尽量走同一条渲染链路**，用户调样式、改内容时，不会出现「预览好看、导出变样」的割裂。

#### 5. 协作编辑时多一个「稍微等一下再同步」

多人协作时，富文本真正的实时编辑在协作通道里；同步到「给预览/导出用的 HTML」时，做了大约 **300 毫秒的合并更新**（短时间连续输入会合并成一次再写出去）。

人话版：打字很快时，不必每个字母都立刻逼右侧整页简历狂刷；稍微攒一下再更新预览数据，手感更稳、也更省。

---

### 二、个性化配置是怎么做的？又怎样做到实时预览？

#### 1. 用户能调什么

编辑器顶部工具栏（间距 / 字体 / 主题）大致三类：

| 类型 | 具体能调什么 | 直观效果 |
|------|--------------|----------|
| 间距 | 模块上下空隙、行距、页边距 | 疏一点还是挤一点 |
| 字体 | 字体种类、基础字号 | 标题/正文整体变大变小、换字体 |
| 主题 | 预设配色方案 | 标题线、强调色等跟着换 |

这些在 changelog 里叫「个性化配置 / 自定义外观」，从早期就有，后来做成更完整的工具栏体系。

#### 2. 配置存在哪（和「简历正文」分开）

正文内容在「简历表单状态」里；外观在另一份 **外观配置状态**（\`useResumeConfigStore\`）里。

拆开的原因很好理解：

- 改主题色，不需要动你的工作经历文字
- 换字体，也不该误触发「内容字段被改写」
- 持久化时，外观可以随这份简历一起存云端，但逻辑上仍是独立一块

改滑块/下拉时：先更新外观状态，再顺带触发「把外观写回当前简历」的持久化（登录后云端、以及文档侧同步），刷新回来配置还在。

#### 3. 配置如何变成右边「看得见的样式」

可以想成三步翻译：

1. **原始配置**：例如「模块间距 24px」「主题 blue」  
2. **翻译成渲染好用的一包样式参数**（\`useResumeStyles\`）：  
   - 姓名用多大字、正文用多大字  
   - 模块之间 gap 多少、行高多少  
   - 当前主题对应的主色、正文色、次要文字色  
3. **通过 Context 发给下面的各个模块渲染器**  
   标题、条目、布局骨架读这些参数，用在元素的 style 上（字号、颜色、间距等）。

因此：你在工具栏拖「模块间距」，右边空隙马上变——因为预览树读的就是这份刚更新的外观状态，没有「点保存才生效」的中间步。

#### 4. 和「换模板」的关系（避免面试说混）

- **个性化配置**：同一套模板下，调疏密、字体、颜色（用户工具栏）  
- **换模板 / 模板工作台**：换布局骨架、模块分区、模板自己的默认疏密等（另一条产品线）

编辑页预览默认直接读用户工具栏那份外观配置；模板侧也可以从模板说明书推导默认外观，但问「编辑时个性化实时预览」时，主答工具栏这条即可。

---

### 三、这样会不会一直重排、重绘，把性能拖垮？

#### 1. 先把两个词说成人话（方便答题）

- **重新排版（常说的重排 / reflow）**：浏览器要重新算元素占多大、在哪——比如字变大、边距变宽、多了一段文字导致后面整体下移。  
- **重新上色绘制（常说的重绘 / repaint）**：位置大小差不多，但颜色、阴影等变了，要再画一遍像素。

内容变了、间距/字号变了，右侧预览**几乎一定会**走到「再算布局 + 再画」——这是正常的，因为右边本来就是在「真排一份简历」。

问题不该问成「有没有重排」（有），而该问成：**刷得是否太勤、算的范围是否太大、有没有把整页无关区域也拖下水。**

#### 2. 本项目里，贵的操作主要有哪些

**（1）状态一变，右侧 React 树要更新**  
预览组件读了简历里很多模块的数据。实现上目前是比较「整份一起拿」的订阅方式，所以：**任意一块内容变了，整份预览组件都可能重新跑一遍渲染逻辑**。  
对一份普通简历来说通常还能接受；模块特别多、HTML 特别长时，这里会是第一优化点（改成「只订阅真正用到的字段」）。

**（2）分页要量高度**  
分页壳会观察内容高度，估算 A4 要几页。高度一变就要再量——改字、改间距、改字号都会影响。这是「要真实纸感」换来的成本。

**（3）多页时内容要按页裁剪展示**  
实现上是「同一份排好的内容，用不同窗口裁出第 N 页」。页数变多，展示成本会上去。这是产品选择：要接近打印效果，而不是只做无限长的一页网页。

**（4）富文本 HTML 要解析成可显示内容**  
每次相关字段更新，预览侧都要处理这段 HTML。经历写得很长时，这里比「改一个姓名字符串」更重。

#### 3. 已经做了哪些「别那么拼命刷」的设计

| 做法 | 用大白话解释 |
|------|----------------|
| 内容和外观分两份状态 | 改颜色不必假装「正文被编辑了」；职责清晰，也方便单独持久化 |
| 协作输入合并约 300ms | 连打时不要每个字母都逼预览刷新 |
| 样式参数做了记忆计算 | 配置没变就复用上一份算好的字号/颜色，少做重复翻译 |
| 小屏用整体缩放 | 优先「整张纸缩小」，而不是为了塞进屏幕去改乱内部排版规则；缩放本身也相对便宜 |
| 缩放尺寸变化有「差不多就不更新」 | 避免测量结果抖一点点就反复 setState |
| 分页测量绑在外观相关变化上 | 不是毫无节制地到处量，主要跟着边距、行高、字号等会影响纸面高度的量走 |

#### 4. 面试里怎么表态更加分

诚实版结论：

1. **会有布局和绘制开销**，因为预览就是真实排版，不是静态图。  
2. **当前简历体量下可接受**；我们优先保证「预览 ≈ 导出」。  
3. **已知可以继续挖的点**：预览订阅别整份一把抓、超长页考虑更轻的预览模式、模块渲染结果可记忆。  
4. **真正该警惕的**不是「有没有 reflow 这个词」，而是「输入一次是否触发了过大范围的无效更新」。

---

### 四、串起来的复习版（面试 1 分钟）

「我们预览不是截图。左边 TipTap 把内容变成 HTML，经表单写进全局简历状态；右边读同一份状态，用模板排版引擎按模块顺序画成 A4，再分页、必要时整体缩放。  
个性化是另一份外观状态：工具栏改间距、字体、主题，翻译成字号颜色间距后，通过上下文给各个模块渲染器用，所以拖滑块右边马上变，并随简历持久化。  
性能上必然会重新算布局和绘制，但协作输入有短延迟合并，内容和外观分开存，小屏缩放尽量不动内部排版。若以后简历很长，优先优化预览的数据订阅粒度和分页成本。」`,
    tags: ["GResume","富文本"],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-rb-006',
    module: 'projects',
    chapterId: 'gresume',
    category: '实时协作',
    question: "讲讲版本 0.2 的实时协作上线",
    answer: `### 一、这个版本要解决什么问题

v0.1 已经能写简历、实时预览，但还是「一个人闷头改」。求职场景里很常见的是：把简历甩给朋友、导师、学姐一起改意见。

v0.2（2025-10-25，标题「实时协作上线」）要解决的是：

- 多人同时改同一份简历，**不要互相覆盖**
- 分享成本要低：**一个链接**就能进来
- 协作时要有「人感」：能看到对方在哪、对方干了啥
- 网络不稳时也能继续写，**回来自动合在一起**

一句话定位：**把简历从单人编辑器，升级成可分享的实时共编文档。**

---

### 二、对外交付了哪些能力（changelog 原文能力）

| 能力 | 用户感知 |
|------|----------|
| 多人实时编辑 | 几个人同时改，不会「你一保存我写的没了」 |
| 一键分享协作链接 | 点开启 → 复制链接 → 对方打开就能一起改 |
| 远程光标 | 能看到对方鼠标大概在页面哪一块 |
| 实时变更提醒 | 有人加入/离开、对方做了某些操作，会有提示 |
| 协作面板 | 看谁在线、管理开启/停止共享 |

技术上 changelog 点名了四件套：**Automerge（CRDT）+ Supabase Realtime + IndexedDB + Perfect Cursor**。

---

### 三、为什么选 Automerge，而不是「加锁 / 谁后保存谁赢」

传统做法常见坑：

- **加锁**：同一时间只许一个人改 → 体验差  
- **后写覆盖**：两个人改不同字段也可能互相踩；改同一段更容易丢字  

v0.2 选的是 **CRDT（可以理解成：天生适合多人同时改、自动合并的数据结构）**，具体库是 **Automerge**：

- 每个人本地都有一份可编辑的文档副本  
- 改动会变成可同步的增量  
- 合并时按 CRDT 规则自动合，**不需要中心服务器当裁判说「听谁的」**  
- 所以 changelog 强调：不需要锁，也不需要「谁先保存谁赢」

整份简历（各模块内容、顺序、外观相关快照等）就是一份 Automerge 文档；本地编辑最终会落到「改这份文档」。

---

### 四、整体怎么跑起来（用故事串）

#### 1. 发起者（Host）开启协作

1. 在编辑器点「开启协作」  
2. 系统生成一个 **会话 ID**（可以理解成这次「房间号」）  
3. 把实时同步通道接上（见下一节）  
4. **立刻把当前最新简历存到云端一份**——确保后面进来的人拿到的是新版本，而不是旧快照  
5. 生成分享链接（URL 上带上简历 ID、会话 ID，以及文档地址等信息）  
6. 发起者复制链接发给别人  

#### 2. 受邀者（Guest）加入

1. 打开链接  
2. 页面识别到「这是协作会话」  
3. 加载同一份 Automerge 文档，加入同一个实时房间  
4. 之后双方的改动开始互相同步  

#### 3. 停止协作

- **Host 停止共享**：广播「协作结束」→ 断开同步 → 清掉链接参数；Guest 会收到提示并离开协作态  
- **Guest 自己离开**：断开后回到普通简历列表/首页流程  

补充限制（面试诚实说）：**纯离线本地简历（还没上云的那种）不能开协作**；需要在线简历、且通常要登录后的在线模式。

---

### 五、同步通道：其实不止「传简历内容」一条线

为了职责清晰，协作期间大致是 **多条实时通道各干各的**（都走 Supabase 的实时能力，本质是 WebSocket 一类长连接）：

| 通道在干什么 | 大白话 |
|--------------|--------|
| Automerge 文档同步 | 真正传「简历改了什么」，保证内容一致 |
| 页面鼠标光标 | 传对方鼠标大概位置，用来画远程光标 |
| UI 状态/操作 | 例如跟随模式下：对方切了模块 Tab、开了某个面板、滚动位置等；并可配合提示 |

这样拆的好处：**改内容的同步**和**「看见对方在哪」的表现层**互不绑死——光标抖一下，不该搞乱文档合并。

---

### 六、远程光标和变更提醒怎么做的

#### 远程光标

- 本机监听鼠标移动，按很短间隔把坐标发出去（有节流，避免刷爆）  
- 对方收到后，不是坐标瞬移，而是用 **Perfect Cursor** 做平滑插值，看起来像光标「滑过去」  
- 注意：v0.2 说的远程光标，主要是 **整页上的鼠标指针**，不是后来富文本里那种「插入光标闪在字缝里」

#### 变更提醒

- 有人加入 / 离开：弹提示  
- 在「跟随模式」打开时：对方的一些 UI 操作也会同步，并可能提示（切 Tab、改主题、滚动跟随等）  
- 跟随可以关掉：关掉后就少干扰，更像「只同步简历内容，不跟着对方界面走」

---

### 七、断网了会怎样（离线合并故事）

这是 v0.2 很爱被追问的点，可以分三层讲：

1. **本地先能写**  
   Automerge 文档缓存在浏览器 **IndexedDB** 里。断网时你仍可继续改本地副本。

2. **联网后自动合**  
   通道恢复后，本地累积的改动和其他人的改动按 CRDT 规则合并，而不是简单「用云端整份覆盖掉你离线写的」。

3. **云端还有快照兜底**  
   在线编辑会把文档存回云端（有延时保存）；**开启协作那一刻会强制先存一版**，降低「协作者一进来就是旧稿」的概率。  
   同步适配层里还有「文档还没就绪时先把收到的消息暂存、就绪后再消化」的缓冲，减少竞态丢包感。

---

### 八、和表单 / 预览怎么接在一起

协作不是另做一套编辑器，而是插在已有编辑链路上：

\`\`\`
你在表单 / 富文本里改
  → 写入全局简历状态
  → 落到 Automerge 文档变更
  → 经实时通道同步给其他人
  → 对方文档更新 → 状态更新 → 对方预览/表单跟着变
\`\`\`

所以 v0.2 的协作，和 v0.1 的「状态驱动实时预览」是同一套产品哲学：**一份真相数据，多端订阅它。**

---

### 九、答 v0.2 时不要越界说成的能力（避免面试穿帮）

v0.2 宣传的是 **整份简历文档级的 Automerge 协作**。  
更细的「富文本里两个人改同一段字、按字符级合并、编辑器内远端插入光标」是 **更后期（约 2026-07）用 Yjs 叠加的能力**，当时 changelog 还没把它算进 0.2。

所以答 0.2 时建议口径：

- ✅ Automerge + Realtime + IndexedDB + 分享链接 + 页面远程鼠标 + 协作面板  
- ❌ 不要把「Yjs 字符级富文本共编」说成 0.2 已上线  

当时富文本更多是：描述字段作为文档里的 HTML 一起同步；同一段打字仍可能有「后写感」，这是后续要深化的点。

---

### 十、复习用口述（约 1 分钟）

「0.2 把简历做成可分享的实时共编。核心用 Automerge，多人同时改自动合并，不用加锁也不靠后保存覆盖。同步走 Supabase 实时通道，本地 IndexedDB 缓存，断网可写、联网再合。发起协作会先把最新版存云端，再生成带会话号的链接；对方打开加入同一房间。另外用独立通道做页面远程鼠标（Perfect Cursor 做平滑）和在线成员/操作提示，跟文档同步拆开。协作面板负责开启、分享和停止。注意 0.2 是文档级 CRDT 协作；富文本字符级共编是更后面的增强。」`,
    tags: ["GResume","实时协作"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-007',
    module: 'projects',
    chapterId: 'gresume',
    category: '实时协作',
    question: "追问：实时变更提醒如何实现？（详细）",
    answer: `### 先澄清：提醒 ≠ 把每次打字都弹出来

changelog 里的「实时变更提醒」**不是**「对方每改一个字就弹一条 toast」——那样会刷屏、也没意义。  
实际是：**协作会话生命周期 + 人的进出 +（可选）界面操作跟随** 这几类「值得让人知道」的事件，用提示条告诉你；真正的内容变更主要靠预览/表单自动同步，而不是靠弹窗念一遍。

可以分成 **三层提醒** 来记。

---

### 第一层：会话级提醒（开房间 / 进房 / 退房 / 结束）

**实现位置**：协作会话 store（\`session/store.ts\`）+ 会话回调（\`session/callbacks.ts\`）  
**展示**：\`sonner\` toast

| 事件 | 谁触发 | 用户看到什么 |
|------|--------|----------------|
| Host 开启协作成功 | 本地 \`startSharing\` | 「已开启实时协作」+ 可分享链接的说明 |
| Guest 加入成功 | 本地 \`joinSession\` | 「已加入实时协作」 |
| Host 恢复托管 | 刷新后 \`resumeHosting\` | 「已恢复实时协作」 |
| Host 关闭 / Guest 退出 | 本地 stop | 「已关闭 / 已退出实时协作」 |
| Host 关掉房间，Guest 被踢 | 控制消息 \`share-ended\` | 「协作已结束，发起者已关闭」 |
| 失败 | catch | error toast，提示重试 |

**Host 关房怎么通知 Guest（重点）**：

1. Host 调用停止共享前，先 \`broadcastCollaborationEvent('share-ended')\`  
2. 这条控制消息走 **Automerge 那个实时频道**（和文档同步同一条通道上的控制面）  
3. Guest 侧 \`onControlMessage\` 收到 \`share-ended\`，且自己不是 host → \`handleRemoteShareEnd()\` → warning toast + 离开协作态  

所以「发起者关了，对方马上知道」靠的是 **显式控制广播**，不是靠对方猜「怎么没人了」。

---

### 第二层：人进出提醒（Presence）

**实现位置**：\`SupabaseNetworkAdapter\` 监听 Realtime **presence** 的 join/leave → 回调 \`onPeerJoin\` / \`onPeerLeave\` → \`createSessionCallbacks\`

流程用人话讲：

1. 每人连上协作频道时，会 \`track\` 自己的 presence（带上用户名、角色等元数据）  
2. 频道里其他人一上线，本机收到 \`presence join\`  
3. 回调里：把人加进「在线成员」列表；若不是自己，就 toast：**「张三 加入协作」**（描述里常带「已同步最新内容」）  
4. 有人离开：从列表移除，toast：**「张三 退出协作」**  
5. 过滤自己的 peerId，避免「自己加入也弹一条」的尴尬  

协作面板上的在线成员列表，和这类 toast，吃的是同一套 presence 数据。

---

### 第三层：界面操作提醒（UI 通道 + 跟随模式）

这一层才是「对方干了什么」的细粒度提醒，而且 **默认跟「跟随模式」绑定**。

#### 通道为什么单独开一条

文档同步已经够忙了，UI 操作（切 Tab、滚预览、改主题）如果塞进文档里会很怪。  
所以另开 UI 实时频道（房间名大致是 \`…:ui\`），专门传两类东西：

- **状态广播**：我当前抽屉开没开、停在哪个模块 Tab（给在线列表/状态展示用）  
- **动作广播**：我刚做了某个操作（开抽屉、切 Tab、改间距/字体/主题、滚动）

本机改 UI → \`broadcastUIAction\` 发出去 → 对方 \`onRemoteAction\` 收到。

#### 对方收到后怎么处理（\`useRemoteCollaborationAction\`）

关键开关：**跟随模式 followMode**

- **关闭跟随**：收到动作也直接 return——不跟界面、也基本不弹这类操作 toast（只保留会话/进出那一层）  
- **开启跟随**：按动作类型执行，并在部分动作上弹短 toast，例如：
  - 对方打开/关闭编辑抽屉 → info toast「XXX 打开/关闭了编辑抽屉」  
  - 对方改主题 → toast「XXX 更改了主题」  
  - 切 Tab、改间距字体、滚动：会同步界面/样式/滚动位置；不一定每种都弹窗（避免吵）

执行远端动作时会设 \`isApplyingRemote\` 标记，防止「我跟着对方滚了一下，又把自己的滚动广播回去」造成回声循环；下一帧再清掉标记。

本地侧还有配套广播 hook：

- 抽屉 / Tab 变化 → \`useTabDrawerBroadcast\`  
- 外观配置变化 → \`useConfigBroadcast\`  
- 滚动 → \`useScrollSync\`（跟随开启才发）

#### 跟随模式本身也有提醒

点开关时会 toast 说明：「已开启/关闭跟随——会不会再跟对方 UI、会不会同步你的 UI 操作」。

---

### 串起来：一条「提醒」从产生到看见

\`\`\`
对方进房
  → Realtime presence join
  → onPeerJoin
  → 更新在线列表 + toast「XXX 加入协作」

对方改了主题（且你开了跟随）
  → 对方 UI 频道 broadcast ui-action
  → 你收到 onRemoteAction
  → followMode=true → replaceConfig + toast「XXX 更改了主题」
  → 预览样式跟着变

对方改了工作经历正文
  → 走 Automerge 文档同步（不是 toast）
  → 你的简历状态更新 → 表单/预览自动变
  → 一般不会弹「XXX 改了工作经历第 2 条」
\`\`\`

**面试金句**：变更提醒是 **事件通知层**；内容一致性是 **CRDT 同步层**。两层分开，提醒才不会变成噪音。

---

### 复习口述（5.1）

「提醒分三层：会话开关与结束用 store toast 和控制消息；人进出用 Realtime presence；界面级操作走独立 UI 频道，且受跟随模式控制——开跟随才同步并部分弹窗。正文改动靠文档同步反映到预览，不靠每个字弹 toast。Host 关房会广播 share-ended，Guest 明确收到结束提示。」`,
    tags: ["GResume","实时协作"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-008',
    module: 'projects',
    chapterId: 'gresume',
    category: '实时协作',
    question: "追问：为什么基于 Automerge CRDT 做多人实时编辑？选择理由？调研过市场吗？",
    answer: `### 一、当时要满足的产品条件（选型出发点）

1. **多人同时改**，不能靠「谁后点保存谁赢」  
2. **断网也能写**，回来还能合——简历场景经常地铁/弱网  
3. **前端为主、后端轻**：已有 Supabase，不想自建一套完整 OT 服务  
4. **整份简历是结构化文档**（很多模块、字段、数组），不是单纯一篇散文  
5. 要能 **本地持久化**（IndexedDB），刷新不丢协作中间态  

这些条件一摆，方向就偏向 **CRDT + 本地优先**，而不是中心锁或纯 OT 服务。

---

### 二、为什么是 CRDT，而不是别的常见路

| 路线 | 大意 | 对我们当时的不适点 |
|------|------|-------------------|
| 加锁 / 独占编辑 | 同时只许一人改 | 体验回到「传文件」，不像实时协作 |
| 后写覆盖（LWW 整份） | 整份 JSON 互相盖 | 必丢字、冲突体验差 |
| 经典 OT（Operational Transformation） | 中心服务器变换操作顺序 | 实现/运维重；断网合并难；要自建协同服务 |
| CRDT | 各端本地可写，按数学规则自动合 | 天然适配离线；可把同步通道换成任意广播（我们用 Supabase Realtime） |

changelog 原话方向：不需要锁，不需要「谁先保存谁赢」。

---

### 三、为什么具体选 Automerge（相对同期常见选项）

面试可以说「做过方案对比」，不必装作写过长篇调研报告，但对比维度要实在：

| 选项 | 优点 | 顾虑 / 为何当时不主选 |
|------|------|------------------------|
| **Yjs** | 生态大、和富文本（ProseMirror/TipTap）绑得极深，光标/选区成熟 | 更偏「文档编辑器内」；当时 v0.2 要先搞定**整份简历结构化数据**的共编与持久化，不是先上编辑器内字符光标 |
| **Automerge** | JSON 文档模型友好；有 automerge-repo（存储 + 网络适配抽象）；和「简历=一份结构化快照」很贴；IndexedDB storage 现成 | 富文本字符级体验不如 Yjs 生态顺手（这点后来用 Yjs 补） |
| Liveblocks / PartyKit 等托管协同 | 省事、产品化 | 成本、数据出境/绑定、定制网络与离线模型受限 |
| Firebase 协作 / 自研 OT | 有现成案例 | 与现有 Supabase 栈重复；自研 OT 成本高 |

**选 Automerge 的核心理由（可背）**：

1. **数据形状匹配**：简历本来就是嵌套对象 + 数组，Automerge 文档模型直接吃这套  
2. **本地优先**：repo + IndexedDB，断网可写  
3. **网络可插拔**：自己写 \`SupabaseNetworkAdapter\`，复用已有 Realtime，不新开协同后端  
4. **合并语义清晰**：并发编辑走 CRDT，而不是业务里手写 merge  
5. **开启协作时可落云端二进制快照**，方便后加入者对齐  

诚实补充：不是「Automerge 在所有维度碾压 Yjs」，而是 **v0.2 的主矛盾是整份结构化简历共编**；Yjs 更适合下一阶段 TipTap 字符级——后来也确实走了双 CRDT。

---

### 四、调研/对比时怎么表述更加分

可以说：

- 看过 CRDT vs OT 的取舍（离线、服务端复杂度）  
- 看过 Yjs / Automerge 在「富文本 vs JSON 文档」上的生态重心  
- 评估过托管协同（省时间但绑平台）vs 自建适配器（贴合 Supabase）  
- 最终：**Automerge 管简历真相文档 + Supabase 传增量**；表现层光标/UI 另开通道  

不要说「市面上只有 Automerge」——说「按我们的数据模型和后端约束选了它」。`,
    tags: ["GResume","实时协作"],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-rb-009',
    module: 'projects',
    chapterId: 'gresume',
    category: '实时协作',
    question: "追问：怎么做到「不冲突」的？",
    answer: `### 一、先定义「不冲突」在本项目里指什么

用户听感：两个人同时改，**不会整份互相覆盖、不会必须手动点合并**。  

工程含义分两层：

1. **文档层**：两端都有合法的最终态，CRDT 保证收敛（大家最终看到一致结果）  
2. **产品层**：尽量让「改不同字段」互不打扰；「改同一段文字」尽量按字符合，而不是整段掐掉  

v0.2 先保证第 1 层 + 结构化字段的可用共编；第 2 层在后续字段级写入 / 富文本 Yjs 里继续加强。

---

### 二、核心机制：每人一份可写副本 + 交换增量 + 自动合并

用人话分步：

1. **本地都能写**  
   你的每一次编辑，先变成对本地 Automerge 文档的变更（不是先抢服务器锁）。

2. **变更变成可同步的增量**  
   通过 \`SupabaseNetworkAdapter\` 把同步消息经 Realtime 广播给同房间其他人（二进制增量，不是每次整份 JSON 覆盖上传）。

3. **对方 apply 增量**  
   对方 repo 应用这些变更；Automerge 按 CRDT 规则与本地已有历史合并。

4. **收敛**  
   网络恢复、消息到齐后，各端文档收敛到同一状态——这就是「不冲突」的数学底气：  
   **不是靠人协调，是靠数据结构保证可合并。**

5. **离线同理**  
   断网时增量先落本地 IndexedDB；联网再交换、再合并。

---

### 三、和「后写覆盖」差在哪（举例）

- **坏做法**：A、B 都下载整份简历 JSON；A 改姓名保存；B 改邮箱保存 → B 的整份把 A 的姓名盖掉。  
- **Automerge 做法**：A 的变更是「姓名这条历史」，B 的是「邮箱这条历史」；合并后两条都在。  

若两人改的是**同一原子字段的同一段**，早期若整段字符串写入，仍可能出现后写感——所以后来才有：

- 普通输入框：尽量字段级写入 + 文本字符合并  
- 富文本 HTML：不能直接对 HTML 字符串做字符 CRDT（会撕标签），改由 Yjs 管编辑态，再镜像 HTML  

答 5.3 时：**先讲 CRDT 收敛，再主动提「粒度不够时仍有体验冲突，我们后续在加细」。** 这比吹「绝对永不打架」更可信。

---

### 四、工程上还做了哪些「减少人为冲突」的辅助

| 手段 | 作用 |
|------|------|
| 开启协作先存云端最新快照 | 避免后加入者从旧版本分叉太大 |
| 文档同步与 UI/光标通道分离 | 界面跟随不会污染文档合并 |
| 表单字段级 diff 写入（后续强化） | 避免「我改 name 却把你的 email 旧值写回去」 |
| pending 消息缓冲 | 文档句柄未就绪时先攒同步包，减少竞态丢更新 |

---

### 五、口述收束

「不冲突不是靠加锁，而是每人本地可写，变更以增量同步，Automerge 按 CRDT 自动合并并最终一致；IndexedDB 支持离线后再合。业务上再靠字段级写入、通道拆分降低『误覆盖』。富文本同段并发要结构化 CRDT 才能真正字符级不打架，这是后续增强。」`,
    tags: ["GResume","实时协作"],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-rb-010',
    module: 'projects',
    chapterId: 'gresume',
    category: '改进思考',
    question: "追问：觉得现在哪些地方还可以改进？",
    answer: `结合真实踩坑和后续设计文档，改进点可以按「体验 / 正确性 / 架构 / 产品」说，显得你真做过，而不是空喊优化。

---

### 1. 富文本同段并发（最高优先级体感）

**现状问题**：仅靠 HTML 字符串进 Automerge 时，同字段并发接近整段后写覆盖；也对不上 Google Docs 那种字缝里的远端光标。  

**改进方向**（仓库里已有设计与部分实现）：协作期内用 **Yjs + TipTap Collaboration** 做字符级合并和编辑器内光标；HTML 继续镜像回 Automerge 供预览/PDF。  

面试表述：v0.2 解决「能共编」；下一步解决「共编富文本也舒服」。

---

### 2. 写路径粒度曾经过粗（正确性）

**问题**：若每次击键把整个 section 写回，A 改姓名时可能用自己过期的邮箱盖掉 B——表现为「改不同字段也互相抢」。  

**改进**：字段级 diff，只写变更叶子；自由文本走字符合并；写/读时注意光标保持。  

说明你理解：**CRDT 不能包治「写入粒度太粗」的业务 bug。**

---

### 3. 变更提醒仍偏「会话/UI」，缺少「内容级摘要」

**现状**：进出房、跟随模式下的抽屉/主题等有 toast；正文变更主要靠界面默默变。  

**可改进**：

- 可选的「对方正在编辑某某模块」弱提示（不必每字一条）  
- 操作时间线 / 迷你 changelog（谁改了哪一节）  
- 提醒分级：重要（有人加入、协作结束）vs 静默（滚动跟随）

---

### 4. 跟随模式与干扰控制

跟随很好用，也可能烦（对方乱切 Tab、乱滚）。  

**可改进**：按动作类型开关（只跟滚动 / 只跟模块）；或「仅跟随指定某人」；默认策略可再产品化。

---

### 5. 远程光标体验分层不统一

v0.2 是 **整页鼠标**；富文本内插入光标是另一套。  

**可改进**：两套光标的颜色/昵称/去重（重连幽灵光标）统一身份模型；弱网下降级策略（只显示在线列表，不画光标）。

---

### 6. 数组项身份与复杂结构合并

经历列表若中间删插，仅按索引对齐时，项的 CRDT 身份可能不稳。  

**可改进**：稳定 item id；明确 move/reorder 的协作语义（现在 UI 侧也未必完整暴露）。

---

### 7. 离线协作边界

纯离线简历不能开协作；富文本 Yjs 层也不做离线共编。  

**可改进**：更清晰的产品文案（为何灰掉）；或「先同步上云再邀请」的引导向导；弱网重连 UX（重连中、冲突已自动合并的提示）。

---

### 8. 权限与安全

当前偏「有链接就能改」的低门槛。  

**可改进**：只读协作 / 评论模式；链接过期；踢人；操作审计——更接近真实求职场景（给 HR 看 vs 给学姐改）。

---

### 9. 可观测性与质量

**可改进**：协作会话质量指标（同步延迟、重连次数、合并失败）；关键路径的自动化测试（双端同改姓名/同改富文本）；问题复现工具。

---

### 10. 面试怎么组织回答（别摊成抱怨）

推荐结构：

1. **先肯定**：v0.2 把「可分享、可离线合并的共编」底座立住了  
2. **再谈短板**：富文本粒度、写入粒度、提醒信息架构、权限  
3. **落到已做/在做**：字段级同步、Yjs 层、光标去重等  
4. **收束**：改进顺序是「正确性 → 富文本体验 → 产品权限与提醒」  

---

### 四问连背（30 秒版）

- **5.1**：提醒 = presence + 会话控制消息 +（跟随下）UI 动作 toast；正文靠同步不是靠弹窗。  
- **5.2**：要离线、要结构化文档、要贴合 Supabase → CRDT；Automerge 贴 JSON 简历；Yjs 更适合富文本所以后期叠加。  
- **5.3**：本地可写 + 增量同步 + CRDT 收敛；粒度要细才「体感不打架」。  
- **5.4**：富文本字符级、字段级写入、提醒与权限、数组身份、弱网 UX——按正确性到体验排序推进。`,
    tags: ["GResume","改进思考"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-011',
    module: 'projects',
    chapterId: 'gresume',
    category: '导出与账号',
    question: "PDF 导出与账号系统的实现",
    answer: `### 一、版本定位（v0.3，2025-11-04）

changelog 主打：**高保真 PDF 导出 + A4 智能分页 + 编辑器内外观工具栏**。  
账号体系同阶段落地（changelog 正文偏重导出，Auth 细节以代码/README 为准）：用 Supabase 邮箱密码登录，支撑云端同步、协作、AI 等需要身份的能力。

---

### 二、PDF 导出怎么实现

#### 1. 产品思路

不做「另写一套导出排版引擎」，而是：**导出尽量等于你看到的预览**。  
右侧预览已经按模板+外观画成 A4 纸；导出时让浏览器把这份 DOM 打成 PDF。

#### 2. 关键三块

| 块 | 干什么 |
|----|--------|
| **PagedResumeShell（分页壳）** | 按 A4 高度（约 297mm）估算要几页；首页还要扣掉页边距；用「同一份内容 + 不同裁剪窗口」做出第 1、2、3…页，接近真实打印纸 |
| **react-to-print** | 拿到预览区的 DOM 引用，调用浏览器原生打印；\`@page { size: A4; margin: 0 }\` 控纸张 |
| **导出 store / 导出对话框** | UI 点「导出」→ 调已注册的 print handler；另支持 Word（读简历内容 HTML 再生成 doc） |

#### 3. 用户操作链路（口述）

\`\`\`
点导出 → 选 PDF
  → 使用当前预览里的 resumeRef（已包在分页壳里）
  → react-to-print 打开系统打印框
  → 用户选「存储为 PDF」
\`\`\`

#### 4. 和「隐藏 iframe 打印」的关系

早期 changelog 提过隐藏 iframe 方案，后来舍弃。  
当前主路径是：**直接对编辑器预览 DOM 打印**。  
更晚的 changelog/计划里提过「移动端独立打印窗口」（新窗口用快照重渲染再打），属于后续演进；面试以「分页壳 + react-to-print」为主，移动端可作补充优化点。

#### 5. 账号与导出的关系

**导出本身不强制登录**：只要本地/当前简历预览画出来了，就能打 PDF。  
登录解决的是：多设备同步、云端历史、协作、ATS/划词等 AI。

---

### 三、账号系统怎么实现

#### 1. 技术选型

**Supabase Auth**（邮箱 + 密码）：

- 注册 / 登录 / 登出 / 忘记密码重置邮件  
- 用户挂在 \`auth.users\`；业务表（如 \`resume_config\`）用 \`user_id\` 关联  

页面：\`/login\`、\`/sign-up\`、\`/forgot-password\`。

#### 2. 权限模型（重要）

项目是 **离线优先**，不是「没登录进不了门」：

| 能力 | 是否要登录 |
|------|------------|
| 本地写简历、IndexedDB、预览、PDF/Word | 一般不需要 |
| 云端同步、版本历史、Tracker、协作 | 需要 |
| ATS / 划词 AI / JD 派生等 LLM | 需要（前端带 JWT 调 Edge Function） |

实现上：**很少做全局路由守卫**，更多是各云端/AI API 里 \`getSession\` / \`getCurrentUser\`，未登录就报错提示去登录。

#### 3. 登录后多了什么

- 简历可同步到 \`resume_config\`  
- 可开协作、看历史版本  
- AI 请求走 \`llm-proxy\` 时带上用户 token，密钥留在服务端  

---

### 四、复习口述（Q6）

「v0.3 补上投递关键一环：预览用自研 A4 分页壳，导出用 react-to-print 打成 PDF，尽量所见即所得；Word 另走 HTML。账号用 Supabase 邮箱登录，离线仍可编辑，登录后解锁云同步、协作和 AI；鉴权主要在 API 层而不是整站锁死。」`,
    tags: ["GResume","导出与账号"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-012',
    module: 'projects',
    chapterId: 'gresume',
    category: 'ATS引擎',
    question: "ATS 优化引擎是怎么设计的",
    answer: `### 一、要解决什么

超过很多简历在人看到之前就被 ATS（申请人追踪系统）筛掉。  
产品目标：投递前先帮你跑一遍「机器视角」的检查——**打分 + 指出问题 + 给出可执行的修改建议**，而不只是一句「分数低」。

对应版本：v0.5 上评分与报告；v0.6 把 LLM 自动修复与对比应用做扎实。

---

### 二、整体设计：扫描与应用分离

\`\`\`
整份简历 JSON
  →（一次）LLM 结构化分析
  → 得到：五维分数 + findings（问题）+ suggestions（怎么改）
  → 存进 ATS 报告
  → 用户在 Optimize 页审阅
  → 确认后按字段路径写回简历（此时一般不再调 LLM）
\`\`\`

**设计要点**：模型负责「诊断与开药方」；工程负责「按药方改数据、可撤销地展示对比」。

---

### 三、输出长什么样（数据结构心智）

报告大致包含：

1. **五维得分**（每维有 score / max）  
   - 职位匹配、ATS 解析度、格式可读性、内容完整度、影响力量化  
2. **总评**：总分、等级、主要风险、下一步建议  
3. **findings**：按 high / medium / low 分桶  
   - 每条：标题、定位（path + 人类可读位置）、为什么有问题、怎么修  
4. **suggestions**：可执行补丁  
   - 类型如：替换文本、替换值、填空字段、规范化日期  
   - 带 \`before\` / \`after\` / \`locate.path\` / \`reason\` / 是否已 \`fixed\`

前端用 Zod/schema 约束这些形状，方便流式解析和 UI 渲染。

---

### 四、运行链路

1. 用户在 Optimize 页选简历，点分析（离线简历可能先上传云端）  
2. 拉齐简历数据，塞进优化 Prompt（禁止模型瞎编事实）  
3. 经 **Supabase Edge \`llm-proxy\`** 调 DeepSeek（密钥在服务端；前端带登录 JWT）  
4. **流式**拿 reasoning + 最终 JSON；过程对话框展示阶段（上传/请求/思考/保存等）  
5. 解析校验后写入 \`ats\` 相关表；页面刷新当前报告  
6. Dashboard：雷达图、分数、修复进度等可视化  

默认模型以代码为准（如 \`deepseek-v4-pro\`）；README 可能写 Reasoner——面试以运行配置为准并一句带过即可。

---

### 五、修复怎么落地（Issue-fix）

- 列表点开某条问题 → 看位置、原因、修改前后对比  
- 可微调后再「确认」  
- 应用时：按 \`locate.path\` 写回 Automerge / \`resume_config\`（在线）或离线存储；标记 suggestion 已 fixed；可撒花庆祝  

**高级工具箱**（同页）：

| 工具 | 作用 |
|------|------|
| JD 匹配 | 另一次结构化 LLM：简历 vs 岗位描述 |
| 一键格式化 | 批量应用无冲突的 suggestions |
| ATS 预览 | **本地**抽成纯文本视角（不调 LLM） |
| 行业基准 | **本地**对比经历数、量化比例等 |

---

### 六、设计原则（面试加分）

1. **结构化输出优先于散文**：才能定位到字段并一键改  
2. **扫描与写入解耦**：写入可审计、可对比、可批量  
3. **密钥不出前端**：Edge Function 代理  
4. **在线/离线都要能分析**：数据源抽象，落库路径分支`,
    tags: ["GResume","ATS引擎"],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-rb-013',
    module: 'projects',
    chapterId: 'gresume',
    category: '版本管理',
    question: "版本历史系统怎么设计的？数据结构如何？",
    answer: `### 一、产品目标（v0.6）

怕改崩、想回溯：提供时间线浏览、预览对比、**非破坏性恢复**。  
入口有两个：

- 编辑器工具栏「历史版本」下拉（快捷）  
- \`/history\` 完整工作台（时间线、元数据、保存当前版、删除等）  

**限制**：主要面向**云端简历**；纯离线 ID 往往不可用或降级。

---

### 二、核心表：\`resume_config_versions\`

可以理解为「每次值得记住的整包快照 + 元数据」。

| 字段 | 含义 |
|------|------|
| \`id\` | 主键 |
| \`resume_id\` | 属于哪份简历 |
| \`user_id\` | 谁的 |
| \`version_no\` | 同简历内递增版本号（插入前由触发器赋值） |
| \`version_name\` / \`description\` / \`milestone_name\` | 给人看的标题说明 |
| \`source_type\` | 来源：\`manual\` / \`autosave\` / \`restore\` / \`ai_optimize\` / \`import\` 等 |
| \`tags\` | 标签数组 |
| **\`snapshot\`** | **整份简历 jsonb 快照（核心）** |
| \`content_hash\` | 内容哈希，便于去重/比对 |
| \`base_updated_at\` | 打快照时主表更新时间 |

唯一约束：同一 \`resume_id\` 下 \`version_no\` 唯一。

---

### 三、\`snapshot\` 里有什么（数据结构）

对应前端的「可持久化简历快照」概念，大致 =：

\`\`\`
简历内容（12 个模块的结构化数据）
+ 模块顺序 order
+ 显隐 visibility
+ 模板类型 / templateBinding
+ 外观 spacing / font / theme
\`\`\`

也就是：**当时那一刻，内容 + 排版配置打包**，恢复时能回到「看起来一样」的状态，而不只是几段文本。

创建时会对内容做规范化（兼容旧字段名），并算 \`content_hash\`。

---

### 四、版本何时产生

| 场景 | source_type（典型） |
|------|---------------------|
| 用户在历史页「保存当前版本」 | \`manual\` |
| 恢复前自动备份当前内容 | \`autosave\` |
| 执行一次恢复操作后再记一笔 | \`restore\` |
| Schema 预留 AI 优化/导入 | \`ai_optimize\` / \`import\` |

注意：不是每次击键都自动存版本；\`autosave\` 在实现里更常用于**恢复前备份**，不是编辑器自动定时存档。

---

### 五、非破坏性恢复怎么做

1. 若选「恢复并保留当前」：先把**现在的内容**存成一条备份版本  
2. 把目标版本的 \`snapshot\` 写回当前简历（含 Automerge/云端主数据）  
3. 再插入一条 \`restore\` 来源的版本记录，留下审计痕迹  

这样时间线不会「恢复后历史断档」，当前稿也不会无声消失。

---

### 六、口述收束

「版本历史 = 云端版本表里存整包 snapshot。手动保存产生版本；恢复可先备份当前再覆盖，并记 restore 记录。工具栏是快捷入口，历史页是完整管理台。数据结构上 snapshot 覆盖内容、顺序、模板绑定和外观。」`,
    tags: ["GResume","版本管理"],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'gresume-rb-014',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI能力',
    question: "AI 如何给你修改简历？",
    answer: `这里说的「AI 改简历」主要指 **Optimize 里的 ATS 自动修复链路**（整份诊断后按建议改），不是编辑器里的划词（划词见 Q12）。

### 一步步发生了什么

1. **你发起分析**  
   系统把当前简历整理成 JSON，交给优化 Prompt。

2. **模型返回结构化「病历 + 处方」**  
   不是直接偷偷改库，而是返回：哪里有问题、为什么、建议改成什么（before/after）、改哪个字段路径。

3. **你在 UI 里审阅**  
   看严重级别、对比文案，必要时自己再改一版建议内容。

4. **你点确认，工程执行写入**  
   按路径把 \`after\` 写进简历数据（在线走文档同步，离线走运本地）。  
   **这一步通常不再调用 LLM**——模型的活在分析阶段已经干完。

5. **标记已修复 + 反馈**  
   对应 suggestion 标 fixed，进度更新，可撒花。

### 设计用意

- **人在回路**：AI 提议，人确认，避免瞎改姓名/时间等事实  
- **可解释**：每条有 reason 与对比  
- **可批量**：无冲突建议可走「一键格式化」  

### 和 JD 派生的区别（一句）

ATS 修复：在**同一份简历上打补丁**。  
JD 派生：为岗位**复制出一份新简历再改写**（见 Q13）。`,
    tags: ["GResume","AI能力"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-015',
    module: 'projects',
    chapterId: 'gresume',
    category: '求职管理',
    question: "求职跟踪看板：产品逻辑与技术落地",
    answer: `### 一、产品逻辑（v0.8）

写完简历只是开始：投了谁、面到哪轮、哪个 offer 怎么选——以前靠 Excel。  
Tracker 要把投递流水线做成**可视化管道**：

- **看板**：按状态分列，拖一张卡片就更新进度  
- **列表**：海投时更好筛选、搜索、批量看  
- **职位详情抽屉**：公司、岗位、薪资、链接、各阶段时间线、面试轮次、备注  

changelog 宣传常简化成「待投递→已投递→面试→Offer」；**代码里列更细**：

| 状态 | 含义（实现） |
|------|----------------|
| 已保存 | 先收藏/待投 |
| 已投递 | 已提交 |
| 筛选中 | 简历筛选/笔试等 |
| 面试中 | 进行中的面试 |
| 已录用 | Offer |
| 终止/拒绝 | 归档用，不一定占看板列 |

面试时主动说「宣传简化、实现多了筛选中等粒度」更加分。

**JD 智能匹配**：同期卖点，但实现重心在 **Optimize 高级工具**（贴 JD 做匹配分析），Tracker 里更多是存 \`job_url\` 等字段；匹配结果可再引导去「按此 JD 派生简历」。

---

### 二、技术落地

| 点 | 做法 |
|----|------|
| 数据 | Supabase 表（历史名 \`company\`，实际存投递记录） |
| 状态 | 页面级 Zustand：列表、视图模式、筛选关键词、抽屉开关等 |
| 看板拖拽 | \`@hello-pangea/dnd\`：拖到另一列 → 更新 status 并持久化 |
| 抽屉表单 | 新增/编辑职位；面试子阶段（一面/二面/HR 等）可维护 |
| 列表 | 表格/卡片 + 状态筛选 + 公司/岗位/城市搜索 |

页面入口 mount 时拉当前用户的投递列表。需登录（云端数据）。

---

### 三、口述

「Tracker 管投递生命周期：看板拖拽改状态，列表方便海投检索，抽屉沉淀阶段与面试细节。技术上是 Supabase 存记录 + 页面 store + hello-pangea 拖拽。JD 深度分析放在优化工具链，和看板分工。」`,
    tags: ["GResume","求职管理"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-016',
    module: 'projects',
    chapterId: 'gresume',
    category: '模板系统',
    question: "v1.0 核心功能——模板系统",
    answer: `### 一、为什么算 v1.0 里程碑（2026-04-12）

此前已有编辑、协作、导出、ATS、Tracker；缺的是「换皮」产品化。  
v1.0：**模板工作台 + 可视化编辑 + 一键绑定**，内容与外观正式解耦。

---

### 二、产品能力

1. **模板中心三区**：官方 / 社区 / 我的  
2. **官方 6 套**：基础、简约、现代（左栏）、商务侧栏（右栏）、ATS 紧凑、分段展示——覆盖不同疏密与栏式  
3. **一键绑定**：这份简历用哪套模板，换模板不改文字内容  
4. **可视化模板编辑器**：改布局骨架、模块分区与顺序、疏密、色票等，可另存为个人模板  

---

### 三、技术设计：三件套解耦

\`\`\`
简历内容 JSON（写什么）
  × 模板 Manifest（怎么排、用哪个渲染器、在主栏还是侧栏）
  × 外观配置（字体间距主题，用户工具栏也可调）
  → ResumeTemplateRuntime 组合渲染
\`\`\`

**Manifest**（用 schema 约束）大致包括：

- 元信息  
- layout：骨架类型（单栏 / 左栏 / 右栏 / 分段）、密度、页边距相关  
- sections：每个模块用哪个 renderer、在哪个 region、order、是否可见  
- tokens / rules：预设色与间距等  

简历上只存 **\`templateBinding\`**（官方 id 或用户模板 id），运行时再解析出完整 manifest；官方有内置 registry，用户模板在云端表。

**Runtime**：解析 manifest → 选布局骨架 → 按简历 \`order\` 排模块 → 调各 section 渲染器 → 注入数据与样式上下文。  
预览、缩略图、导出尽量共用，保证换模板后仍「预览≈导出」。

---

### 四、口述

「v1.0 把模板做成一等公民：内容、模板说明书、外观配置分开存，运行时组装。官方六套覆盖场景，工作台可浏览绑定，编辑器可改布局另存。绑定存在简历上，换皮不改内容。」`,
    tags: ["GResume","模板系统"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-017',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI能力',
    question: "划词 AI 改写 vs AI 修改简历：异同",
    answer: `### 一、先对齐两个功能

| | **AI 修改简历（ATS Issue-fix）** | **划词 AI 改写（ai-rewrite）** |
|--|-----------------------------------|-------------------------------|
| 场景 | Optimize：先体检再修 | 编辑器：写到某段时就地润色 |
| 范围 | 整份简历多个问题/字段 | 当前选中的一小段富文本 |
| 典型意图 | 补全、改格式、抬匹配、修风险点 | STAR 化、量化、强动词、润色、贴 JD |

---

### 二、相同点

1. **都走同一产品 LLM 网关**：登录 JWT → \`llm-proxy\` → DeepSeek  
2. **都要人确认再落稿**（不静默改）  
3. **都强调可解释**：修复有 reason/对比；改写有候选 notes/标题  
4. **HTML 展示侧会做安全清理**（预览用净化解析），降低脏标签风险  
5. **都服务「更好投递」**：一个偏机器可读与完整度，一个偏单段表达质量  

---

### 三、不同点（重点）

| 维度 | ATS 修复 | 划词改写 |
|------|----------|----------|
| **LLM 何时调用** | 分析时一次（或 JD 工具另一次）；**应用建议时不再调** | **每次选动作都调**，要 2–3 个候选 |
| **输出** | findings + 带 path 的 suggestions | 选区候选 HTML 列表 |
| **写回** | 按简历字段路径写 JSON/Automerge | TipTap \`insertContentAt\` 只换选区 |
| **UI** | 问题列表 + 大修复面板/对比 | Bubble 菜单 + 候选卡片 |
| **上下文** | 整份简历 JSON | 选区文本 + 字段上下文（模块名、可选 JD） |
| **状态复杂度** | 报告持久化、fixed 标记、批量冲突检测 | 会话状态机：idle/等 JD/流式/成功失败，可 Abort |

---

### 四、实现同构怎么记

\`\`\`
共同骨架：鉴权 → Edge 代理 → Prompt → 结构化 JSON → UI 审阅 → 写回

分叉点：
  ATS：写回 = 数据层补丁（path）
  划词：写回 = 编辑器选区替换（from/to）
\`\`\`

---

### 五、口述

「一个是体检开药方再按路径贴药膏；一个是写作时划词要几个版本当场换上。模型入口一样，交互、调用时机和写回点不同。」`,
    tags: ["GResume","AI能力"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-018',
    module: 'projects',
    chapterId: 'gresume',
    category: 'JD派生',
    question: "细讲 v1.2：JD 驱动的派生简历",
    answer: `### 一、要解决什么（2026-06-06）

现实：一份底稿要投很多岗位，手工复制再改容易乱、也容易改坏事实。  
v1.2：**保留原简历，按 JD 生成一份可继续编辑的独立版本**，并留下匹配度、改了啥、血缘关系。

---

### 二、产品流程（用户视角）

1. 在「我的简历」或 JD 工具发起派生，粘贴目标 JD  
2. 看解析出的关键词/摘要（阶段一）  
3. 系统复制出草稿，再对**允许改的文案字段**做针对性改写（阶段二）  
4. 结果页核对：改前改后、理由、命中词、匹配度  
5. 确认后成为正式派生简历；列表可筛「原始/派生」，可看血缘树  
6. 关掉生成窗也不一定中断——**后台任务**可续看、取消、重试、丢弃失败草稿  

---

### 三、两阶段 + 事实保护（设计核心）

**阶段 A：解析 JD（LLM）** → 关键词、岗位摘要  
**阶段 B：克隆（无 LLM）** → 深拷贝源简历为新草稿（在线 \`resume_config\` / 离线 IndexedDB）  
**阶段 C：改写（LLM 流式）** → 只动白名单字段（摘要、意向、技能描述、经历描述等）  
**阶段 D：校验落库** → 解析变更列表、算匹配度、标记 \`ready\` / \`failed\`

**事实字段保护**：姓名、学校、时间区间、证书事实、模板与外观等**不在白名单**，克隆时原样保留；Prompt 也限制可写范围——「宁可少改，也不编造履历」。

---

### 四、关键数据字段（挂在简历上）

| 字段 | 作用 |
|------|------|
| \`parent_resume_id\` | 父简历（血缘） |
| \`linked_jd_text\` | 当时那份 JD |
| \`derived_metadata\` | 关键词、changes、matchRate、生成时间等 |
| \`derived_status\` | \`generating\` / \`ready\` / \`failed\` |

血缘树可多层查看，有深度上限（如 5），防止无限套娃。

---

### 五、技术落地要点

- 全局任务 store：按父简历维度管进度与 AbortController  
- UI：\`jd-variant\` 组件（步骤条、任务面板、血缘树、结果对比）  
- 在线/离线双路径 API 对称  
- 与 Optimize JD 工具衔接：匹配完可「基于此 JD 派生」  

---

### 六、口述

「v1.2 让一份底稿对应多岗位：先析 JD，再克隆，再白名单改写，人核对后落成独立简历；原件不动。后台任务和血缘树保证过程可管、关系可追。核心原则是事实字段保护。」`,
    tags: ["GResume","JD派生"],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'gresume-rb-019',
    module: 'projects',
    chapterId: 'gresume',
    category: 'AI工程化',
    question: "开发者如何用 AI 辅助开发本项目",
    answer: `### 一、先分清两条「AI」——面试最容易混

| | **产品 AI（给用户）** | **研发 AI（给开发者/Agent）** |
|--|----------------------|-------------------------------|
| 干什么 | ATS、划词、JD 匹配、派生… | 写设计、拆计划、实现、Review、调试 |
| 跑在哪 | 浏览器 → \`llm-proxy\` → DeepSeek | Cursor / Claude 等 Agent + 仓库技能 |
| 产物 | 线上功能 | \`docs/superpowers/specs\` 与 \`plans\`、代码变更 |

下面只讲 **研发侧如何用 AI 把项目做出来**。

---

### 二、仓库里的强制工作流（AGENTS.md）

较大需求（规划/设计/重构/新功能）默认走：

1. **brainstorming**：先比选方案，对齐取舍，再动手  
2. 规格批准后 **writing-plans**：写成可执行步骤（顺序、依赖、验证、停止条件）  
3. Spec 固定落盘：\`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md\`  
4. Plan 固定落盘：\`docs/superpowers/plans/YYYY-MM-DD-<feature>.md\`  
5. 再按 **executing-plans** / 子代理拆分执行，并强调 **verification-before-completion**（没证据不轻言完成）  

也就是：**AI 不是直接对着需求瞎写代码**，而是嵌进「设计 → 计划 → 实现 → 验证」纪律里。

---

### 三、技能与工具箱（开发者侧）

仓库 \`.agents/superpowers/\`（及用户全局 skills）提供例如：

- 头脑风暴 / 写计划 / 执行计划  
- 系统化调试、TDD、完成前验证  
- 中文 Code Review 话术、中文 commit 约定  
- 并行子任务、worktree 隔离等  

另有 OpenSpec 相关技能/提示，用于需求变更与 apply 流程管理。

这些技能让 Agent **按同一套工程文化**工作，而不是每次会话从零发明流程。

---

### 四、证据：大量带日期的 Spec/Plan

从 Tracker、模板、划词、JD 派生到协作/Yjs，仓库里有大量按日命名的设计与计划文档——说明主要功能普遍经历「先写清再实现」。  
例如模板 redesign、JD variant、ai-rewrite 安全 HTML、协作字段级同步等，都能在 \`docs/superpowers/\` 找到对应日期戳。

---

### 五、开发者日常怎么「用 AI」

可按阶段说：

1. **想清楚**：用 brainstorm 逼出选项与非目标，避免一上来写歪  
2. **写规格**：数据结构、边界、非目标、验收标准落 md  
3. **拆计划**：任务级 checklist，便于会话中断后续接  
4. **实现**：Agent 按计划改代码；人审关键设计决策  
5. **验证**：按计划跑构建/用例/手工路径；用调试技能缩圈  
6. **Review**：中文审查清单查正确性、安全、回归  

产品 LLM（\`llm-proxy\`）开发时也会被 Agent/人用来联调 Prompt与结构化输出，但那是**功能开发的一部分**；与「用 Agent 写 Spec」仍是不同层。

---

### 六、诚实边界（加分）

- **不能说**「整个项目全自动生成、无人设计」  
- **应该说**「人定产品与约束，AI 加速规格化、实现与检查；关键合并仍靠人」  
- Changelog 与代码偶有文案差异时，以代码为准——这本身也是 AI 辅助开发要靠验证技能兜住的点  

---

### 七、口述收束

「我们把 AI 用在研发流程：Superpowers 要求先 brainstorm 再写 spec/plan，再执行与验证；产物留在 docs/superpowers。同时产品侧另有 llm-proxy 服务用户。开发 AI 提速的是规范化交付，不是替代产品判断。」`,
    tags: ["GResume","AI工程化"],
    status: 'unvisited',
    difficulty: 'medium',
  }
];

export const gresumeChapter: Chapter = {
  id: 'gresume',
  module: 'projects',
  title: 'GResume 智能简历平台',
  description: 'CRDT文档冲突、IndexedDB离线、AI集成ATS评分、协同编辑',
  cardCount: gresumeCards.length,
  icon: '📝',
};
