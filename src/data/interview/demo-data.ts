import { Company } from '@/types/interview';
import { MEITUAN_LOCAL_COMMERCE } from './meituan-local-commerce';

export const DEMO_DATA: Company[] = [
  MEITUAN_LOCAL_COMMERCE,
  {
    id: 'company-meituan',
    name: '美团',
    color: 'orange',
    departments: [
      {
        id: 'dept-saas',
        name: 'Saas',
        sessions: [
          {
            id: 'session-yimian',
            name: '一面',
            date: '2026-04-02',
            status: 'waiting',
            questions: [
              {
                id: 'q-1',
                question: '讲讲AI Native思维是什么？如何运用到实际的开发中？',
                answer: `## AI Native 思维

### 核心定义
AI Native 思维是一种以人工智能为中心的产品设计和开发理念，强调将 AI 能力作为产品的核心组成部分，而不是简单的功能叠加。

### 关键特征
1. **从辅助到主导**：AI 不再是辅助工具，而是产品核心
2. **自然交互**：用自然语言代替传统的 UI 操作
3. **智能涌现**：让 AI 能够处理复杂任务，而非固定流程
4. **持续学习**：系统能够从用户交互中不断学习和改进

### 在实际开发中的运用

#### 1. 需求分析阶段
- 先思考"AI 能做什么"，而非"我要做什么功能"
- 例如：与其设计一个复杂的筛选界面，不如让用户直接用自然语言描述需求

#### 2. 架构设计阶段
- 将 AI 能力作为第一公民
- 设计 AI Flow：输入 → 理解 → 推理 → 输出 → 反馈
- 考虑 AI 的可观测性：prompt、token消耗、响应时间

#### 3. 开发实践
- **Prompt Engineering**：精心设计 prompt，引导 AI 输出高质量结果
- **RAG 检索增强**：结合向量检索，让 AI 基于私有知识库回答
- **Agent 模式**：让 AI 能够调用工具完成复杂任务
- **流式响应**：实时展示 AI 生成内容，提升体验

#### 4. 质量保障
- 建立 AI 评测体系：准确性、相关性、安全性
- 人工审核 + AI 自动化结合
- 持续监控幻觉率、用户满意度`
              },
              {
                id: 'q-2',
                question: '说说SSD你了解有多少？',
                answer: `## SSD (Self-Service Development)

### 概念定义
SSD 是滴滴内部的自助开发平台，旨在让开发者在无需运维介入的情况下自助完成应用开发、部署、运维的全流程。

### 核心能力

#### 1. 标准化脚手架
- 一键创建项目模板
- 内置最佳实践（目录结构、CI/CD、监控）
- 统一的技术栈配置

#### 2. 智能代码生成
- 基于 OpenSpec 规范生成 API 代码
- 自动生成 TypeScript 类型定义
- CRUD 代码模板生成

#### 3. 自动化部署
- 一键部署到测试/生产环境
- 自动配置负载均衡、容器编排
- 滚动更新、蓝绿部署策略

#### 4. 可观测性
- 自动接入日志、监控、告警
- 请求链路追踪
- 性能指标可视化

### 在滴滴的实践
- 机票政策模块通过 SSD 实现了配置驱动开发
- 将业务逻辑抽象为 JSON Schema，减少 60% 的重复代码
- 配合 Claude Code Agent，实现需求到代码的半自动化生成`
              },
              {
                id: 'q-3',
                question: 'openSpec的结构是怎样？你说如何设计的',
                answer: `## OpenSpec 规范

### 设计背景
滴滴内部存在大量 AI 代码生成需求，但 AI 生成的代码质量参差不齐。OpenSpec 应运而生，旨在通过结构化的规范文档，引导 AI 生成高质量、可维护的代码。

### 核心结构

\`\`\`json
{
  "meta": {
    "version": "1.0.0",
    "module": "airline-policy",
    "description": "机票政策模块规范"
  },
  "components": {
    "schemas": {
      "PolicyRule": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "ruleType": { "type": "enum", "values": ["discount", "refund", "upgrade"] },
          "conditions": { "type": "array", "items": { "$ref": "#/components/schemas/Condition" } }
        }
      }
    },
    "apis": {
      "createPolicy": {
        "method": "POST",
        "path": "/api/policy",
        "request": { "$ref": "#/components/schemas/PolicyRule" },
        "response": { "$ref": "#/components/schemas/PolicyRule" }
      }
    }
  },
  "prompts": {
    "generate": "你是一个滴滴前端专家，请根据以下规范生成 React 组件...",
    "validate": "请检查以下代码是否符合规范..."
  }
}
\`\`\`

### 设计原则

1. **声明式**：用 JSON Schema 定义数据结构，清晰无歧义
2. **可扩展**：支持自定义组件和扩展点
3. **自描述**：包含 AI 理解所需的元信息和 Prompt
4. **版本化**：支持多版本规范，便于升级迁移

### 实际应用效果
- 代码生成准确率从 60% 提升到 90%
- 新人 onboarding 时间缩短 50%
- AI 生成的代码可直接提交，无需大量修改`
              },
              {
                id: 'q-4',
                question: '什么是流式调用？',
                answer: `## 流式调用 (Streaming)

### 定义
流式调用是指服务器端在返回完整响应之前，实时推送部分数据给客户端，客户端无需等待全部响应完成即可开始处理。

### 与传统调用的区别

| 特性 | 传统调用 | 流式调用 |
|------|----------|----------|
| 响应方式 | 一次性返回 | 逐步返回 |
| 等待时间 | 长 | 短 |
| 带宽占用 | 高 | 低 |
| 实现复杂度 | 低 | 高 |

### 技术实现

#### 1. Server-Sent Events (SSE)
- 单向通信，服务器推送数据到客户端
- 简单易用，适合实时更新场景
- 自动重连机制

#### 2. WebSocket
- 双向通信
- 支持二进制数据
- 适合实时聊天、游戏等场景

#### 3. HTTP Chunked Transfer
- 分块传输编码
- 无需额外协议

### 应用场景
- AI 对话：逐字展示生成内容
- 实时日志：推送最新日志
- 股票行情：实时价格更新
- 进度报告：长时间任务的进度反馈

### 在滴滴的实践
- AI 助手响应使用流式输出，用户体验提升 40%
- 长列表加载使用虚拟滚动 + 渐进加载
- 实时数据看板使用 SSE 推送`
              },
              {
                id: 'q-5',
                question: 'AI 幻觉是什么？有什么好的解决方案？',
                answer: `## AI 幻觉

### 什么是 AI 幻觉
AI 幻觉是指大语言模型生成的内容看似合理，但实际上是不准确、不真实或虚构的。模型会自信地编造事实、引用不存在的文献、或产生逻辑连贯但错误百出的推理。

### 幻觉类型

1. **事实性幻觉**
   - 生成不存在的事实
   - 引用虚假的文献、数据

2. **逻辑性幻觉**
   - 推理过程中的错误
   - 自相矛盾的结论

3. **领域性幻觉**
   - 专业领域知识错误
   - 过时或错误的技术信息

### 解决方案

#### 1. RAG (检索增强生成)
- 将知识库向量化存储
- 检索相关内容作为上下文
- 让 AI 基于真实资料生成

#### 2. Prompt Engineering
- 明确指定输出格式
- 要求模型"不确定时说不知道"
- 添加约束条件

#### 3. 多模型校验
- 使用多个模型交叉验证
- 投票机制决定最终输出
- 高风险场景人工复核

#### 4. 思维链 (Chain of Thought)
- 让模型展示推理过程
- 便于发现逻辑错误
- 提升输出的可解释性

#### 5. 后处理验证
- 使用规则引擎校验输出
- 事实性内容自动查询验证
- 敏感词过滤

#### 6. 持续学习
- 用户反馈纠正模型
- 定期更新知识库
- 监控幻觉率指标

### 滴滴的实践
- 建立内部知识库 RAG 系统
- 重要代码生成需人工审核
- 监控 AI 输出质量，幻觉率从 15% 降至 3%
- 建立 AI 评测平台，定期评估各模型表现`
              },
              {
                id: 'q-6',
                question: '高内聚业务组件体系如何设计？评判标准是什么？',
                answer: `## 高内聚业务组件体系设计

### 一、设计思路

高内聚业务组件体系的核心是将相关功能组织在一起，让模块内部元素彼此紧密关联，而模块间保持低耦合。

#### 1. 分层目录结构设计
- \`src/pages/\` - 按业务模块划分页面，如 \`travel_config\`、\`plane_policy\`
- \`src/pages/{模块}/page/\` - 业务子模块
- \`src/components/\` - 公共组件层，如 \`UploadModal\`、\`LogModal\`
- \`src/services/\` - API 服务层，按业务领域划分

#### 2. 组件分层策略
- **基础组件**：Ant Design 原子组件
- **业务组件**：封装特定业务逻辑的组件
- **页面组件**：完整的业务页面，整合业务组件和服务

#### 3. 路由级别的分割
- 使用 \`@loadable/component\` 实现按需加载
- 57个页面的懒加载，实现首屏性能优化

### 二、评判标准

1. **单一职责原则**：每个组件、服务只负责一个明确的业务功能
2. **内聚性度量**：相关功能在同一目录下组织
3. **可维护性**：新增需求时能快速定位到对应模块
4. **可测试性**：业务逻辑可通过 service 层独立测试
5. **依赖清晰度**：业务组件间通过 props 或服务层通信
6. **接口稳定性**：对外接口保持向后兼容`
              },
              {
                id: 'q-7',
                question: '消除冗余依赖的方法有哪些？',
                answer: `## 消除冗余依赖的方法

### 一、依赖分析与管理

#### 1. 依赖审计
- 定期使用 \`npm audit\` 或 \`depcheck\` 分析项目依赖
- Vite 依赖 tree-shaking 能力减少冗余

#### 2. 版本锁定
- 关键依赖锁定版本（如 @didi/dajax 必须为 3.0.1）
- 使用 package-lock.json 锁定传递依赖

### 二、代码分割策略

#### 1. 路由级分割
- 使用 \`loadable()\` 按需加载57个业务页面

#### 2. 组件级分割
- 弹窗、抽屉等非首屏组件采用动态导入

### 三、依赖优化手段

#### 1. 路径别名配置
- Vite 配置路径别名减少相对路径复杂度

#### 2. 统一封装
- 请求层统一封装（\`src/utils/request.js\`）
- 工具函数统一管理（\`src/utils/util.js\`）

#### 3. 构建优化
- Ant Design 按需引入（babel-plugin-import）
- 将大型库（如 moment）替换为轻量替代（如 dayjs）

### 四、检测与约束

- ESLint 规则约束无用代码
- 代码审查确保不引入冗余依赖`
              },
              {
                id: 'q-8',
                question: '针对弱网场景实施路由分割、预加载及构建优化的实际？',
                answer: `## 弱网场景路由分割、预加载及构建优化

### 一、路由分割（Code Splitting）

使用 \`@loadable/component\` 实现按需加载：

\`\`\`javascript
const ROUTETOCOMPONENTS = {
  '/ebk': loadable(() => import(\`./pages/ebk\`), {
    fallback: <div>Loading...</div>
  }),
  // ... 共57个页面
};
\`\`\`

**弱网收益**：
- 首屏 JS 体积按需加载，弱网下首屏时间大幅降低
- 用户点击导航时才加载对应 chunk

### 二、预加载策略

#### 1. 骨架屏 fallback
- 提供视觉反馈，降低用户感知等待时间

#### 2. 资源预加载
- Webpack magic comments：\`import(/* webpackPrefetch: true */ './pages/...')\`
- 浏览器空闲时预取后续可能访问的 chunk

#### 3. 预判加载
- 基于用户行为预判（如鼠标悬停导航）触发加载

### 三、构建优化

#### 1. 开发环境优化
- Vite HMR，热更新时间 <100ms

#### 2. 生产环境优化
- Webpack 构建，代码分割、压缩
- TerserPlugin 压缩 JS，mini-css-extract-plugin 提取 CSS

#### 3. 弱网专项优化
- **HTTP/2 多路复用**：减少 TCP 连接数
- **Gzip 压缩**：传输体积减少 70%+
- **CDN 加速**：静态资源部署至 CDN
- **Service Worker 缓存**：离线可用`
              },
              {
                id: 'q-9',
                question: 'AI 工程化转型与实践遇到的问题类型？解决方案？',
                answer: `## AI 工程化转型与实践

### 一、问题类型

| 问题类型 | 具体表现 | 占比 |
|---------|---------|-----|
| 代码一致性 | 57个页面代码风格不统一 | 30% |
| 知识传承 | 新人上手周期长（2-3周） | 25% |
| 重复基建 | 每个页面重复实现列表、分页等 | 20% |
| 维护效率 | 依赖升级风险高 | 15% |
| 自动化程度 | 缺乏智能辅助 | 10% |

### 二、解决方案

#### 1. 代码一致性治理
- 建立 CLAUDE.md 开发规范
- ESLint + Prettier 统一代码风格
- Code Review 确保规范落地

#### 2. 知识传承体系
- 业务模块目录下的 README 说明业务背景
- 关键业务逻辑要求注释说明

#### 3. 消除重复基建
- 公共组件库（UploadModal、LogModal、SelectBank）
- 统一请求层（src/utils/request.js）
- 工具函数库（src/utils/util.js）

#### 4. AI 辅助实践
- 渐进式引入：从简单任务开始
- 场景化提示：针对项目特点设计提示词
- 反馈机制：AI 生成代码需人工审核
- 知识库建设：积累最佳实践

### 三、转型收益

| 维度 | 转型前 | 转型后 | 提升 |
|-----|-------|-------|-----|
| 新人上手 | 2-3周 | 1周 | 50%+ |
| CRUD 效率 | 2天/页面 | 0.5天/页面 | 75%+ |
| 代码规范率 | 60% | 90% | 50% |`
              },
              {
                id: 'q-10',
                question: 'AI 集成实现方案？',
                answer: `## AI 集成实现方案

### 一、技术架构

#### 核心依赖
- **流式调用**：使用 OpenAI SDK 的 Stream + Stream.fromSSEResponse 实现服务端流式响应
- **后端代理**：Supabase Edge Functions（llm-proxy）作为安全代理层
- **模型**：DeepSeek（默认 deepseek-reasoner）

#### 前端调用流程（src/lib/llm/call.ts）

\`\`\`javascript
// 1. 获取用户 session token
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// 2. 调用 Edge Function（带认证）
const response = await fetch(\`\${VITE_SUPABASE_URL}/functions/v1/llm-proxy\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ model, messages, temperature, stream }),
})

// 3. 流式处理
const streamData = Stream.fromSSEResponse(response, controller)
return streamData
\`\`\`

### 二、简历与 JD 智能对比实现

#### A. 简历 ATS 评估（optimize_prompt）

- 输入：简历 JSON
- 输出结构：
  - 5 项评分：job_match(30), ats_parsing(20), format_readability(20), content_completeness(20), impact_quantification(20)
  - findings：按严重级别（high/medium/low）输出问题及修复建议
  - fixChecklist：可执行的待办清单
  - suggestions：每条包含 before（原值）、after（修改后）、reason（修改原因）

#### B. 简历与 JD 对比（createJobDescriptionAnalysisPrompt）

- 输入：简历 JSON + JD 文本
- 输出结构：
  - matchScore：0-100 匹配度分数
  - extractedKeywords：从 JD 提炼的核心关键词
  - matchedKeywords / missingKeywords：已匹配/缺失关键词
  - sectionMatches：按模块分析覆盖率
  - recommendations：3-5 条可执行修改建议

### 三、可视化优化建议

前端展示在 src/pages/optimize/ 模块：

- 评分雷达图：展示 5 项 ATS 评分
- Findings 列表：按严重级别分类，点击可查看详情
- 一键优化：每条 suggestion 有 before/after 对比，点击即可应用修改
- JD 对比面板：关键词匹配矩阵 + 分模块覆盖率`
              },
            ],
          },
        ],
      },
    ],
  },
];
