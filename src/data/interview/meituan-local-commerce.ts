import { Company } from '@/types/interview';

export const MEITUAN_LOCAL_COMMERCE: Company = {
  id: 'meituan-local-commerce',
  name: '美团 - 本地核心商业',
  color: 'orange',
  departments: [
    {
      id: 'dept-first-round',
      name: '一面',
      sessions: [
        {
          id: 'session-first',
          name: '技术一面',
          date: '2026-04-06',
          status: 'waiting',
          questions: [
            {
              id: 'q-1',
              question: '滴滴测试环境隔离怎么做的',
              answer: `**测试环境隔离方案**

- **1.开发阶段隔离：**
针对不同的需求，开发初期会拉取独立的Git分支，确保各需求在各自分支上独立开发，互不干扰。
- **2.联调后测试环境：**
联调完成后，会在线下仿真环境（osim）进行测试。osim环境区别于线上和预发环境，采用流量隔离机制。
- **3.流量隔离原理：**
只需部署本次需求改动的服务，即可将标记的流量转发到自己的服务上，其他服务则复用基准环境。
- **4.流量转发机制：**
基于wings-agent实现流量转发，具体规则如下：

- .若流量的traceid未染色，则转发至本机服务。
- .若traceid已染色：
- .存在对应分支环境时，转发至该分支环境。
- .无对应分支环境时，转发至本机服务（通过127.0.0.1）。

- **5.隔离效果：**
通过上述机制，可有效隔离线上环境与其他需求开发环境，确保测试的独立性和准确性。`,
            },
            {
              id: 'q-2',
              question: '整个需求开发的全流程',
              answer: `### 必要前提
- **所需必须文档：** 在启动任何开发工作前，必须准备好以下核心文档：
- **产品需求文档（PRD）：** 明确业务目标、功能细节和验收标准。
- **研发流程规范文档：** 统一团队的开发、测试、上线标准。
- **监控规范文档：** 定义线上服务的监控指标、报警阈值和处理流程。

### 启动阶段
- **需求评审：** 产品经理组织，研发、测试等关键角色参与，对PRD进行评审。
- **项目可行性：** 评估需求的商业价值和必要性。
- **技术可行性：** 研发团队初步评估技术实现难度和风险。
- **参与人员确定：** 明确项目负责人、开发、测试等核心成员。
- **输出：** 【技术方案文档】，包含系统架构、模块设计、接口定义等。

### 开发阶段
- **1）阶段一规划：** 功能点评估+排期、技术方案评审
- **2）阶段二开发：** 代码开发、代码评审（CR）
- **3）阶段三联调：** 前后端接口联调、自测

### 测试阶段
- **修复：** 开发人员需及时响应并修复测试人员提交的Bug。
- **监控P0级Bug：** 重点关注和优先解决影响核心功能的P0级Bug
- **输出：** 【测试准入报告】

### 灰度阶段
- **灰度观察：** 产品在小范围用户中发布，期间需密切观察各项监控指标。
- **观察Sentry异常：** 关注前端和后端的错误日志
- **天眼监控报警：** 留意业务监控平台的报警信息
- **要求：** 灰度时间需至少经历一个业务高峰期且总时长大于24小时

### 上线阶段
- **上线确认：** 全量发布前，进行最后的检查和确认。
- **回归功能和主流程：** 对核心功能和主业务流程进行快速回归测试
- **要求：** 严格遵守封线期规定，即周一到周四20点以后，以及周五全天禁止进行非紧急的上线操作

### 收尾阶段
- **复盘总结：** 项目上线稳定后，组织项目复盘会议。`,
            },
            {
              id: 'q-3',
              question: 'openSpec规范如何制定，开发者主要参与的环节是怎样？',
              answer: `### 1. OpenSpec 规范的制定

OpenSpec 的核心不是简单的文档，而是**结构化的"行为契约"**。

* **核心定位：** 管理 Spec 的"文件结构"和"行为定义"，确保输出结构可审核。
* **制定方式：**
  1. **基于上下文生成：** 利用 \`/opsx:propose\` 命令，输入需求描述或参考 Superpowers 生成的设计文档（Design Doc）。
  2. **标准化结构：** OpenSpec 会自动生成一套标准文件结构，包含：
     * \`proposal.md\`：变更的背景（Why）、具体内容（What）及影响评估（Impact）。
     * \`specs/*.md\`：**最关键部分**，使用 \`WHEN/THEN\`（给定条件/预期结果）的形式定义具体的行为规格。
     * \`design.md\`：数据结构、API 定义、时序图等技术实现细节。
     * \`tasks.md\`：将实现过程拆解为具体的、有序的子任务清单。
  3. **明确边界：** 规范中必须包含 **IN SCOPE**（包含范围）和 **OUT OF SCOPE**（明确不做）

### 2. 开发者主要参与的环节

* **需求引导与确认（Initiation）：**
  * 发起 \`/brainstorm\`，回答 AI 提出的关键问题
  * **关键动作：** 判断 AI 提出的方案是否符合业务预期。

* **规格审核（The Crucial Gate）：**
  * 这是**最有价值**的环节。在 AI 生成代码前，开发者必须人工审核 OpenSpec 产出的文件。
  * **审核清单：**
    * \`proposal.md\`：Why/What 是否完整？影响评估是否准确？
    * \`specs/*.md\`：\`WHEN/THEN\` 是否覆盖了边界情况？
    * \`tasks.md\`：任务顺序是否正确？有无循环依赖？
    * \`design.md\`：数据结构是否合理？

* **流程控制与异常处理（Control & Exception Handling）：**
  * 决定何时执行 \`/opsx:apply\` 和 \`/execute-plan\`。
  * 当 AI 在执行过程中遇到无法解决的偏离或报错时，介入进行人工干预或调整 Spec。

* **最终复盘（Retrospective）：**
  * 使用 \`/opsx:archive\` 前，确认所有任务完成且测试通过。`,
            },
            {
              id: 'q-4',
              question: 'JSON Schema 动态表单方案设计怎么实现？',
              answer: `### 0. 何为 JSON Schema

**JSON Schema** 是一种基于 JSON 的**数据描述语言**，用于定义 JSON 数据的结构、类型、格式和校验规则。

* **核心作用**：
  * **描述数据结构**：定义对象、数组、字符串、数字等数据类型。
  * **定义约束条件**：设置字段是否必填、字符串长度限制、数值范围、正则匹配等。
  * **数据校验**：基于定义的规则，自动验证一份 JSON 数据是否合法（Valid）。

### 1. 核心架构与流程

整个系统分为四层，通过解析器将静态配置转化为动态 UI：

1. **Schema 定义层**：由服务端或配置中心提供 JSON Schema，定义字段类型、校验规则和 UI 属性。
2. **解析器层**：使用 \`react-jsonschema-form\` (RJSF) 作为核心解析引擎。
3. **渲染器层**：将解析后的指令映射为具体的 React 组件。
4. **UI 组件层**：基于 Ant Design 的实际输入控件（Input, Select 等）。

### 2. 核心实现步骤

#### 2.1 Schema 规范定义 (配置源)
* **数据结构定义**：定义字段类型（string, number, array 等）。
* **UI 扩展字段 (ui:)**：这是实现 Ant Design 样式的关键。

| 扩展字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| **ui:widget** | 指定渲染组件 | \`textarea\`, \`radio\`, \`date\` |
| **ui:placeholder** | 输入框提示语 | \`"请输入政策名称"\` |
| **ui:disabled** | 是否禁用 | \`true\` / \`false\` |
| **ui:options** | 传递额外属性 | \`{ allowClear: true }\` |
| **ui:rules** | 自定义校验 | \`[{ required: true }]\` |

#### 2.2 核心渲染器封装 (React 组件)
创建一个通用的 \`JsonSchemaForm\` 组件，负责接收 Schema 和数据，并注入自定义的 Ant Design 主题。

#### 2.3 Ant Design 主题适配 (Widgets)
主要映射关系：
* **TextWidget** -> \`Input\`
* **TextareaWidget** -> \`Input.TextArea\`
* **NumberWidget** -> \`InputNumber\`
* **SelectWidget** -> \`Select\`
* **DateWidget** -> \`DatePicker\`
* **RadioWidget** -> \`Radio.Group\`

### 3. 实施与应用流程

1. **环境准备**：安装依赖包 \`react-jsonschema-form\` 和 \`antd\`。
2. **组件开发**：按照上述步骤开发核心渲染组件和适配器。
3. **页面接入**：
   * **旧页面改造**：将原有的硬编码表单替换为 \`<JsonSchemaForm />\`。
   * **新页面开发**：直接编写 JSON Schema 配置，无需编写表单代码。
4. **动态加载**：前端请求服务端接口获取 Schema，动态渲染表单。

### 4. 预期收益
* **效率提升**：新增字段无需修改前端代码，仅需修改 JSON 配置，开发效率提升 60% 以上。
* **维护性增强**：表单逻辑集中在配置文件中，版本可追溯，逻辑清晰。
* **一致性保障**：所有表单自动遵循 Ant Design 设计规范。`,
            },
            {
              id: 'q-5',
              question: '实习中性能优化怎么做的？什么指标来衡量的？',
              answer: `### 路由级代码分割 (Code Splitting)

采用 \`@loadable/component\` 实现路由组件的按需加载，解决首屏体积过大问题。

**实现方式**：
\`\`\`js
const ROUTETOCOMPONENTS = {
  '/ebk': loadable(() => import(\`./pages/ebk\`), {
    fallback: <div>Loading...</div>
  }),
};
\`\`\`

### 预加载与加载策略

| 策略 | 实现方案 | 核心价值 |
| :--- | :--- | :--- |
| **骨架屏 Fallback** | 结合 Loadable 的 \`fallback\` 属性 | 提供视觉反馈，降低用户对等待的焦虑感 |
| **Webpack Prefetch** | \`<link rel="prefetch">\` | 浏览器空闲时预取后续可能访问的 Chunk |
| **预判式加载** | 监听 \`MouseEnter\` 导航事件 | 在用户点击前预加载目标页面资源 |

### 构建配置优化 (Webpack/Vite)

* **JS 压缩**：启用 \`TerserPlugin\` 进行多进程压缩与混淆。
* **CSS 提取**：使用 \`mini-css-extract-plugin\` 提取 CSS。
* **库的按需引入**：
  * **Ant Design**：配置 \`babel-plugin-import\`，仅打包使用的组件。
  * **日期库**：将 \`moment.js\` (200KB+) 替换为 \`dayjs\` (2KB)。

### 优化效果指标对比

| 指标 | 优化前 | 优化后 | 提升幅度 |
| :--- | :--- | :--- | :--- |
| **FCP** (首次内容绘制) | 3.2s | **1.8s** | 📉 **43%** |
| **首屏 JS 体积** | - | **减少 45%** | 📉 |
| **页面懒加载** | 0 | **57个页面** | ✅ 全量覆盖 |`,
            },
            {
              id: 'q-6',
              question: '重构任务参与度如何？基于什么样的目的以及具体重构解耦的方案？',
              answer: `### 重构背景与目的

**原有痛点**：

| 问题 | 表现 |
| :--- | :--- |
| **硬编码泛滥** | 机票政策模块单文件超过 2000 行代码 |
| **重复代码多** | 类似表单逻辑复制粘贴，57个页面代码风格不统一 |
| **维护成本高** | 新增字段需要前端配合，改一处可能引发多处问题 |
| **技术债累积** | jQuery + 硬编码，难以扩展和维护 |

**重构目标**：
遗留系统（jQuery + 硬编码）→ 配置驱动开发（JSON Schema 动态表单）→ 统一架构 + 高内聚组件体系

### 具体重构解耦方案

**阶段一：小范围试点 - 单组件重构**
- 统一网络请求层 \`src/utils/request.js\`
- 统一工具函数 \`src/utils/util.js\`
- 公共组件（\`UploadModal\`、\`LogModal\`、\`SelectBank\`）

**阶段二：JSON Schema 动态表单引擎**
\`\`\`json
{
  "type": "object",
  "title": "特殊价政策配置",
  "properties": {
    "policyName": { "type": "string", "title": "政策名称" },
    "airline": {
      "type": "string",
      "title": "航空公司",
      "enum": ["CA", "MU", "CZ"],
      "enumNames": ["国航", "东航", "南航"]
    }
  }
}
\`\`\`

**阶段三：完整页面重构**
1. 目录结构调整：按业务模块划分
2. 分层架构：components/services/schemas/pages
3. TypeScript 改造：任意类型 → 严格类型定义

### 重构成果量化

| 指标 | 改造前 | 改造后 |
| :--- | :--- | :--- |
| **单模块代码量** | 2000+ 行/文件 | 500- 行/文件 |
| **新增字段周期** | 2-3天 | 配置即生效 |
| **组件复用率** | 20% | 80%+ |
| **FCP** | 3.2s | 1.8s |`,
            },
            {
              id: 'q-7',
              question: '讲讲制作这个GResume项目的初衷？怎么来考查调研和设计的？',
              answer: `**初衷：解决传统简历工具的痛点**

传统简历工具存在以下问题：
- **格式不统一**：Word/WPS 简历在不同设备上打开样式错乱
- **协作困难**：无法多人实时编辑、版本管理混乱
- **缺乏 ATS 优化**：不知道简历是否通过 ATS 系统筛选
- **离线可用性差**：没有网络就无法编辑

**调研过程：**

1. **用户调研**
   - 访谈了 20+ 求职者，了解他们在制作简历时的痛点
   - 发现 80% 的人曾在面试前临时修改简历，但没有版本管理

2. **竞品分析**
   - Notion：通用编辑器，简历模板弱
   - FlowCV/Resume.io：在线但无协作
   - Google Docs：可协作但不是为简历设计

3. **技术选型调研**
   - 确定离线优先 + 实时协作方向
   - CRDT vs OT 对比
   - Supabase 作为 BaaS 平台的优势

**设计理念：**
- **模块化编辑**：像搭积木一样组合简历模块
- **所见即所得**：实时预览最终效果
- **数据驱动**：所有内容结构化，便于后续分析优化`,
            },
            {
              id: 'q-8',
              question: '为什么要选择CRDT算法而不是OT算法，有什么区别吗？',
              answer: `**CRDT vs OT 核心区别**

| 维度 | CRDT | OT (Operational Transformation) |
|------|------|----------------------------------|
| 冲突处理 | 数学证明最终一致性 | 依赖中心服务器转换 |
| 离线支持 | 完全支持，离线合并 | 需要服务器参与，难离线 |
| 服务器依赖 | 只需要广播通道 | 需要中心服务器做转换 |
| 复杂度 | 库实现复杂，应用简单 | 应用需要处理复杂转换逻辑 |
| 扩展性 | 容易扩展到多用户 | 用户增多复杂度指数增长 |

**为什么选择 CRDT (Automerge)：**

1. **离线优先架构**
   - 用户可能在地铁、飞机等无网络环境编辑
   - CRDT 可以在本地先合并，网络恢复后自动同步

2. **无中心依赖**
   - Supabase 只需充当广播通道，不需要复杂转换逻辑
   - 即使 Supabase 暂时不可用，本地编辑不受影响

3. **多端同步简单**
   - 同一个文档可以在手机、平板、电脑同时编辑
   - 每个设备都是对等的，不用担心谁先谁后`,
            },
            {
              id: 'q-9',
              question: '核心功能中的冲突处理如何解决的？有哪些情况对应处理机制是怎样的？',
              answer: `**冲突来源分类**

在简历编辑中，冲突主要分为三类：

1. **同时编辑同一字段**
   - 用户 A 和用户 B 同时修改"工作经历"中的同一公司
   - **处理机制**：Last-Writer-Wins (LWW) + 语义合并
   - Automerge 会保留两个操作，合并时按时间戳或自定义规则选择

2. **结构冲突（增删改同时发生）**
   - 用户 A 删除了一个模块，用户 B 在编辑该模块
   - **处理机制**：
     - 删除优先于编辑（被删除的内容不显示）
     - 删除操作本身会被记录，可追溯

3. **光标位置冲突**
   - 多人协作时，光标位置可能因为他人插入内容而偏移
   - **处理机制**：光标位置用相对位置表示（如"第5行后"而非"第100个字符"）

**UI 层处理**
- **冲突提示**：红色标记有冲突的内容块
- **手动合并**：用户可以选择保留哪个版本
- **版本历史**：所有变更都有记录，可回滚`,
            },
            {
              id: 'q-10',
              question: '讲讲该简历平台项目的四层架构和三步模型',
              answer: `**四层架构**
\`\`\`
┌─────────────────────────────────────────────┐
│           表现层 (Presentation)              │
│   React 19 + Tailwind CSS + Radix UI       │
├─────────────────────────────────────────────┤
│           编辑层 (Editing)                  │
│         TipTap Editor + Extensions         │
├─────────────────────────────────────────────┤
│           协作层 (Collaboration)             │
│   Automerge CRDT + Cursor/Presence         │
├─────────────────────────────────────────────┤
│           持久层 (Persistence)               │
│      IndexedDB (本地) + Supabase (云端)     │
└─────────────────────────────────────────────┘
\`\`\`

**各层职责：**
1. **表现层**：页面路由、组件渲染、用户交互响应、主题/样式/动画
2. **编辑层**：TipTap 富文本编辑能力、简历特定扩展、内容验证和转换
3. **协作层**：CRDT 文档状态管理、光标同步和 presence、冲突检测和合并
4. **持久层**：IndexedDB 本地存储、Supabase 云端同步、变更历史和版本管理

**三步模型（用户操作流程）**
\`\`\`
Step 1: 创建/加载
   └── 用户打开简历 → 从 IndexedDB 加载本地版本
                        → 同时从 Supabase 拉取云端版本
                        → CRDT 合并两者

Step 2: 编辑/协作
   └── 用户编辑 → 本地 CRDT 变更
                  → 广播到协作通道
                  → 其他用户实时接收

Step 3: 保存/同步
   └── 自动同步 → IndexedDB 持久化
                  → Supabase 上传 patch
                  → 版本历史记录
\`\`\``,
            },
            {
              id: 'q-11',
              question: '性能极致优化体验是如何做到的？如何验证这个指标？',
              answer: `**性能优化策略**

1. **Vite 构建优化**
   \`\`\`typescript
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'react-vendor': ['react', 'react-dom'],
           'tiptap-editor': ['@tiptap/react', '@tiptap/starter-kit'],
           'automerge-core': ['@automerge/automerge-repo'],
         }
       }
     }
   }
   \`\`\`

2. **CSS 代码分割**
   - 每个路由独立打包 CSS
   - Tailwind CSS v4 按需生成

3. **Automerge 优化**
   - 增量同步：只传输变更部分（patch），不传整个文档
   - 二进制编码：使用 MessagePack 压缩数据

4. **React 优化**
   - React 19 的并发渲染
   - \`useTransition\` 处理非紧急更新
   - 组件级别懒加载

5. **协作层优化**
   - 光标发送节流：\`requestAnimationFrame\` + \`throttleMs\`
   - 批量处理：合并短时间内多次操作

**性能指标验证**

| 指标 | 目标值 | 验证方法 |
|------|--------|----------|
| 首次加载 (LCP) | < 2.5s | Lighthouse |
| 交互响应 (FID) | < 100ms | Chrome DevTools |
| 编辑延迟 | < 50ms | 手动测试 + performance.mark |
| 协作延迟 | < 200ms | 网络模拟 + 日志分析 |`,
            },
            {
              id: 'q-12',
              question: 'AI 智能集成是如何做到的？架构上如何设计？',
              answer: `**AI 集成架构**
\`\`\`
┌──────────────────────────────────────────────────┐
│                  React UI Layer                  │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│              AI Service Layer                     │
│   OpenAI API (GPT-4) + Prompt Engineering        │
└──────────────────────┬───────────────────────────┘
                       │ 流式响应 (SSE)
┌──────────────────────▼───────────────────────────┐
│           Supabase Edge Functions                 │
│   - 安全密钥管理                                   │
│   - 请求验证和限流                                 │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│                   OpenAI API                      │
└──────────────────────────────────────────────────┘
\`\`\`

**核心设计原则**

1. **1.安全调用**
   - API Key 存储在 Supabase Edge Functions 环境变量
   - 前端不暴露任何密钥

2. **2.流式输出 (Server-Sent Events)**
   - 使用 ReadableStream 实现流式返回
   - 前端逐步渲染 AI 生成内容

3. **3.Prompt 工程**
   - 针对简历场景优化的 System Prompt
   - Few-shot learning 提供示例
   - 安全过滤用户输入

4. **4.错误处理**
   - AI 超时：显示友好错误
   - 配额限制：提示用户稍后重试
   - 降级策略：本地关键词匹配作为备用`,
            },
            {
              id: 'q-13',
              question: 'Supabase 在项目中具体承担了哪些能力？有没有用到其他云服务？',
              answer: `**Supabase 承担的能力**

| 能力 | 具体使用 |
|------|---------|
| **数据库** | PostgreSQL 存储简历数据、用户信息、ATS 分析结果 |
| **实时订阅** | WebSocket 通道用于多人协作的光标同步和 presence |
| **文件存储** | 简历模板、图片等静态资源存储 |
| **Edge Functions** | AI 集成（GPT-4 调用）、敏感操作处理 |
| **认证** | JWT-based 用户认证，与本地 IndexedDB 解耦 |
| **版本历史** | \`resume_config_versions\` 表记录每次变更 |

**其他云服务**

| 服务 | 用途 | 原因 |
|------|------|------|
| **OpenAI API** | GPT-4 驱动 AI 功能 | 最成熟的 LLM 能力 |
| **Vercel** | CI/CD 部署 | 与 Supabase 生态集成好 |
| **GitHub** | 代码托管 | 团队协作 |

**架构优势**

Supabase 提供了开箱即用的"数据库+实时+认证+函数"组合，减少了：
- 服务数量（不用分别搭 Redis/Auth/Functions）
- 运维复杂度（Serverless 模式）
- 成本（按使用量付费）`,
            },
            {
              id: 'q-14',
              question: 'ATS系统分析这个功能如何实现？如何实现更改替换？',
              answer: `**ATS 分析功能实现**

ATS（Applicant Tracking System）分析主要包含三个维度：

1. **关键词分析**
   - 提取 Job Description 中的关键技能词
   - 对比简历中这些词的覆盖度
   - 计算关键词匹配率

2. **格式兼容性分析**
   - 检测是否使用表格（ATS 难以解析）
   - 检查是否有多余图片/特殊字符
   - 评估整体结构清晰度

3. **内容质量分析**
   - 量化工作经历的描述质量
   - 检查动词使用（如"负责"、"主导"等）
   - 评估量化成果（如"提升 30% 效率"）

**更改替换功能**

用户提供优化建议后，可以一键替换：

1. **精准替换**
   - 原文本高亮 → 用户确认 → 替换为 AI 建议

2. **批量替换**
   - 收集所有可优化点
   - 用户预览所有修改
   - 确认后一次性应用

3. **版本保留**
   - 每次 AI 修改都生成新版本
   - 用户可随时回滚到修改前`,
            },
            {
              id: 'q-15',
              question: '什么是安全流式调用？怎么基于 SupabaseEdgeFunctions 实现',
              answer: `**安全流式调用概念**

安全流式调用 = **安全传输** + **流式响应**

- **安全传输**：敏感信息（API Key）不暴露在客户端
- **流式响应**：AI 生成内容逐步返回，用户立即看到结果

**Supabase Edge Functions 实现**
\`\`\`typescript
serve(async (req) => {
  // 1. 安全验证：检查 Supabase 认证
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. 流式返回
  return new Response(
    new ReadableStream({
      async start(controller) {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [...],
          stream: true
        })

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
      }
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
})
\`\`\`

**安全要点总结**

| 安全措施 | 说明 |
|---------|------|
| API Key 不下放 | 只存在于 Edge Function 环境变量 |
| 认证校验 | 每个请求验证 Supabase JWT |
| 输入过滤 | 防止 prompt injection |
| 限流保护 | 防止滥用消耗配额 |`,
            },
            {
              id: 'q-16',
              question: 'React的fiber怎么理解？如何实现可中断？',
              answer: `### React Fiber 架构理解

**Fiber 的本质**：Fiber 是 React 16 引入的新的调和引擎，核心目标是**可中断的异步渲染**。

**为什么需要 Fiber**：
- 旧版 React 使用同步递归调和，渲染一颗大树可能需要几十甚至几百毫秒
- 在这期间，浏览器主线程被阻塞，无法响应用户交互
- Fiber 通过将渲染工作拆分成**可中断的小单元**，让浏览器可以在帧间抽空处理高优先级任务

### 可中断的实现原理

**1. 双缓存池 (Double Buffering)**
\`\`\`
current Fiber Tree (正在渲染)
        ↕ 切换
workInProgress Fiber Tree (内存中构建)
\`\`\`

**2. 优先级队列 ( lanes / expirationTime )**

| 优先级 | Lane | 场景 |
|--------|------|------|
| Sync | 同步 | 用户输入、点击 |
| InputContinuous | 连续输入 | 拖拽、滚动 |
| Default | 默认 | 数据获取 |
| Background | 后台 | 预渲染 |

**3. 工作单元拆分**
\`\`\`
reconcile (调和阶段)
├── beginWork()    → 向下遍历，构建 Fiber 节点
└── completeWork() → 向上归并，收集 effect 列表

commit (提交阶段) - 不可中断
├── DOM 变更
├── useLayoutEffects
└── 调度 useEffects
\`\`\`

**4. 中断与恢复机制**
\`\`\`typescript
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
\`\`\`

> **Fiber = 链表 + 双缓冲 + 优先级调度**`,
            },
            {
              id: 'q-17',
              question: '输入URL到渲染出页面全过程？',
              answer: `### 完整渲染流程

\`\`\`
用户输入 URL
    ↓
1. DNS 解析
    ↓
2. TCP 连接 (三次握手)
    ↓
3. TLS 握手 (HTTPS)
    ↓
4. HTTP 请求发送
    ↓
5. 服务器处理请求
    ↓
6. HTTP 响应
    ↓
7. 浏览器接收响应
    ↓
8-15. 浏览器渲染 pipeline
    ↓
16. JavaScript 框架渲染
\`\`\`

### 网络层

**1. DNS 解析**
\`\`\`
浏览器缓存 → 系统缓存 → 路由器缓存 → ISP DNS缓存 → 递归查询
\`\`\`

**2. TCP 三次握手**
\`\`\`
Client: SYN=1, seq=x          → Server
Server: SYN=1, ACK=1, seq=y    → Client
Client: ACK=1                  → Server
\`\`\`

**3. TLS 握手 (HTTPS)**
\`\`\`
Client: 发送支持的加密套件 + Random1
Server: 发送证书 + Random2 + 选择加密套件
Client: 验证证书 + 发送 PreMasterSecret
两者: 生成对称密钥
\`\`\`

### 浏览器渲染 Pipeline

**8. 构建 DOM 树** → **9. 构建 CSSOM 树** → **10. Render Tree** → **11. Layout** → **12. Paint** → **13. Composite**

### 性能优化点

| 优化手段 | 针对阶段 |
|---------|---------|
| DNS 预解析 \`<link rel="dns-prefetch">\` | DNS |
| HTTP/2 多路复用 | TCP + TLS |
| CDN 加速 | 网络传输 |
| 代码分割、懒加载 | JS 执行 |`,
            },
            {
              id: 'q-18',
              question: '平时怎么学平时学习AI和技术前沿知识？是否了解技术开发业内最近比较前沿的AI突破？',
              answer: `### 核心学习渠道

| 渠道 | 内容类型 | 频率 |
|------|----------|------|
| **团队 AI 技术分享会** | 内部踩坑、方案设计、最佳实践 | 每周一次 |
| **英文一手官方文档** | Vite, React, Supabase, OpenAI 官方文档 | 按需深入 |
| **GitHub Trending / HN** | 开源项目、技术趋势 | 每天 |

### 我关注的 AI 突破

**1. 大语言模型 (LLM)**
| 模型 | 突破点 |
|------|--------|
| **GPT-4o** | 原生多模态，语音/视频/文本统一处理 |
| **Claude 3.5** | 长上下文 (200K)，代码能力显著提升 |
| **Gemini 1.5** | 百万 token 上下文，音视频理解 |
| **Llama 3** | 开源最强基座，支持多模态 |

**2. AI Agent (智能体)**
| 突破 | 说明 |
|------|------|
| **Claude Agent** | 工具调用 + 代码执行 + 浏览器控制 |
| **MCP (Model Context Protocol)** | 标准化 AI 与外部工具交互 |
| **多 Agent 协作** | LangGraph 等框架实现复杂工作流 |

**3. RAG**
| 方向 | 突破 |
|------|------|
| 向量数据库成熟 | Pinecone, Milvus |

### 学习原则

| 原则 | 说明 |
|------|------|
| **官方文档优先** | 二手解读可能有误，一手文档最准确 |
| **实践出真知** | 看文档 + 动手写代码，远胜只看不动 |
| **按需学习** | 不追求"学过"，追求"用过" |`,
            },
            {
              id: 'q-19',
              question: '对AI发展3-5年的一个预测？',
              answer: `### 短期预测 (1-2年)

**1. Agent 从 demo 到实用**
\`\`\`
当前：单Agent执行简单任务
→ 2年内：多Agent协作处理复杂工作流
\`\`\`

**2. 上下文窗口持续膨胀**
\`\`\`
当前：100K-1M tokens
→ 2年内：可能达到 10M tokens
\`\`\`

**3. AI Native 开发范式成熟**
\`\`\`
Claude Code, Copilot Workspace → 替代初级开发
AI 审核 Code Review
AI 生成 → AI 部署 → AI 监控
\`\`\`

### 中期预测 (3-5年)

**1. 多模态 Agent 成为入口**
\`\`\`
语音/视频/文本 → 统一的 AI Agent
→ 取代 APP 成为主要交互方式
\`\`\`

**2. AI 与 OS 深度集成**
\`\`\`
Apple Intelligence 整合到 iOS
Microsoft Copilot 整合到 Windows
→ AI 成为系统级能力，所有应用天然具备 AI 能力
\`\`\`

**3. 端侧 AI 爆发**
\`\`\`
手机、汽车、IoT 设备本地运行 70B 模型
边缘计算 + 云端协同
离线 AI 成为标配
\`\`\``,
            },
            {
              id: 'q-20',
              question: 'AI快速发展如何保持个人优势？',
              answer: `### 核心策略

**1. 拥抱 AI，成为"会用 AI 的人"而不是"被 AI 替代的人"**
\`\`\`
不被替代 = 做 AI 做不了的事
         = 高创意 + 高决策 + 高情感连接
         = 架构设计 + 产品思维 + 沟通协作
\`\`\`

### 具体方向

#### 深化 AI 工程能力

| 方向 | 说明 | 价值 |
|------|------|------|
| **AI 集成开发** | 掌握 LLM API、RAG、Agent 框架 | 成为团队 AI 专家 |
| **模型微调** | Fine-tuning, LoRA, RLHF | 解决特定业务问题 |
| **推理优化** | 量化、加速、部署 | 工程落地能力 |

#### 保持技术深度

**保持深度的领域**：
- 系统设计 (分布式、高并发、可扩展)
- 性能优化 (前端、后端、资源利用)
- 安全合规 (数据隐私、安全架构)
- 架构决策 (技术选型、技术债管理)

#### 发展 AI 难以复制的能力

| 能力 | 说明 |
|------|------|
| **产品思维** | 发现问题、定义问题优先级 |
| **系统思维** | 理解复杂系统，做长期技术决策 |
| **沟通协作** | 跨团队对齐、管理利益相关者 |

### 我的实践

| 实践 | 说明 |
|------|------|
| **GResume 项目** | AI ATS 分析、简历优化，AI 工程化落地 |
| **OpenSpec 规范** | AI 辅助开发工作流，提效 30% |
| **持续关注前沿** | 每周跟进 arXiv / GitHub Trending |

### 核心观点

> **AI 会取代"执行者"，但不会取代"决策者"和"创造者"**`,
            },
            {
              id: 'q-21',
              question: 'HTTPS传输过程中对称加密和非对称加密的作用',
              answer: `### HTTPS 加密体系概述

HTTPS = HTTP + TLS/SSL，其核心目标是：在不安全的网络上建立安全通信。

### 非对称加密 (Asymmetric Encryption) - 密钥交换阶段

**作用**：在握手阶段安全地协商出对称密钥

| 特性 | 说明 |
|------|------|
| **算法** | RSA、ECDHE |
| **密钥对** | 公钥 (公开) + 私钥 (保密) |
| **特点** | 加密/解密使用不同密钥 |
| **性能** | 计算慢，适合短数据 |

**工作流程**：
\`\`\`
Client                              Server
  │                                    │
  │  ─── 发送支持的加密套件 + Random1 ──→  │
  │  ←── 发送证书 + Random2 + 选择加密套件 ──  │
  │  ─── 验证证书 + 发送 PreMasterSecret ─→  │
  │      (用公钥加密，只有服务器能用私钥解密)    │
  └── 双方用 Random1 + Random2 + PMS 生成对称密钥 ──┘
\`\`\`

### 对称加密 (Symmetric Encryption) - 数据传输阶段

**作用**：实际业务数据的加密传输

| 特性 | 说明 |
|------|------|
| **算法** | AES-128-GCM、AES-256-GCM、ChaCha20 |
| **密钥** | 双方共享的同一个密钥 |
| **特点** | 加密/解密使用相同密钥 |
| **性能** | 计算快，适合大量数据 |

### 为什么不全程使用非对称加密？

| 维度 | 非对称加密 | 对称加密 |
|------|-----------|----------|
| **计算速度** | 慢 100-1000 倍 | 快 |
| **适用数据量** | 短数据 (密钥交换) | 大量数据 (业务传输) |

**结论**：
- **非对称加密** = 解决"如何在不安全通道中安全传递密钥"
- **对称加密** = 利用已安全协商的密钥高效传输数据
- 两者结合 = 安全 + 高效`,
            },
            {
              id: 'q-22',
              question: '浏览器缓存机制',
              answer: `### 缓存分类总览

浏览器缓存分为两大类：**强缓存**和**协商缓存**，命中顺序依次递进。

\`\`\`
请求资源
    ↓
强缓存 (本地) → 命中 → 直接使用缓存 → 返回 200 (from cache)
    ↓ 未命中
协商缓存 (服务端) → 命中 → 返回 304 (Not Modified)
    ↓ 未命中
返回新资源 → 更新缓存 → 返回 200
\`\`\`

### 1. 强缓存 (Strong Cache)

**特点**：不发请求到服务器，直接使用本地缓存

#### Cache-Control (优先级高)

| 指令 | 作用 |
|------|------|
| \`max-age=3600\` | 资源在 3600 秒后过期 |
| \`no-cache\` | 跳过强缓存，但进行协商缓存 |
| \`no-store\` | 完全不使用缓存 |
| \`private\` | 只能在浏览器缓存，不能被 CDN 缓存 |
| \`public\` | 可以被任何节点缓存 |

### 2. 协商缓存 (Conditional Cache)

**特点**：发请求到服务器，由服务器判断是否使用缓存

#### ETag / If-None-Match (优先级高)

\`\`\`
响应头: ETag: "33a64df551425fcc55e4d42a148795d9"
请求头: If-None-Match: "33a64df551425fcc55e4d42a148795d9"
\`\`\`

- 服务器对比资源的内容指纹 (Hash)
- 精确到内容级别

### 3. 缓存实践策略

| 资源类型 | 策略 | 原因 |
|---------|------|------|
| **HTML** | \`Cache-Control: no-cache\` | 必须及时获取最新版本 |
| **静态资源 (CSS/JS/图片)** | \`max-age=31536000\` + 文件指纹 | 长期缓存 + 变更后自动更新 |
| **API 接口** | \`Cache-Control: no-store\` | 数据敏感，不缓存 |`,
            },
            {
              id: 'q-23',
              question: 'Vue3核心语法总结 (从React迁移视角)',
              answer: `### React → Vue3 对照表

| 概念 | React | Vue 3 |
|------|-------|-------|
| **状态管理** | \`useState\` | \`ref\` / \`reactive\` |
| **副作用** | \`useEffect\` | \`watchEffect\` / \`watch\` |
| **组件通信** | Props + Context | Props + Emits + Provide/Inject |
| **模板语法** | JSX | SFC (\`<template>\`) + 组合式 API |
| **响应式原理** | 不可变 + 触发更新 | 响应式代理 (Proxy) |
| **生命周期** | useEffect 清理 | \`onMounted\` / \`onUnmounted\` |

### 1. 响应式系统

**React 方式 (不可变更新)**：
\`\`\`jsx
const [count, setCount] = useState(0)
setCount(count + 1)
\`\`\`

**Vue 3 方式 (响应式代理)**：
\`\`\`typescript
const count = ref(0)
count.value++  // .value 访问

const state = reactive({ count: 0 })
state.count++  // 直接修改，Vue 自动追踪
\`\`\`

### 2. 组合式 API (Composition API)

\`\`\`typescript
// Vue 3: composable 函数
function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count: readonly(count), increment }
}
\`\`\`

### 3. 生命周期对比

| React | Vue 3 | 时机 |
|-------|-------|------|
| \`componentDidMount\` | \`onMounted\` | 挂载后 |
| \`componentWillUnmount\` | \`onUnmounted\` | 卸载前 |
| \`useEffect(() => {}, [])\` | \`onMounted\` | 仅首次 |

### 4. Vue 3 新特性 (React 没有的)

| 特性 | 说明 |
|------|------|
| **Teleport** | 传送组件到 DOM 任意位置 (模态框) |
| **Suspense** | 异步组件加载状态 |
| **Fragment** | 模板多根节点 |
| **setup script** | \`<script setup>\` 语法糖 |
| **provide/inject** | 跨层级数据传递 |`,
            },
            {
              id: 'q-24',
              question: '桌面端、Web端、小程序、App各端开发/部署全流程上的区别',
              answer: `### 各端技术栈概览

| 平台 | 技术栈 | 打包/运行环境 | 部署渠道 |
|------|--------|---------------|----------|
| **桌面端** | Electron / Tauri | .exe / .dmg / .AppImage | 官网 / 应用商店 |
| **Web 端** | React / Vue / Next.js | H5 (浏览器) | CDN / 云服务器 |
| **小程序** | 原生 / Taro / uni-app | 微信/支付宝/抖音 | 平台审核上架 |
| **App** | React Native / Flutter | .apk / .ipa | 应用商店 |

### 部署全流程对比

#### Web 部署流程
\`\`\`
开发 → 构建 (vite build) → 上传到 CDN/OSS → 配置域名/SSL → 完成
部署时间: 5-30 分钟
回滚: 重新上传旧版本静态资源
\`\`\`

#### Electron 部署流程
\`\`\`
开发 → 构建 (electron-builder) → 生成安装包 → 分发到官网/App Store
部署时间: 30-60 分钟 (含签名)
回滚: 旧版安装包
\`\`\`

#### 小程序部署流程
\`\`\`
开发 → 提交审核 → 平台审核 (1-7天) → 发布上线
审核内容: 功能、UI、类目资质
灰度发布: 可先让 1%/5%/10% 用户使用
\`\`\`

#### App 部署流程
\`\`\`
开发 → 编译打包 → 提交审核 → App Store/应用市场审核 → 发布
审核时间: App Store 1-3 天, Google Play 1-7 天
热更新: CodePush (React Native) / 强制发版
\`\`\`

### 各端适用场景

| 场景 | 推荐 |
|------|------|
| **快速验证 / ToB 管理后台** | Web (React/Vue) |
| **工具软件 / 需要本地能力** | Electron / Tauri |
| **轻量级服务 / 社交传播** | 小程序 |
| **高性能 / 需要原生体验** | React Native / Flutter |`,
            },
            {
              id: 'q-25',
              question: 'AI幻觉是什么？怎么检测？',
              answer: `### 什么是 AI 幻觉 (Hallucination)

**定义**：LLM 生成的内容听起来合理、有条理，但实际上是**错误的、虚构的或与事实不符**的。

**幻觉类型**：
1. **事实性幻觉**：模型生成的内容包含错误的事实或统计数字
2. **归因性幻觉**：模型引用了不存在的来源、论文、网址
3. **逻辑性幻觉**：推理过程看起来合理，但结论是错的

### 幻觉产生的原因

| 原因 | 说明 |
|------|------|
| **知识截止** | 训练数据有截止日期，无法感知最新信息 |
| **训练数据偏差** | 数据分布不均衡，某些领域知识不足 |
| **概率生成** | 本质是预测下一个 token，无法保证事实性 |
| **长上下文** | 上下文过长时，远距离信息被稀释 |

### 幻觉检测方法

#### 1. 交叉验证 (Cross-Reference)
\`\`\`python
# 同一个问题，多个模型分别回答
# 对比答案一致性
answers = [call_model(prompt, temperature=0.7) for _ in range(3)]
consistency = calculate_similarity(answers)
\`\`\`

#### 2. RAG + 事实核查 (Fact-Checking)
\`\`\`
用户问题 → RAG 检索相关文档 → LLM 生成答案 + 附带引用
    ↓
用检索到的文档验证 LLM 答案的事实性
    ↓
检测到不一致 → 标记为"不确定"
\`\`\`

#### 3. 结构化输出 + Schema 约束
使用结构化输出减少自由发挥空间，降低幻觉概率。

### 实用工程实践

| 策略 | 实施方法 |
|------|----------|
| **不确定时坦白** | Prompt 要求"不确定时说不知道" |
| **引用 + 溯源** | RAG 强制要求答案附带文档引用 |
| **拒答机制** | 置信度低于阈值时返回"无法回答" |
| **人机协同** | 关键场景人工复核 |`,
            },
            {
              id: 'q-27',
              question: 'JWT登录功能怎样实现的？调研过业界登录功能的实现方式吗？',
              answer: `### 业界登录方案对比

| 方案 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **Session-Cookie** | 服务端存储 Session，浏览器存 Cookie | 简单可控，服务端可即时登出 | 占内存，分布式麻烦 | 传统 Web 应用 |
| **JWT (Token)** | 无状态令牌，用户信息编码进 Token | 无服务端存储，天然分布式 | 不能主动失效，Token 泄漏风险 | 前后端分离、移动端 |
| **OAuth 2.0** | 第三方授权，发放 Access Token | 支持第三方登录，协议成熟 | 实现复杂，需要考虑安全 | 开放平台、社交登录 |
| **SSO (单点登录)** | 中央认证，多系统共享登录态 | 一次登录，多系统访问 | 实现成本高 | 企业内部多系统 |

### JWT 实现原理

**Token 结构 (三部分)**：
\`\`\`
Header.Payload.Signature
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.XcrE
\`\`\`

- **Header**: \`{"alg": "HS256", "typ": "JWT"}\` → Base64
- **Payload**: \`{"sub": "1234567890", "name": "John", "exp": 1699999999}\` → Base64
- **Signature**: \`HMAC-SHA256(Header.Payload, secret)\`

**核心字段**：
| 字段 | 作用 |
|------|------|
| \`sub\` | 用户唯一标识 |
| \`exp\` | 过期时间 |
| \`iat\` | 签发时间 |
| \`roles\` | 用户权限 |

### GResume 项目中的 JWT 实现

**登录流程**：
\`\`\`
1. 用户输入邮箱/密码
2. Supabase 验证 credentials
3. Supabase 返回 JWT (access_token + refresh_token)
4. 前端存储 Token:
   - access_token → 存 memory (变量)，用于 API 请求
   - refresh_token → 存 httpOnly Cookie 或 localStorage，配合自动刷新
\`\`\`

**Supabase Auth 实现**：
\`\`\`typescript
// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// 获取当前 session
const { data: { session } } = await supabase.auth.getSession()

// 监听 auth 状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // 更新全局状态
    setUser(session.user)
  }
})
\`\`\`

**Token 自动刷新机制**：
\`\`\`
请求拦截器:
  if (Token 过期 && 有 refresh_token) {
    调用 refresh API 获取新 access_token
    重试原请求
  }
\`\`\`

### 安全性考虑

| 风险 | 缓解方案 |
|------|----------|
| Token 泄漏 | httpOnly Cookie + HTTPS |
| XSS 攻击 | CSP + 输入校验 |
| CSRF | SameSite Cookie + CSRF Token |
| Token 过期太长 | 短 access_token (1h) + 长期 refresh_token |
| Refresh Token 泄漏 | 一次性使用 + 异常检测 |`,
            },
            {
              id: 'q-28',
              question: 'GResume项目采用的哪种设计模式？',
              answer: `### GResume 架构设计模式解析

**核心设计模式：分层架构 + 组合式架构**

\`\`\`
┌─────────────────────────────────────────────┐
│           表现层 (Presentation Layer)         │
│         React 19 + Tailwind CSS              │
├─────────────────────────────────────────────┤
│           编辑层 (Editing Layer)             │
│         TipTap Editor + Extensions           │
├─────────────────────────────────────────────┤
│           协作层 (Collaboration Layer)       │
│       Automerge CRDT + Presence             │
├─────────────────────────────────────────────┤
│           持久层 (Persistence Layer)         │
│      IndexedDB (Dexie) + Supabase           │
└─────────────────────────────────────────────┘
\`\`\`

### 1. 分层架构 (Layered Architecture)

**各层职责明确，互不依赖**：
- **表现层**：只负责 UI 渲染，不包含业务逻辑
- **编辑层**：专注富文本编辑能力，与 React 解耦
- **协作层**：处理 CRDT 同步，抽象为独立模块
- **持久层**：统一的数据访问抽象，屏蔽存储细节

**好处**：修改一层不影响其他层，测试时可 Mock 其他层

### 2. 编辑器模式 (Custom Hooks / Composable)

**所有编辑器逻辑封装为 Hook**：
\`\`\`typescript
// useResumeEditor 封装所有编辑逻辑
function useResumeEditor() {
  const [doc, setDoc] = useState(initialDoc)
  const [syncStatus, setSyncStatus] = useState('idle')

  const insertBlock = (type: BlockType, content: string) => { ... }
  const updateBlock = (id: string, content: string) => { ... }
  const deleteBlock = (id: string) => { ... }
  const mergeFromRemote = (patch: Patch) => { ... }

  return { doc, syncStatus, insertBlock, updateBlock, deleteBlock }
}
\`\`\`

### 3. 仓库模式 (Repository Pattern)

**数据访问统一抽象**：
\`\`\`typescript
// ResumeRepository 统一数据访问
class ResumeRepository {
  constructor(
    private localStore: IndexedDBAdapter,
    private remoteStore: SupabaseAdapter
  ) {}

  async save(doc: Doc): Promise<void> {
    await this.localStore.save(doc)
    await this.remoteStore.sync(doc)
  }

  async load(id: string): Promise<Doc> {
    const local = await this.localStore.find(id)
    const remote = await this.remoteStore.find(id)
    return this.merge(local, remote)  // CRDT 自动合并
  }
}
\`\`\`

### 4. 观察者模式 (Observer Pattern)

**协作状态同步**：
\`\`\`typescript
// 编辑器状态 -> 广播 -> 所有在线客户端
editor.on('update', (change) => {
  broadcastToPeers(change)  // WebSocket 广播
})

supabase.channel('presence')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()  // 同步最新状态
    updateCollaborators(state)
  })
\`\`\`

### 5. CRDT 模式 (Conflict-Free Replicated Data Type)

**Automerge 的核心思想**：
- 每个客户端的操作 → 记录为操作日志 (oplog)
- 合并时：所有客户端的操作日志合并
- 冲突处理：Last-Writer-Wins + 语义合并
- 最终一致性：所有客户端达到相同状态

\`\`\`typescript
const [doc, patch] = Automerge.change(doc, (d) => {
  d.resume.profile.name = "张三"  // 本地操作
})

// 同步时：合并远程 patch
const mergedDoc = Automerge.applyPatches(localDoc, remotePatches)
\`\`\`

### 6. 模块化设计 (Module Pattern)

**按功能/领域划分独立模块**：
\`\`\`
src/
├── modules/
│   ├── resume/          # 简历核心
│   │   ├── hooks/      # useResumeEditor, useBlock etc.
│   │   ├── components/ # BlockEditor, Toolbar etc.
│   │   └── types/      # ResumeBlock, Profile etc.
│   ├── ats/            # ATS 分析模块
│   │   ├── hooks/      # useATSAnalysis
│   │   └── components/ # ScorePanel, SuggestionList
│   └── collaboration/  # 协作模块
│       ├── hooks/      # usePresence, useSync
│       └── adapters/   # SupabaseAdapter
\`\`\`

### 7. 工程化设计模式

| 模式 | 应用 |
|------|------|
| **Singleton** | Supabase 客户端单例 |
| **Factory** | Block 工厂 (TextBlockFactory, ImageBlockFactory) |
| **Adapter** | IndexedDB/Dexie 适配器，屏蔽存储差异 |
| **Strategy** | 不同 AI 模型 (GPT-4/Claude) 切换 |

### 面试加分点

> **设计模式的权衡**：
> - 不用 Redux，因为 CRDT 已经解决了状态同步问题
> - 不用 SSR，因为离线优先 + 实时协作是关键
> - 选择 Supabase 而不是自建服务端，因为 Supabase 提供开箱即用的实时 + Auth`,
            },
            {
              id: 'q-26',
              question: '从0设计一个RAG系统，知识库有5K+文档，需要支持多轮对话该如何来实现？',
              answer: `### 系统架构总览

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│  用户层 → 索引层 → 检索层 → 生成层 (LLM)
└──────────────────────────────────────────────────────────────────┘
\`\`\`

### 一、知识库构建 (Indexing Pipeline)

#### 1. 文档解析
支持多格式解析：PDF (PyMuPDF)、DOCX (python-docx)、Markdown、Text

#### 2. 文档分块 (Chunking)
| 策略 | chunk_size | overlap | 适用场景 |
|------|-----------|---------|----------|
| **固定长度** | 500 tokens | 50 tokens | 通用场景 |
| **语义分块** | 可变 | 可变 | 按段落/句子 |
| **层级分块** | 嵌套 | - | 长文档 |

#### 3. 向量化 (Embedding)
\`\`\`python
response = openai.Embedding.create(
    model='text-embedding-3-small',
    input=chunks
)
\`\`\`

#### 4. 向量数据库存储
Milvus / Pinecone / Chroma / Qdrant

### 二、多轮对话设计 (Multi-Turn RAG)

#### 1. Conversation History 管理
\`\`\`python
def get_context_window(self, max_turns=10):
    # 只保留最近 N 轮，避免上下文膨胀
    return self.history[-max_turns * 2:]
\`\`\`

#### 2. Query 改写 (Query Rewriting)
将多轮对话中的指代消解 + 意图补全
例: "它的原理是什么？" → "React Fiber 的工作原理是什么？"

#### 3. Hybrid Search (混合检索)
\`\`\`python
# 向量检索 + 关键词检索结合
vector_results = collection.search('embedding', query_vector, top_k)
keyword_results = bm25_search(query, top_k)
# RRF 融合 (Reciprocal Rank Fusion)
fused_results = rrf_fusion([vector_results, keyword_results], k=60)
\`\`\`

### 三、答案生成 (Generation)

\`\`\`python
RAG_PROMPT_TEMPLATE = """
你是一个知识库问答助手。请根据以下参考文档回答用户问题。

参考文档:
{context_docs}

对话历史:
{history}

当前问题: {question}

要求:
1. 只根据参考文档回答，不要编造信息
2. 如果参考文档不包含答案，请明确说"我不知道"
3. 在回答中标注参考来源 (使用 [来源] 格式)
"""
\`\`\`

### 四、5K 文档性能优化

| 优化方向 | 具体方案 |
|---------|----------|
| **索引优化** | HNSW 索引 (平衡精度和速度) |
| **分区 (Partitioning)** | 按部门/主题分 collection，减少检索范围 |
| **缓存** | 热门 Query 结果缓存 (Redis) |
| **批量** | 批量向量化，减少 API 调用次数 |

### 五、技术选型总结

| 组件 | 推荐方案 |
|------|----------|
| **Embedding** | OpenAI text-embedding-3-small / BGE-M3 (本地) |
| **向量数据库** | Milvus / Qdrant (生产) / Chroma (原型) |
| **LLM** | GPT-4-turbo / Claude 3.5 / DeepSeek |
| **框架** | LangChain / LlamaIndex / 自研 |`,
            },
          ],
        },
      ],
    },
  ],
};
