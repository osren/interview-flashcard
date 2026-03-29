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
];

export const gresumeChapter: Chapter = {
  id: 'gresume',
  module: 'projects',
  title: 'GResume 智能简历平台',
  description: 'CRDT文档冲突、IndexedDB离线、AI集成ATS评分',
  cardCount: gresumeCards.length,
  icon: '📝',
};
