import { FlashCard, Chapter } from '@/types';

/**
 * 滴滴实习项目简历备战指南
 * 基于实习经历和代码文档整理的完整面试准备材料
 */

export const didiInterviewGuideCards: FlashCard[] = [
  // ===== 项目背景与定位 =====
  {
    id: 'didi-guide-bg-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '项目背景',
    question: '简要介绍滴滴实习的时间线、业务上下文和技术栈',
    answer: `**实习时间线**：
滴滴出行 · 企业版商旅 | 前端开发实习生 | 2026.01 — 2026.07（7个月）

**业务上下文**：
- **业务线**：商旅（机票/酒店/火车票 H5 + 小程序）
- **用户规模**：企业用户预订场景
- **技术栈**：MPX（类 Vue 小程序框架）+ H5 双端
- **团队定位**：C 端业务前端，关注预订链路体验与稳定性

**两个核心项目**：
1. **性能监控与体验优化**：搭建函数级性能基础设施，LCP↓17%、卡顿↓27%
2. **AI 智能监控降噪**：LLM 驱动的告警判定系统，降噪引擎 + 火车票 Domain 配置

**共性**：都是「从问题定位到工程化沉淀」的完整闭环，体现前端基础设施建设能力。`,
    tags: ['滴滴', '项目背景', '面试准备'],
    status: 'unvisited',
    difficulty: 'easy',
  },

  // ===== 项目一：性能监控核心要点 =====
  {
    id: 'didi-guide-perf-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '性能监控',
    question: '项目一：性能监控与体验优化的一句话概括和核心数据',
    answer: `**一句话概括**：
在商旅 H5/小程序搭建函数级性能监控体系，定位并优化列表页 LCP 和星河底部菜单卡顿，沉淀为可复用 Agent Skill。

**核心数据**：
- 列表页 LCP：**1400ms → 1160ms（↓17%）**
- 星河底部菜单卡顿：改善约 **27%**

**技术亮点**：
1. **双端适配**：H5 和星河小程序通过 Adapter 模式统一上报
2. **缓存命中直渲状态机**：避免无效网络请求
3. **关键路径剥离**：将 privacyPopList 等非关键接口移出 LCP 统计

**工程化沉淀**：
- 将「定位 → 诊断 → 优化 → 验收」闭环固化为 \`page-performance-analysis\` Skill
- 为后续性能问题提供函数级监控基础设施`,
    tags: ['滴滴', '性能监控', '面试要点'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  {
    id: 'didi-guide-perf-002',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '性能监控',
    question: '面试高频：列表页 LCP 优化的具体步骤是什么？',
    answer: `**问题定位**：
1. 接入 \`getHomeData\` 接口耗时埋点
2. 发现 \`privacyPopList\` 等非关键接口串在首屏关键路径
3. 切日期场景会重复请求，缓存命中时仍触发网络请求

**优化动作**：
- **剥离非关键路径**：把隐私弹窗接口移出 LCP 统计链路，defer 延后加载
- **缓存命中直渲**：增加状态机 \`cacheHit → skipFetch → directRender\`，避免白等
- **修正口径**：切日期重渲时，区分「接口返回」和「缓存命中」两条路径分别上报

**结果**：LCP **1400ms → 1160ms（↓17%）**

**技术细节（面试追问）**：
- Q: 为什么要剥离 privacyPopList？
- A: LCP 应对应用户感知的最大内容渲染，隐私弹窗不是首屏关键内容，串进来会污染口径，让优化方向跑偏。`,
    tags: ['滴滴', 'LCP优化', '面试问答'],
    status: 'unvisited',
    difficulty: 'hard',
  },

  {
    id: 'didi-guide-perf-003',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '性能监控',
    question: '面试高频：双端性能监控的 Adapter 模式如何设计？',
    answer: `**问题**：H5 和星河小程序技术栈不同，监控 API 不一样。

**方案**：
\`\`\`typescript
// Adapter 模式抽象统一上报
class PerfAdapter {
  static create(env) {
    return env === 'h5' ? new H5Adapter() : new StarAdapter();
  }
}

class H5Adapter {
  mark(label) { performance.mark(label); }
  measure(from, to) { performance.measure(from, to); }
}

class StarAdapter {
  mark(label) { wx.getPerformance().mark(label); }
  measure(from, to) { wx.getPerformance().measure(from, to); }
}
\`\`\`

**价值**：一套监控代码，双端复用。

**面试追问**：
- Q: 为什么不直接写两套代码？
- A: 维护成本高，容易不一致；Adapter 模式保证两端上报口径统一，便于对比分析。`,
    tags: ['滴滴', 'Adapter模式', '双端适配'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  // ===== 项目二：AI 监控降噪核心要点 =====
  {
    id: 'didi-guide-ai-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: 'AI监控降噪',
    question: '项目二：AI 监控降噪的一句话概括和核心原则',
    answer: `**一句话概括**：
基于 LLM 的接口告警智能判定系统，每条告警走一次模型判断「该不该报、定什么级」，把噪音挡在派发之前。

**问题背景**：
机酒火线上接口告警量大，噪音占比高（业务正常拒绝、低价值展示类错误），真故障被淹没。

**核心原则**：
1. **宁可误报不可误杀**：漏报（FN）优先压到 ≈ 0
2. **判定交给模型**：工程只做路由与编排
3. **引擎领域无关**：业务知识在可插拔 Domain

**我的具体工作**：
1. **接口发现**：用 Claude Code 分析业务代码仓库，自动摘取核心接口清单
2. **火车票 Domain 配置**：配置 url 路由与 severity 基线（如余票查询异常判 P1）
3. **business_reject 清单**：写业务正常拒绝清单，避免误杀
4. **兜底策略**：模型超时统一保守上报 P2
5. **评测闭环**：用漏报率 FN 作为头号指标`,
    tags: ['滴滴', 'AI降噪', '面试要点'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  {
    id: 'didi-guide-ai-002',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: 'AI监控降噪',
    question: '面试高频：为什么余票查询异常判 P1？',
    answer: `**火车票主流程链**：
查询(余票) → 填单/校验 → 下单占座 → 支付 → 出票 → 退改

**余票查询判 P1 的理由**：
- 余票查询是下单主流程入口，挂了等于阻塞下单
- 不能因为名义上是「查询」就降级成 P2/P3
- 用户无法查询到票 = 无法完成预订 = 主流程阻断

**Severity 定义**：
| 等级 | 含义 |
|------|------|
| P0 / P1 | 阻断主流程链的真异常 |
| P2 | 影响单用户但有兜底；信息不足保守上报的下限 |
| P3 | 纯展示 / 弱业务；或不上报时的占位级 |

**反例**：
展示类、NPS、公告等弱业务 → P3 或不上报。`,
    tags: ['滴滴', 'Severity判定', '业务理解'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  {
    id: 'didi-guide-ai-003',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: 'AI监控降噪',
    question: '面试高频：「宁可误报不可误杀」在工程上如何落地？',
    answer: `**产品原则**：
漏报（FN）优先压到接近 0，误报（FP）在 FN 达标后再降。

**工程落地**：
1. **信息不足默认上报**：
   - 缺 errorCode / 模糊 errmsg → 倒向上报，severity ≥ P2

2. **链路异常兜底**：
   - 超时 / 网关报错 / JSON 解析失败 → 一律 \`should_report=true, severity=P2\`
   - 永不吞告警、不卡 Kafka 消费

3. **路由未命中兜底**：
   - 自有前缀内未覆盖接口 → \`fallbackKey\` 保守上报
   - 清单过期只降 severity 精度，不造成漏报

4. **评测纪律**：
   - FN 是头号指标；正负样本平衡
   - 防止「一律不报」刷高分

**一句话**：降噪可以错报噪音，但不能把真故障静默丢掉。`,
    tags: ['滴滴', '兜底策略', '工程化'],
    status: 'unvisited',
    difficulty: 'hard',
  },

  {
    id: 'didi-guide-ai-004',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: 'AI监控降噪',
    question: '面试高频：可插拔 Domain 架构的价值是什么？',
    answer: `**核心设计**：
\`\`\`
换团队 = 换 DOMAIN + 加配置文件夹
DOMAIN=train  → domains/train/
DOMAIN=flight → domains/flight/
DOMAIN=hotel  → domains/hotel/
\`\`\`

**系统分层**：
- **入口层**（领域无关）：server.js（HTTP）/ consumer.js（Kafka）
- **处理核** pipeline.js：按 DOMAIN 加载 domains/<team>
- **三大引擎**：router（url→分类）/ triage（拼Prompt）/ llm（网关适配）
- **可插拔 Domain**：rules.js + prompts/

**价值**：
1. **引擎代码对所有团队通用**：换团队不改引擎
2. **扩展成本 ≈ 0**：新增团队只需加配置
3. **业务知识隔离**：每个团队维护自己的 Domain

**面试加分**：
主动说「引擎领域无关，业务知识在可插拔 Domain」，体现架构思维。`,
    tags: ['滴滴', '可插拔架构', '架构设计'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  // ===== 技术亮点速查 =====
  {
    id: 'didi-guide-highlight-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '技术亮点',
    question: '两个项目的 5 大技术亮点速查',
    answer: `**亮点 1：双端性能监控 Adapter 模式**
- 问题：H5 和星河小程序 API 不同
- 方案：Adapter 抽象统一上报
- 价值：一套监控代码，双端复用

**亮点 2：缓存命中直渲状态机**
- 问题：列表页切日期，缓存命中仍触发请求
- 方案：cacheHit → skipFetch → directRender
- 价值：避免无效网络请求，LCP ↓240ms

**亮点 3：可插拔 Domain 架构**
- 问题：机酒火三个品类接口特征不同
- 方案：换团队 = 换 DOMAIN + 加配置
- 价值：引擎零改动，扩展成本 ≈ 0

**亮点 4：LLM 工程化兜底策略**
- 问题：模型超时、网关报错怎么办
- 方案：统一兜底 should_report=true, severity=P2
- 价值：降噪能力降级时，可用性优先

**亮点 5：评测驱动的 Prompt 调优**
- 问题：如何保证降噪不误杀真故障
- 方案：FN 头号指标、数据集冻结、train 调 / holdout 验
- 价值：工程化保证降噪质量`,
    tags: ['滴滴', '技术亮点', '面试速查'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  // ===== 避坑指南 =====
  {
    id: 'didi-guide-pitfall-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '避坑指南',
    question: '面试中 5 个常见错误表述（避坑）',
    answer: `**❌ 坑1：过度美化参与度**
- 错误："Skill 是我从 0 到 1 写的"
- 正确："Skill 框架是团队搭的，我参与了监控体系搭建和性能优化落地"

**❌ 坑2：夸大上线范围**
- 错误："AI 监控降噪已全量上线，降噪率提升 80%"
- 正确:"判定链路已通、火车票 Domain 已回源核验，派发通道与缓存是下一阶段"

**❌ 坑3：对技术细节含糊其辞**
- 错误："就是用 AI 做了个监控"
- 正确："基于 LLM 的告警判定系统，每条走一次模型，输出 should_report / severity / reason"

**❌ 坑4：无法回答「你具体做了什么」**
- 错误："就是配置了一下 Prompt"
- 正确："我做了火车票 Domain 的路由表、severity 基线、business_reject 清单，并回源码核验"

**❌ 坑5：把估算当真测**
- 错误："Skill 已经精确测出所有函数耗时"
- 正确："Skill 用类型估算表给出优先级，P0 改动后必须用 DevTools / 真机校准"`,
    tags: ['滴滴', '避坑指南', '面试技巧'],
    status: 'unvisited',
    difficulty: 'easy',
  },

  {
    id: 'didi-guide-pitfall-002',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '避坑指南',
    question: '面试中 4 个加分表述技巧',
    answer: `**✅ 加分1：主动说边界**
- "PerfMonitor 负责线上验收，Skill 负责缩小嫌疑"
- "降噪解决注意力分配，不替代故障根因定位"

**✅ 加分2：展示演进意识**
- "阶段一内嵌验证判定效果，阶段二中心化配置推广"
- "当前重点是压 FN 到 ≈0，下阶段再降 FP"

**✅ 加分3：体现工程思维**
- "引擎领域无关，业务知识在可插拔 Domain"
- "每条都走 LLM 保证质量，性能靠缓存/聚合补"

**✅ 加分4：量化结果 + 方法论**
- "LCP 1400→1160ms（↓17%），通过 Omega 线上统计"
- "漏报率 FN 作为头号指标，train 调 / holdout 验"`,
    tags: ['滴滴', '加分技巧', '面试策略'],
    status: 'unvisited',
    difficulty: 'easy',
  },

  // ===== 关键数字速查 =====
  {
    id: 'didi-guide-numbers-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '关键数字',
    question: '面试必背的关键数字速查表',
    answer: `| 指标 | 数值 | 来源 |
|------|------|------|
| 列表页 LCP 优化 | 1400ms → 1160ms（↓17%） | Omega 线上统计 |
| 星河底部菜单卡顿 | 改善约 27% | 用户行为埋点对比 |
| 实习时长 | 7 个月（2026.01–2026.07） | 实习记录 |
| 监控覆盖 | 跨页/LCP/FCP/接口维度 | perf-monitor.js |
| 火车票主流程 | 查→填→下→付→票→退改 | 业务文档 |
| 评测头号指标 | 漏报率 FN ≈ 0 | eval 闭环 |

**面试技巧**：
- 提到优化效果时，必须说出具体数字
- 提到指标时，说明来源（Omega / 埋点 / 真机测试）
- 避免「大概」「可能」「应该」等模糊词`,
    tags: ['滴滴', '关键数字', '面试必背'],
    status: 'unvisited',
    difficulty: 'easy',
  },

  // ===== 快速复习 Checklist =====
  {
    id: 'didi-guide-checklist-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '快速复习',
    question: '面试前 30 分钟快速复习 Checklist',
    answer: `**项目一：性能监控**
- [ ] 能说出 LCP ↓17%、卡顿 ↓27% 的具体优化动作
- [ ] 能画出 PerfMonitor 架构（三段式 API + 双端 Adapter）
- [ ] 能解释为什么剥离 privacyPopList
- [ ] 能说出 Skill 三阶段模型（加载/交互/监听）

**项目二：AI 监控降噪**
- [ ] 能说出系统分层（入口/pipeline/router/triage/llm/domain）
- [ ] 能解释为什么每条都走 LLM（不做规则预过滤）
- [ ] 能说出火车票主流程链（查→填→下→付→票→退改）
- [ ] 能解释余票查询异常为什么判 P1
- [ ] 能说出 FN 作为头号指标的评测纪律

**技术亮点**
- [ ] 双端性能监控 Adapter 模式
- [ ] 缓存命中直渲状态机
- [ ] 可插拔 Domain 架构
- [ ] LLM 兜底策略（永不吞告警）
- [ ] 评测驱动 Prompt 调优

**避坑**
- [ ] 不夸大参与度（"团队搭的 + 我落地的"）
- [ ] 不夸大上线范围（"判定链路已通 + 派发是下一阶段"）
- [ ] 能诚实说「这块我不太清楚，但可以讲我负责的部分」`,
    tags: ['滴滴', '快速复习', '面试 Checklist'],
    status: 'unvisited',
    difficulty: 'easy',
  },

  // ===== 对比与综合问题 =====
  {
    id: 'didi-guide-compare-001',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    category: '对比问题',
    question: '面试高频：两个项目的共性和差异是什么？',
    answer: `**共性**：
都是「从问题定位到工程化沉淀」的完整闭环

| 维度 | 共性 |
|------|------|
| 问题定义 | 都从实际痛点出发（性能慢、告警噪音）|
| 技术方案 | 都有架构设计（Adapter模式、可插拔Domain）|
| 工程化 | 都沉淀为可复用工具（Skill、引擎）|
| 验证 | 都有量化指标（LCP↓17%、FN≈0）|

**差异**：

| 维度 | 项目一：性能监控 | 项目二：AI 降噪 |
|------|----------------|----------------|
| 定位 | 前端基础设施 | AI 工程化应用 |
| 技术栈 | 性能监控、双端适配 | LLM、Prompt 工程 |
| 产出 | 监控体系 + Skill | 降噪引擎 + Domain |
| 难点 | 双端兼容、状态机 | 业务语义理解、兜底 |

**面试技巧**：
- 先说共性（体现系统性思维）
- 再说差异（体现技术广度）
- 最后强调「都是前端基础设施建设能力」`,
    tags: ['滴滴', '对比分析', '综合问题'],
    status: 'unvisited',
    difficulty: 'medium',
  },

  {
    id: 'didi-guide-compare-002',
    module: 'projects',
    chapterId: 'didi-interview-guide',
    question: '面试高频：这些数字（LCP ↓17%）是你独立做的吗？',
    answer: `**诚实对齐**（按实际参与度选用）：

1. **独立负责某段**：
   - 如列表口径修正 + LCP 对比
   - 或菜单卡顿排序优化

2. **协作搭建监控**：
   - 参与 PerfMonitor 打点设计
   - 双端环境抽象
   - Omega 事件对齐

3. **分析侧沉淀**：
   - page-performance-analysis Skill 规程与报告契约

**避免**：
- 把整段同事工作不加区分说成「全部我一个人从 0 到 1」

**加分**：
- 主动画出双轨分工图
- 说清自己贡献边界
- 体现团队协作能力

**标准回答模板**：
"LCP 优化是团队项目，我负责 XX 部分的落地。
具体来说，我做了（列举 3 点具体工作）。
最终的 17% 提升是通过 Omega 线上统计得出的。"`,
    tags: ['滴滴', '参与度说明', '诚信表述'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

export const didiInterviewGuideChapter: Chapter = {
  id: 'didi-interview-guide',
  module: 'projects',
  title: '滴滴实习项目简历备战指南',
  description: '完整面试准备材料：项目背景、核心要点、技术亮点、避坑指南、快速复习',
  cardCount: didiInterviewGuideCards.length,
  icon: '📋',
};
