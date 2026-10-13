import type { Chapter, FlashCard } from '@/types';

export const didiPerformanceCards: FlashCard[] = [
  {
    id: 'didi-performance-002',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '监控设计',
    question: 'H5 和小程序的性能监控如何统一？采集哪些指标？',
    answer: `采集层使用 Adapter 隔离平台差异：H5 使用 Web Performance 能力（如 \`PerformanceObserver\`），星河小程序使用 \`wx.getPerformance\`。业务埋点调用统一接口，避免环境判断散落在业务代码中。

监控分三层：
1. 跨页链路，例如首页到列表完成耗时。
2. 页面指标，例如 LCP、FCP。
3. 关键接口耗时，例如首页 \`getHomeData\`。

数据统一经 Omega 上报。平台能力并非完全等价，需处理缺失值并核对采集边界；跨页与接口耗时是业务自定义指标，不应统称为 Web Vitals。`,
    tags: ['商旅', '性能监控', 'Adapter'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-003',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '列表优化',
    question: '列表切换日期时怎样利用缓存，并避免旧请求覆盖新数据？',
    answer: `列表数据在同一页面会话内按日期缓存在内存 Map。命中当前日期时走 \`cacheHit → skipFetch → directRender\`，直接渲染对应数据；未命中时再请求。

快速切换日期会产生请求竞态。每次切换递增 \`requestId\`，响应返回时只有它仍是最新请求且日期仍匹配当前选择，才允许更新页面。这样较早日期的慢响应不会覆盖新日期。刷新后内存缓存清空。现有材料没有说明筛选条件参与缓存 key，若结果受筛选影响需按实际代码确认 key 或清理策略。`,
    tags: ['商旅', '缓存', '请求竞态'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'didi-performance-004',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '指标口径',
    question: '为什么把列表耗时拆成 fetch、render、paint？',
    answer: `原统计把请求和页面重渲染混在一起，数值变长时无法判断是网络等待还是视图更新。

- \`fetch\`：请求发出到响应数据可用，回答数据等了多久。
- \`render\`：数据交给页面到框架完成视图更新，回答页面更新花了多久。
- \`paint\`：视图更新后到内容可见，回答用户何时看到结果。

同时保留从用户切换日期到新列表可见的端到端交互耗时。切日期是页内交互，不应当成新的一次页面 LCP；缓存命中路径也应单独标记，不计 fetch。具体 mark 名称和时间戳仍需以业务代码及 Omega 定义为准。`,
    tags: ['商旅', '性能指标', '埋点'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-005',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '首屏优化',
    question: '为什么延后 privacyPopList？如何保证不影响首屏和隐私流程？',
    answer: `\`getHomeData\` 决定首页主体内容，\`privacyPopList\` 是隐私弹窗相关数据。原初始化把两者放在首屏等待链路中；改造后保留主体数据在关键路径，将隐私列表移出首屏 \`Promise.all\`，通过 \`defer(fn)\` 延后执行。

项目资料给出的策略是优先使用带 timeout 的 \`requestIdleCallback\`，不支持时退回 \`setTimeout(fn, 0)\`。目标是缩短首屏关键等待，不是丢弃隐私提示。网络请求本身不必然阻塞绘制，关键在初始化是否等待该 Promise，以及回调/状态更新是否影响主线程。若隐私确认必须在首屏前展示，就不能简单延后；需验证核心交互与合规时序。`,
    tags: ['商旅', '首屏', '关键路径'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-006',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '渲染优化',
    question: '星河底部菜单切换卡顿的原因和优化是什么？',
    answer: `项目定位到菜单切换时重复对同一份数据排序并触发额外渲染。通过 \`useMemo\` 缓存排序结果：排序依赖未变时复用结果，依赖变化时重新计算，减少切换过程中的重复工作。

依赖数组必须包含菜单数据和排序条件；如果依赖每次渲染都创建新引用，缓存会失效。

\`useMemo\` 只缓存计算结果，不会把排序移出主线程，也不保证整个组件完全不渲染。项目记录卡顿指标改善约 27%，资料未给出 FPS、P95 或固定毫秒数。`,
    tags: ['商旅', '小程序', 'useMemo'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-007',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '数据与复盘',
    question: 'LCP 下降 17% 和菜单卡顿改善 27% 应该怎样解释？',
    answer: `列表 LCP 从约 1400ms 到 1160ms，减少 240ms，\`240 / 1400 ≈ 17.1%\`，因此约下降 17%。菜单切换卡顿约改善 27%，材料描述来源是用户行为埋点对比。

回答时说明这是项目记录的观测结果，并准备统计窗口、样本量、设备/网络分层和指标定义。现有资料未提供这些完整细节，因此不包装成严格 A/B 因果结论，也不推导未记录的 FPS、P95、SEO 或 TTI 提升。`,
    tags: ['商旅', '指标', '面试口径'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'didi-performance-008',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '工程化沉淀',
    question: '性能分析 Skill 做什么？它能替代线上性能测量吗？',
    answer: `\`page-performance-analysis\` Skill 按加载、交互、数据监听等阶段分析源码，排查请求瀑布、重复请求、监听连锁、渲染和节流防抖风险，并输出函数风险排序及 P0/P1/P2 建议。

它用于缩小排查范围，不是运行时 profiler，也不能直接证明函数线上耗时。最终需要 PerfMonitor/Omega、浏览器或小程序 profiler 验证。静态分析找线索 → 建立运行基线 → 改业务链路 → 同口径验收。简历中的 \`perf-debug-loop\` 与资料中的 Skill 名称关系需核实后再统一表述。`,
    tags: ['商旅', 'Skill', '性能分析'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-009',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '浏览器基础',
    question: '重排和重绘有什么区别？性能问题中怎样减少布局抖动？',
    answer: `重排（layout）需要重新计算元素几何位置和尺寸；重绘（paint）更新像素外观但不一定改变布局。通常重排影响范围更大，但实际成本还取决于页面结构、合成层和浏览器实现。

排查时先用 Performance 面板定位长任务、布局与绘制，再减少读写交错造成的强制同步布局，批量读取布局信息后再写样式，避免无意义的大范围 DOM 更新。项目页面的真实优化仍应由运行时数据验证，不能只凭“某属性一定触发重排”下结论。`,
    tags: ['浏览器', '渲染', '性能基础'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-010',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '兼容性与验证',
    question: '如何验证 H5 和小程序的兼容性及性能改造效果？',
    answer: `先按目标用户和产品支持矩阵确认浏览器、系统、客户端版本及小程序运行环境；检查 Performance API、滚动/键盘/安全区和生命周期差异，并对缺失能力做特性检测或降级。

验证覆盖真实设备或开发者工具中的核心路径：页面首屏、日期切换（缓存命中/未命中和快速切换）、接口失败及菜单切换。比较同口径的 Omega 指标，并检查功能、错误率和隐私提示时序。仅靠桌面模拟或静态 Skill 结论不足以验收跨端行为。`,
    tags: ['商旅', '小程序', '兼容性', '验证'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'didi-performance-011',
    module: 'projects',
    chapterId: 'didi-performance',
    category: '问题排查',
    question: '如果小程序偶发白屏，你会怎样排查？',
    answer: `先记录机型、系统、客户端版本、网络、入口和复现路径，确认影响范围及发生时间。结合 JS 错误、资源加载、接口日志和页面性能记录，区分启动/路由失败、数据异常、脚本错误与渲染异常。

在对应设备复现并逐步缩小范围；修复后回归核心页面和网络边界，并通过错误监控观察是否复发。对性能项目的回答应体现先收集证据、定位具体阶段，再决定修复，不直接把白屏归因于网络或渲染。`,
    tags: ['小程序', '排障', '稳定性'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

export const didiPerformanceChapter: Chapter = {
  id: 'didi-performance',
  module: 'projects',
  title: '商旅 H5 / 小程序性能监控与体验优化',
  description: '双端性能监控、列表首屏与日期切换优化、星河菜单卡顿治理及性能分析 Skill',
  cardCount: didiPerformanceCards.length,
  icon: '⚡',
};
