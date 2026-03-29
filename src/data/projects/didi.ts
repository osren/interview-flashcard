import { FlashCard, Chapter } from '@/types';

export const didiCards: FlashCard[] = [
  {
    id: 'didi-refactor-001',
    module: 'projects',
    chapterId: 'didi',
    category: '遗留系统重构',
    question: '描述一下你在滴滴"遗留系统拆解与重构"中的最难案例',
    answer: `STAR 法则回答：

S (情境)：
原系统使用 jQuery + 硬编码表单配置，维护困难，每次加字段都要改代码

T (任务)：
将硬编码转为配置驱动，提升研发效率

A (行动)：
1. 设计配置 Schema（字段定义、校验规则、依赖关系）
2. 开发配置编辑器可视化工具
3. 编写 Schema 校验（zod/ajv）
4. 灰度上线，逐步迁移旧配置

R (结果)：
• 表单开发时间从 3天 → 0.5天
• 代码量减少 60%
• 0 线上事故`,
    tags: ['滴滴', '重构', '配置驱动'],
    status: 'unvisited',
    difficulty: 'hard',
    extendQuestion: '配置 Schema 如何设计能够兼顾扩展性和可维护性？',
  },
  {
    id: 'didi-config-001',
    module: 'projects',
    chapterId: 'didi',
    category: '配置驱动',
    question: '硬编码转配置驱动，配置 Schema 如何设计？',
    answer: `Schema 设计要点：

interface ComponentConfig {
  type: 'input' | 'select' | 'date';
  name: string;
  label: string;
  rules?: ValidationRule[];
  visible?: Condition;
  default?: any;
}

关键设计原则：
1. 声明式而非命令式
2. 支持嵌套和组合
3. 有明确的类型定义（TypeScript）
4. 支持校验规则内联`,
    tags: ['滴滴', '配置驱动', 'Schema'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-ssd-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'SSD规范',
    question: '什么是 SSD 规范驱动模式？用通俗语言解释',
    answer: `通俗解释：

SSD = "规范说明书"驱动 AI 写代码

类比：
传统：告诉装修师傅"我要简约风格" → 装修师傅自己理解 → 结果可能不符合预期
SSD：给装修师傅一份详细的"装修规范书" → 师傅按规范执行 → 结果可控

核心：
• 规范文档 = 需求 + 验收标准
• AI 读懂规范后生成代码
• 代码必须符合规范
• 有人工审核环节`,
    tags: ['滴滴', 'SSD', 'AI工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-openspec-001',
    module: 'projects',
    chapterId: 'didi',
    category: 'OpenSpec',
    question: 'OpenSpec 在项目中解决了什么问题？',
    answer: `解决的问题：

1. AI 输出格式不统一
   → 定义标准 JSON Schema 约束输出

2. 难以校验生成质量
   → Schema 校验 + metadata 置信度

3. AI 与 IDE 集成困难
   → 定义通信协议

4. 难以追踪规范与代码对应
   → 规范版本化，可单独管理`,
    tags: ['滴滴', 'OpenSpec', 'AI工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-001',
    module: 'projects',
    chapterId: 'didi',
    category: '性能优化',
    question: '弱网场景的路由分割和预加载具体是怎么实施的？',
    answer: `路由分割：
React.lazy + Suspense 按需加载
const Home = lazy(() => import('./pages/Home'));

预加载策略：
1. 空闲预加载：requestIdleCallback
2. 鼠标悬停预加载：onMouseEnter
3. IntersectionObserver：内容进入视口前预加载

关键指标：
• FCP 从 3.2s → 1.8s
• 首屏 JS 减少 45%
• 弱网环境下白屏时间减少 50%`,
    tags: ['滴滴', '性能优化', '路由分割', '预加载'],
    status: 'unvisited',
    difficulty: 'hard',
    extendQuestion: '预加载的触发时机是什么？如何避免预加载影响当前页面加载？',
  },
];

export const didiChapter: Chapter = {
  id: 'didi',
  module: 'projects',
  title: '滴滴企业版 - 商旅体验',
  description: '遗留系统重构、AI工程化转型、弱网性能优化',
  cardCount: didiCards.length,
  icon: '🚗',
};
