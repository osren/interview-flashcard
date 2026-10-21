import { FlashCard, Chapter } from '@/types';

export const interviewflashCards: FlashCard[] = [
  {
    id: 'interviewflash-001',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '项目介绍',
    question: '请介绍一下 InterviewFlash 秋招面试一体化备战平台，它解决什么问题？',
    answer: `**定位**：面向秋招的一站式面试备战 Web App——把「刷题、投递、简历、复盘」收敛到同一产品里，而不是散落在 Notion / Excel / 飞书文档里。

**痛点**：
1. 知识点分散：核心考点、项目深挖、MPX、面试真题各自成岛，进度难统一
2. 投递难追踪：校招岗位多、状态乱，缺少「筛选 → 投递 → 进度」闭环
3. 简历与 JD 脱节：改简历靠感觉，缺少按岗位定向优化入口
4. 换设备丢进度：本地刷题记录、投递状态无法云端同步

**产品模块**：
- **刷题**：Core / Projects / MPX / Interview / AI 资讯 / 自定义卡片
- **秋招投递**：看板、岗位库、岗位池（外嵌表格）、求职进度
- **简历**：在线简历 iframe、PDF 管理、口述稿、JD 优化
- **学习运营**：打卡日历、收藏、学习进度云同步

**一句话**：不是单纯闪卡站，而是「备战闭环」：学 → 投 → 改简历 → 复盘。`,
    tags: ['InterviewFlash', '项目介绍', '秋招'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'interviewflash-002',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '项目搭建',
    question: 'InterviewFlash 是怎么从零搭建的？技术栈如何选型？',
    answer: `**脚手架与工程**：
1. Vite 5 + React 18 + TypeScript（strict）作为基座，\`@\` → \`src\` 路径别名
2. Tailwind CSS 做设计系统（多邻国风：绿主色、surface-panel、字重偏粗）
3. React Router 6 做多模块路由；Zustand + persist 做本地进度持久化
4. Framer Motion / Lucide 负责动效与图标；\`@uiw/react-md-editor\` 承载 Markdown 答案编辑

**后端与 AI**：
- Supabase：Auth、岗位 catalog、投递同步、学习进度同步、Edge Function 调 LLM
- 未配 Supabase 时本地仍可用（catalog 本地 JSON fallback）

**选型理由（分点）**：
1. **Vite**：开发体验好，天然适合后续 \`manualChunks\` / 动态 import 做性能拆包
2. **Zustand**：比 Redux 轻，\`persist\` 一把梭本地进度，和云端 merge 逻辑好接
3. **Tailwind**：模块多、页面多，utility-first 比维护巨型 CSS 更快
4. **Supabase**：个人项目不自建后端，Auth + Postgres + Edge Functions 够用

**目录约定**：\`pages/\` 路由页、\`data/\` 静态题库、\`store/\` 状态、\`lib/supabase/\` 云端、\`hooks/\` 同步与水合。`,
    tags: ['InterviewFlash', '项目搭建', '技术选型'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'interviewflash-003',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '架构组织',
    question: '说说 InterviewFlash 的整体架构与数据流是怎样组织的？',
    answer: `**分层视角**：
1. **表现层**：\`pages/*\` + \`components/*\`（刷题卡、秋招 Tab、简历 Tab）
2. **状态层**：\`useCardStore\` / \`useCampusJobStore\` / \`useResumeStore\` / \`useStreakStore\`
3. **数据层**：\`src/data/*\` 静态 FlashCard；\`docs/秋招岗位/**/*.json\` 岗位库
4. **同步层**：\`CampusJobSyncProvider\`、\`LearningSyncProvider\`（登录后 pull-merge-push）
5. **能力层**：LLM Edge Function（JD 解析、简历优化）、iframe 外嵌（岗位池/在线简历）

**刷题数据流**：
\`静态 cards → getMergedCards(自定义/修改) → FlashCard UI → updateCardStatus → persist / 云端 sync\`

**秋招数据流**：
\`本地 JSON lazy 加载 / 远程 catalog → store.catalogJobs + customJobs → Dashboard/Jobs/Progress\`
\`投递状态 → jobProgress → debounce push\`

**关键设计决策**：
1. **静态题库与用户进度分离**：题干在仓库，进度在 localStorage + 云端
2. **Provider 挂 App，但能力按需**：catalog / learning sync 不在无关路由空跑
3. **章节按需 import**：Core/Projects 大文件不进首屏主包
4. **模块边界清晰**：刷题、投递、简历可独立迭代，靠路由与 store 拼装`,
    tags: ['InterviewFlash', '架构', '数据流'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'interviewflash-004',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '开发流程',
    question: '这个项目的开发流程是怎样的？如何用 AI / Harness 提效？',
    answer: `**日常流程**：
1. 需求澄清：功能边界、数据来源、是否要上云
2. 落类型与 store：先定 TS 接口，再写 UI
3. 本地可用优先：无登录也能刷题 / 看岗位
4. 再接 Supabase：同步、鉴权、Edge Function
5. \`npm run build\` 做体积与类型门禁

**内容生产流水线**：
- 面试文档 → \`file-to-flashcard\` / 导入规范 → \`src/data/interview|core|projects\`
- 秋招 JD JSON → \`docs/秋招岗位\` → lazy glob / seed 远程 catalog
- OpenHarness：\`/oh:propose\` → design 审批 → apply → verify/review

**AI 辅助原则**（可面试口述）：
1. **约束文件先行**：\`CLAUDE.md\`、\`docs/harness\` 降低胡写范围
2. **Skill 固化重复劳动**：转 flashcard、面试答疑、OpenSpec 执行
3. **人审关键路径**：云端 merge、性能拆包、iframe 兼容策略需人工拍板
4. **验证闭环**：改完必须 build / 关键路径手测，避免「看起来完成」`,
    tags: ['InterviewFlash', '开发流程', 'AI工程化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'interviewflash-005',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '核心功能',
    question: 'InterviewFlash 有哪些核心功能？分别怎么实现？',
    answer: `**1. 闪卡学习**
- 翻转卡片 + 记住/复习状态；章节进度；收藏；自定义增删改
- Markdown 答案编辑；部分题支持 \`answerImage\` 全屏图解

**2. 秋招投递**
- 看板按 S/A/B 分层；岗位库筛选（仅推荐/全部）；投递状态机（已投→笔试→面试→Offer/终止）
- 岗位池：iframe 内嵌飞书表 / 腾讯文档，子 Tab 切换且缓存已加载页

**3. 简历中心**
- 在线简历 iframe；PDF 上传预览下载；口述稿本地编辑；按 JD 调用 LLM 生成优化副本

**4. 云端同步**
- 投递进度 / 自定义岗位、学习状态 / 打卡日期：登录后 merge，防抖 push
- catalog 远程优先，本地 JSON 作 offline fallback

**5. 运营体验**
- 首页进度环 + 打卡日历；模块入口卡片；主题与统一视觉语言

**实现共性**：本地优先 → 可选上云；大资源按需加载；重交互状态 keep-alive。`,
    tags: ['InterviewFlash', '核心功能'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'interviewflash-006',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '性能优化',
    question: '你做过一轮全局性能优化，当时的问题诊断思路是什么？',
    answer: `**现象**：生产包单 JS 约 **3.78MB**（gzip ~1.29MB）；切 Tab 会重复打外嵌表格 / 在线简历请求；任意打开站点就拉秋招 catalog。

**诊断拆三层**：
1. **包体积**：\`App.tsx\` 同步 import 全部页面；\`core\`/\`projects\`/\`秋招 JSON\` eager 进主包；mdeditor / xlsx / antd 重
2. **运行时重复加载**：条件渲染 \`{activeTab === x && <Tab/>}\` 卸载 iframe；\`key={source}\` 强制重建
3. **无效网络**：\`CampusJobSyncProvider\` / \`LearningSyncProvider\` 在无关路由也工作

**原则**：
- 先做「体感」优化（iframe/Tab keep-alive），再做「首屏」拆包
- 能按需就不全局；能缓存就不销毁；能异步就不 eager
- 用 build 产物验证，而不是凭感觉说快了

**结果**：主入口约 **224KB**（gzip ~77KB）；章节、岗位 JSON、vendor 拆成独立 chunk。`,
    tags: ['InterviewFlash', '性能优化', '诊断'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'interviewflash-007',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '性能优化',
    question: '秋招岗位池与简历在线页的 iframe 优化具体怎么做？为什么切换会重复请求？',
    answer: `**根因**：
1. 父级 Tab 用条件渲染，切走就卸载 DOM → iframe 下次重新 \`src\` 加载
2. 岗位池早期单 iframe + \`key={sourceId}\`，飞书/腾讯切换等于销毁重建

**岗位池方案**：
1. 双 iframe：首次点开才 \`mounted\`，之后只 \`invisible\` / \`pointer-events-none\` 切换
2. 每个 source 独立 loading / failed / timeout（15s），失败才提示「新窗口打开」
3. 超时 timer 按 source 管理，避免依赖整个 \`embedState\` 导致 timer 被重置

**简历 / PDF / AI HTML**：
1. 在线简历：\`visitedTabs\` keep-alive + \`hidden\`
2. PDF 预览：按 resumeId 缓存多个 iframe，关闭只关外壳
3. AI HTML 弹窗：首次打开后挂载保留，再开瞬时显示

**收益**：频繁切换不再重复打 CDN/文档站；滚动与筛选状态保留。
**边界**：飞书/腾讯若禁止嵌入，只能 fallback 新窗口——这是平台 CSP，不是前端 bug。`,
    tags: ['InterviewFlash', 'iframe', 'keep-alive'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'interviewflash-008',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '性能优化',
    question: '路由懒加载、章节拆包、秋招 JSON lazy glob 分别怎么落地？',
    answer: `**1. 路由懒加载**
- \`React.lazy\` + \`Suspense\` 包装 Campus / Resume / Core / Interview 等页面
- Home 仍同步加载（首屏入口）；其余按路由下载

**2. Core / Projects 章节拆包**
- \`chapters-meta.ts\` 只放轻量章节元数据（title / cardCount）
- \`loadCoreChapterCards(id)\` / \`loadProjectCards(id)\` 动态 \`import()\` 对应文件
- CoreIndex / ProjectDetail 进入时再拉卡片；Home 进度可异步汇总

**3. 秋招 JSON lazy glob**
- 原来：\`import.meta.glob(..., { eager: true })\` → 51 个 JSON 进主包
- 现在：非 eager + \`ensureLocalCampusCatalog()\`，进入秋招/JD 优化再加载并缓存
- 有远程 catalog 时优先 remote，本地作 fallback

**4. Vite manualChunks**
- 拆 \`vendor-motion\` / \`vendor-mdeditor\` / \`vendor-xlsx\` / \`vendor-supabase\` / \`vendor-antd-rjsf\` / \`vendor-react\`
- MDEditor、xlsx 再通过动态组件 / \`import('xlsx')\` 二次延后

**口述要点**：拆包目标是「首屏不下载用不到的题库与编辑器」，不是为了消灭大 vendor。`,
    tags: ['InterviewFlash', 'code-split', 'lazy'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'interviewflash-009',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '性能优化',
    question: '云端请求与同步如何改成按需？LearningSync / Campus catalog 怎么取舍？',
    answer: `**Campus catalog**：
- 旧：App 挂载就 \`fetchCampusJobCatalog\`
- 新：暴露 \`ensureCatalogLoaded()\`，仅 \`CampusIndex\` / \`ResumeOptimizeTab\` 调用；幂等（ref 防重复）

**LearningSync**：
- 用 \`useLocation\` 判断是否学习相关路由（\`/core\` \`/projects\` \`/favorites\` …）
- 非学习页（如纯看简历、部分工具页）不 pull/push，减少无效往返

**用户投递同步仍可登录即用**：进度变更 debounce 1.5s push；远程 merge 用 generation 防竞态。

**取舍**：
1. 全局 Provider 便于任意页读 sync 状态，但不等于全局立刻发请求
2. 「能力常驻 + 行为按需」比把 Provider 拆碎更好维护
3. 本地优先：云挂了仍可刷题、看本地岗位`,
    tags: ['InterviewFlash', '同步', '按需请求'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'interviewflash-010',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '性能优化',
    question: 'Tab keep-alive、MDEditor 懒加载、列表 content-visibility 解决什么问题？',
    answer: `**Tab keep-alive（秋招 / 简历）**
- 问题：切 Tab 丢选中岗位、展开公司、表单输入、已加载 iframe
- 做法：\`visitedTabs\` 集合，已访问的渲染但 \`hidden\`，未访问不挂载（首次仍懒）

**LazyMDEditor**
- 问题：\`@uiw/react-md-editor\` ~1MB 级，FlashCard/多页面静态 import 拖主包
- 做法：\`React.lazy\` 封装编辑器与 Markdown 预览，真正编辑时再加载 CSS/JS

**JobsTab content-visibility**
- 公司列表可能较长；用 \`content-visibility: auto\` + \`contain-intrinsic-size\` 跳过屏外布局成本
- 相比引入虚拟列表库：改动小、不破坏手风琴展开结构

**统一思想**：保留用户状态、推迟重资源、对长列表做渲染跳过。`,
    tags: ['InterviewFlash', 'keep-alive', 'MDEditor'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'interviewflash-011',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '项目亮点',
    question: 'InterviewFlash 的项目亮点有哪些？面试时怎么讲差异化？',
    answer: `**亮点（建议按这个顺序讲）**：
1. **业务闭环完整**：刷题 + 投递看板 + 简历 JD 优化，不是 Demo 级闪卡
2. **本地优先 + 可选云同步**：未登录可用；登录后进度/投递不丢，merge 有防抖与世代号
3. **性能治理可量化**：从 3.78MB 单包拆到主入口 ~224KB，措施可复述、可演示
4. **外嵌资源工程化**：岗位池双表缓存、失败降级、布局用视口高度撑满
5. **内容工程**：题库/岗位 JSON 与 UI 解耦；导入规范 + Skill 提效
6. **AI 落地场景清晰**：JD 解析加岗、简历按 JD 优化，而不是空喊「接了大模型」

**差异化一句话**：
> 我做的是秋招备战操作系统：知识沉淀、投递执行、简历迭代在同一套状态与同步体系里，并且用拆包/按需加载把个人项目也按生产标准做性能治理。`,
    tags: ['InterviewFlash', '项目亮点'],
    status: 'unvisited',
    difficulty: 'easy',
  },
  {
    id: 'interviewflash-012',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '难点与权衡',
    question: '实现过程中有哪些难点和权衡？如果重来你会怎么改？',
    answer: `**难点**：
1. **跨域 iframe**：无法可靠探测「是否被 XFO/CSP 拦截」，只能 timeout + 错误文案 + 新窗口 fallback
2. **本地/远程岗位双源**：要避免远程成功后仍被本地 JSON 覆盖；lazy 加载与 catalogSource 判断要严谨
3. **同步冲突**：多端改进度需 merge 策略 + applyingRemote 开关防回环 push
4. **拆包与 DX**：章节 meta 的 cardCount 与真实数组 length 可能漂移，需要约定或脚本校验

**权衡**：
- keep-alive 换内存：已访问 Tab 不卸载，对秋招/简历可接受
- Home 异步拉全量卡算进度：首屏快，但进度数字会短暂用估算值
- content-visibility 而非完整虚拟列表：实现成本低，极端超长列表再升级

**若重来**：
1. 章节 meta 由构建脚本从 cards 生成，杜绝手写 count
2. 给外嵌页做统一 \`EmbedFrame\` 组件（加载/失败/缓存 API）
3. 同步层抽象成通用 \`createCloudSyncStore\`，减少 Campus/Learning 重复样板`,
    tags: ['InterviewFlash', '权衡', '难点'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'interviewflash-013',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '秋招投递',
    question: '秋招投递模块是怎么设计的？岗位池为什么要内嵌外部表格？',
    answer: `**模块结构（4 Tab）**：
1. **投递看板**：按 tier 看推荐岗位与链接
2. **秋招职位**：公司树 + 岗位详情 + 状态面板 + AI 解析 JD 加岗
3. **秋招岗位池**：飞书 / 腾讯文档全量信息（内推与持续更新表）
4. **求职进度**：已追踪岗位的状态时间线 / 可视化

**岗位池动机**：
- 全量秋招信息更新快，社区表格已是事实来源
- 自建爬虫成本高且不稳定；iframe / 新窗口是务实接入
- 产品内嵌可减少「切出去找表 → 再回来记状态」的上下文切换

**与自建岗位库关系**：
- 自建库：结构化、可筛选、可标记投递（高质量子集）
- 外嵌池：广覆盖、跟社区更新（发现入口）
- 二者互补：池里发现 → 感兴趣再进入职位库跟进状态`,
    tags: ['InterviewFlash', '秋招投递', '岗位池'],
    status: 'unvisited',
    difficulty: 'medium',
  },
  {
    id: 'interviewflash-014',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '状态管理',
    question: '刷题进度与秋招投递状态如何持久化与同步？',
    answer: `**本地**：
- Zustand \`persist\`：\`card-storage\`、\`campus-job-storage\` 等
- 刷题：\`cardStatuses\` / \`cardProgress\` / \`customCards\` / \`favorites\`
- 秋招：\`customJobs\` / \`customCompanies\` / \`jobProgress\` / \`lastSelectedJobId\`（catalog 不持久化进用户数据）

**云端**：
1. 登录 → pull 远程 payload → 与本地 merge → 写回云并更新本地
2. 本地变更 → subscribe → debounce push（岗位变更可立即）
3. \`applyingRemoteRef\` 避免 apply 远程时触发 push 死循环
4. \`syncGenerationRef\` 处理快速切换账号 / 重复 pull

**状态机（投递）**：
\`applied → screen → written_exam → interview → offer | rejected(+rejectReason)\`
支持当天误触同状态撤销，便于统计被刷环节。

**面试可强调**：个人项目也把「离线可用 + 多端一致」当成一等需求，而不是只存 localStorage。`,
    tags: ['InterviewFlash', 'Zustand', '同步'],
    status: 'unvisited',
    difficulty: 'hard',
  },
  {
    id: 'interviewflash-015',
    module: 'projects',
    chapterId: 'interviewflash',
    category: '项目介绍',
    question: '用 STAR 讲一次你在 InterviewFlash 上最有含金量的优化经历',
    answer: `**S（情境）**  
站点功能变全后，生产单包约 3.78MB；秋招岗位池 / 在线简历切换 Tab 反复重载外嵌页；打开任意页面就请求岗位 catalog。

**T（任务）**  
在不砍功能的前提下：降低首屏成本、消灭重复 iframe 请求、把云请求改成按需，并保持可维护。

**A（行动）**  
1. iframe / Tab keep-alive（双表缓存、visitedTabs、PDF/HTML 缓存）  
2. 路由 lazy + Vite manualChunks + 章节/岗位 JSON 动态 import  
3. MDEditor / xlsx 懒加载；Campus catalog / LearningSync 按路由或页面触发  
4. JobsTab \`content-visibility\`；用 build 产物验收

**R（结果）**  
主入口降至约 224KB（gzip ~77KB）；重资源独立 chunk；切换岗位池/在线简历不再重复打文档站；无关页面不再空拉 catalog。  

**可追问预备**：如何测体积（build 产物）、iframe 探测限制、拆包后 meta cardCount 一致性。`,
    tags: ['InterviewFlash', 'STAR', '性能优化'],
    status: 'unvisited',
    difficulty: 'medium',
  },
];

export const interviewflashChapter: Chapter = {
  id: 'interviewflash',
  module: 'projects',
  title: 'InterviewFlash 秋招面试一体化备战平台',
  description:
    '项目搭建、架构组织、开发流程、核心功能、性能优化与项目亮点（含岗位池/拆包/keep-alive 复盘）',
  cardCount: interviewflashCards.length,
  icon: '⚡',
};
