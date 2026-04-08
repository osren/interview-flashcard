import { FlashCard } from '@/types';

// AI 资讯项目类型
export interface AIProject {
  id: string;
  name: string;
  description: string;
  files: {
    html?: string;
    pdf?: string;
    xlsx?: string;
  };
  cards?: FlashCard[];
}

// AI 资讯数据
export const aiProjects: AIProject[] = [
  {
    id: 'ai-progress',
    name: 'AI 进展',
    description: '2025年至今全球AI重大进展与影响分析',
    files: {
      html: '/docs/AI_Devlopments/ai进展/2025年至今全球ai重大进展与影响分析.html',
      pdf: '/docs/AI_Devlopments/ai进展/2025年至今全球ai重大进展与影响分析.pdf',
      xlsx: '/docs/AI_Devlopments/ai进展/信息汇总_2025年AI关键事件与技术进展梳理.xlsx',
    },
    cards: [
      // 第一章：AI发展进入范式重构与Agentic时代
      {
        id: 'ai-001',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'AI时代定义',
        question: '什么是 Agentic 时代？',
        answer: `## Agentic 时代定义

2025年至2026年初，AI发展进入"范式重构与Agentic时代"。

核心特征：
1. **从单点突破到系统协作**：单个模型能力提升转变为多智能体协作
2. **AI Agent 生态成熟**：智能体从实验室走向企业级部署
3. **新范式确立**：MCP协议、Skill体系等标准化框架出现

这个时代代表了AI从被动工具向主动执行者的转变。`,
        tags: ['AI', 'Agent', '范式'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-002',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '核心趋势',
        question: '2025年AI发展的两条并行核心演进趋势是什么？',
        answer: `## 2025年AI核心演进趋势

**趋势一：AI Agent 生态的成熟与扩张**
- MCP (Multi-Agent Collaboration Protocol) 成为标准
- Skill 体系模块化
- Agent 规模化应用落地

**趋势二：模型与架构创新**
- 多模态与长上下文原生架构突破
- 面向强化学习的专用模型
- 高效训练与推理架构

两条趋势相互增强，共同定义 Agentic 时代。`,
        tags: ['AI', '趋势', '2025'],
        status: 'unvisited',
        difficulty: 'medium',
      },

      // 第二章：AI Agent 生态
      {
        id: 'ai-003',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'MCP协议',
        question: '什么是 MCP（多智能体协作协议）？',
        answer: `## MCP (Multi-Agent Collaboration Protocol)

MCP 成为复杂任务执行的新标准。

核心特点：
1. **标准化通信**：统一智能体间交互协议
2. **任务分解**：复杂任务拆分为可协作子任务
3. **状态共享**：多智能体共享上下文信息
4. **动态调度**：根据任务需求动态分配智能体

MCP 的出现解决了多智能体协作的混乱问题。`,
        tags: ['MCP', '多智能体', '协议'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-004',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'Skill体系',
        question: '什么是 Skill 体系？',
        answer: `## Skill 体系

Skill 体系 = 模块化 + 可组合的智能能力定义。

核心特点：
1. **模块化**：将AI能力拆分为独立Skill
2. **可组合**：多个Skill可灵活组合使用
3. **可复用**：Skill可被不同Agent复用
4. **可扩展**：方便添加新Skill

类比：像乐高积木块，每个Skill是独立部件，可拼接成复杂功能。`,
        tags: ['Skill', '模块化', 'AI'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-005',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'Agent规模化',
        question: 'Agent 规模化应用从实验室到企业级部署意味着什么？',
        answer: `## Agent 规模化应用

从实验室到企业级部署的转变：

1. **可靠性提升**：企业级SLA要求得到满足
2. **安全性增强**：权限控制、审计日志完善
3. **集成能力**：与现有企业系统对接
4. **成本优化**：规模化部署成本大幅降低
5. **运维成熟**：监控、告警、故障恢复机制健全

这标志着Agent技术从概念验证进入实用阶段。`,
        tags: ['Agent', '企业级', '规模化'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-006',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '编程范式',
        question: 'Agent协作编程如何改变软件开发范式？',
        answer: `## Agent协作编程

软件开发范式的根本性变革：

**传统模式**：人写代码 → 机器执行
**Agent模式**：人描述需求 → Agent协作完成

变化：
1. **角色转变**：开发者从"写代码"变为"设计流程"
2. **调试方式**：从调试代码变为调试Agent行为
3. **质量保证**：从单元测试变为场景测试
4. **协作方式**：人机协作取代纯人工

未来可能是"产品级代码由Agent生成，人负责审核"。`,
        tags: ['Agent', '编程', '开发范式'],
        status: 'unvisited',
        difficulty: 'hard',
      },

      // 第三章：模型与架构创新
      {
        id: 'ai-007',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '多模态架构',
        question: '多模态与长上下文原生架构的突破意味着什么？',
        answer: `## 多模态与长上下文架构突破

**多模态原生架构**：
- 图像、视频、音频、文本统一处理
- 跨模态理解和推理能力增强
- 端到端训练避免信息损失

**长上下文支持**：
- 支持超长文档处理（100K+ tokens）
- 海量知识检索与理解
- 完整代码库理解

突破使AI能处理更复杂、更真实的世界信息。`,
        tags: ['多模态', '长上下文', '架构'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-008',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '强化学习模型',
        question: '面向强化学习与智能体的专用模型架构有什么特点？',
        answer: `## 强化学习专用模型架构

特点：
1. **工具调用能力**：内置代码执行、API调用
2. **规划能力**：多步骤推理与任务分解
3. **自我纠错**：识别并修正错误
4. **长期记忆**：跨会话信息保持
5. **奖励机制**：基于反馈持续优化

这类模型专门为Agent场景优化，而非通用对话。`,
        tags: ['强化学习', 'Agent', '模型架构'],
        status: 'unvisited',
        difficulty: 'hard',
      },
      {
        id: 'ai-009',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '高效训练',
        question: '高效训练、推理与新型记忆管理架构有哪些进展？',
        answer: `## 高效训练与推理进展

**训练效率**：
- 混合专家模型(MoE)普及
- 流水线并行优化
- 课程学习策略

**推理优化**：
- 投机解码(Speculative Decoding)
- KV Cache 优化
- 量化技术(INT8/INT4)

**记忆管理**：
- 分层记忆架构
- 检索增强生成(RAG)
- 长期记忆外部化

这些进展大幅降低了AI应用成本。`,
        tags: ['训练', '推理', '记忆'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-010',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '世界模型',
        question: '世界模型、具身智能与端侧计算架构有什么进展？',
        answer: `## 世界模型与具身智能

**世界模型**：
- 对物理世界规律的建模
- 模拟与预测能力增强
- 减少对真实数据依赖

**具身智能**：
- 机器人操作能力提升
- 感知-运动闭环
- 真实环境交互

**端侧计算**：
- 模型压缩技术
- 本地部署能力
- 隐私与延迟优化

这些代表AI走向真实物理世界。`,
        tags: ['世界模型', '具身智能', '端侧'],
        status: 'unvisited',
        difficulty: 'hard',
      },

      // 第四章：关键使能技术
      {
        id: 'ai-011',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '智能体实用化',
        question: 'AI智能体与具身智能技术实用化面临哪些挑战？',
        answer: `## 智能体实用化挑战

1. **可控性**：确保Agent行为符合预期
2. **可靠性**：99.9%+ 可用性要求
3. **安全性**：防止恶意利用
4. **效率**：推理延迟与成本
5. **集成**：与企业系统对接
6. **监控**：运行状态可视化

解决方案：
- Constitutional AI 约束
- RLHF 对齐训练
- 工具调用安全沙箱
- 监控与干预机制`,
        tags: ['智能体', '具身', '实用化'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-012',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '合成数据',
        question: '合成数据与世界模型解决什么问题？',
        answer: `## 合成数据与世界模型

**解决的问题**：
1. **数据稀缺**：高质量标注数据不足
2. **数据隐私**：敏感数据使用限制
3. **成本高昂**：数据收集与标注费用

**技术进展**：
- 合成数据生成质量提升
- 世界模型减少真实数据依赖
- 仿真环境训练效果接近真实

**意义**：打破数据瓶颈，推动AI发展。`,
        tags: ['合成数据', '世界模型', '数据'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-013',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '边缘AI',
        question: '边缘AI与模型压缩技术有哪些进展？',
        answer: `## 边缘AI与模型压缩

**模型压缩**：
- 知识蒸馏成熟应用
- 剪枝技术自动化
- 量化精度保持

**边缘部署**：
- 芯片专属优化(NPU/GPU)
- 轻量级框架(TFLite/ONNX)
- 端云协同架构

**应用场景**：
- 移动设备
- IoT设备
- 自动驾驶

边缘AI让AI无处不在。`,
        tags: ['边缘AI', '模型压缩', '端侧'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-014',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'AI安全',
        question: 'AI安全对齐有哪些进展？',
        answer: `## AI安全对齐进展

1. **RLHF**：基于人类反馈的强化学习
2. **Constitutional AI**：基于规则约束
3. **Red Teaming**：红队测试发现漏洞
4. **可解释性**：模型决策可视化
5. **内容过滤**：有害内容识别

挑战：
- 安全性与可用性平衡
- 对抗攻击防御
- 跨语言/文化适配

安全是AI大规模应用的前提。`,
        tags: ['AI安全', '对齐', 'RLHF'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-015',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '开发工具',
        question: 'AI开发工具、框架与硬件支持生态有哪些进展？',
        answer: `## AI开发工具生态

**框架层**：
- LangChain/LangGraph成熟
- AutoGen等多Agent框架
- 低代码Agent平台

**工具层**：
- Agent编排工具
- 监控与可观测性
- 安全与合规工具

**硬件层**：
- AI芯片算力提升
- 推理加速卡
- 边缘计算设备

生态完善降低Agent开发门槛。`,
        tags: ['开发工具', '框架', '硬件'],
        status: 'unvisited',
        difficulty: 'easy',
      },

      // 第五章：产业生态
      {
        id: 'ai-016',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '产品发布',
        question: '2025年有哪些标志性的AI产品发布与开源项目？',
        answer: `## 标志性产品与开源项目

**产品发布**：
- GPT-4o/5系列
- Claude系列
- 开源大模型(Llama/Mistral)

**开源项目**：
- Agent框架涌现
- MCP协议实现
- 微调工具成熟

**趋势**：
- 大厂主导转向生态竞争
- 开源与商业并行
- 垂直领域深耕

竞争焦点从模型能力转向生态。`,
        tags: ['产品', '开源', '2025'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-017',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '政策标准',
        question: 'AI领域的重大政策与标准制定有哪些？',
        answer: `## AI政策与标准

**政策层面**：
- 各國AI监管框架
- 数据安全法规
- 算力基础设施规划

**标准层面**：
- AI安全标准
- 模型评估基准
- Agent互操作标准

**影响**：
- 合规成本增加
- 行业门槛提高
- 头部优势强化

政策是AI发展的隐形边界。`,
        tags: ['政策', '标准', '监管'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-018',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '商业落地',
        question: 'AI商业落地有哪些典型案例与产业合作范式？',
        answer: `## AI商业落地案例

**企业服务**：
- 智能客服普及
- 代码辅助开发
- 数据分析与决策

**垂直领域**：
- 医疗AI辅助诊断
- 金融智能风控
- 制造智能质检

**合作范式**：
- API+微调定制
- 垂直模型+部署
- Agent平台+行业插件

商业化路径逐渐清晰。`,
        tags: ['商业', '落地', '案例'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-019',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '学术研究',
        question: '2025年有哪些重要的AI研究突破与会议风向？',
        answer: `## AI研究突破与风向

**重要突破**：
- Agent架构创新
- 长上下文处理
- 多模态理解
- 高效推理

**会议风向**：
- NeurIPS/ICML/ICLR
- AAAI/ IJCAI
- 聚焦Agent与实践

**研究趋势**：
- 从benchmark到真实场景
- 效率与效果并重
- 跨学科融合

学术界引领技术前沿。`,
        tags: ['研究', '学术', '会议'],
        status: 'unvisited',
        difficulty: 'medium',
      },

      // 第六章：影响评估
      {
        id: 'ai-020',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '产业格局',
        question: 'Agentic时代如何重塑产业竞争格局？',
        answer: `## 产业格局重塑

**竞争焦点变化**：
- 模型→Agent能力
- 单点→生态
- 产品→平台

**新进入者机会**：
- 垂直领域Agent
- Agent工具链
- 端侧Agent

**传统巨头应对**：
- 开放平台
- 生态合作
- 垂直整合

"平台、协议、入口"成为必争之地。`,
        tags: ['产业', '竞争', '格局'],
        status: 'unvisited',
        difficulty: 'hard',
      },
      {
        id: 'ai-021',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '技术路线',
        question: 'Agentic时代对技术发展路线有什么影响？',
        answer: `## 技术发展路线影响

1. **协作优先**：从单体智能到多智能体协作
2. **专业化**：通用模型→垂直Agent
3. **工程化**：算法创新→系统优化
4. **标准化**：MCP等协议统一

5. **端云协同**：云端训练+端侧推理

技术路线从"做更大事"转向"更高效做事"。`,
        tags: ['技术路线', '发展', 'Agent'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-022',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '挑战',
        question: 'Agentic时代面临哪些挑战与未来演进方向？',
        answer: `## 挑战与未来演进

**当前挑战**：
1. 可靠性与安全性
2. 标准化与互操作
3. 成本与效率
4. 人才与知识

**未来方向**：
1. Agent能力持续提升
2. 生态更加开放
3. 垂直领域深化
4. 人机协作成熟

5. AGI路径逐渐清晰

演进是持续的，不会一蹴而就。`,
        tags: ['挑战', '未来', '演进'],
        status: 'unvisited',
        difficulty: 'hard',
      },

      // 扩展问题 - 深入细节
      {
        id: 'ai-023',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'A2A协议',
        question: '什么是 A2A (Agent2Agent) 协议？',
        answer: `## A2A (Agent2Agent) 协议

A2A 是智能体之间的通信协议。

核心功能：
1. **身份认证**：确认Agent身份
2. **能力发现**：互相了解能力
3. **任务协商**：分配与协调任务
4. **结果共享**：同步执行结果
5. **状态同步**：保持一致性

与MCP关系：
- MCP：Agent与工具/服务
- A2A：Agent与Agent

两者共同构成Agent协作基础。`,
        tags: ['A2A', '协议', 'Agent'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-024',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'MoE架构',
        question: '什么是 MoE（混合专家模型）架构？',
        answer: `## MoE (混合专家模型)

MoE = 多个"专家"网络 + 门控机制

工作原理：
1. 输入进入门控网络
2. 门控决定激活哪些专家
3. 专家处理各自擅长任务
4. 结果加权合并

优势：
- 参数量大但计算少
- 可以处理多种任务
- 训练成本相对较低

典型应用：Mixtral、Switch Transformer等。`,
        tags: ['MoE', '模型架构', '混合专家'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-025',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'RAG',
        question: '什么是 RAG（检索增强生成）？',
        answer: `## RAG (检索增强生成)

RAG = 检索 + 生成

工作流程：
1. 用户问题转为向量
2. 向量数据库检索相关内容
3. 将检索结果加入Prompt
4. 大模型基于上下文生成答案

优势：
- 解决知识时效性问题
- 减少幻觉
- 支持私有数据

是当前最成功的LLM应用架构之一。`,
        tags: ['RAG', '检索', 'LLM'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-026',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'Agent Memory',
        question: 'Agent 的记忆管理有哪些类型？',
        answer: `## Agent 记忆管理

**短期记忆**：
- 当前会话上下文
- 工作内存

**长期记忆**：
- 向量数据库存储
- 结构化知识

**工具记忆**：
- API调用历史
- 执行结果

**架构模式**：
- 分层记忆
- 记忆检索
- 遗忘机制

好的记忆管理是Agent智能的关键。`,
        tags: ['Agent', '记忆', '架构'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-027',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'Constitutional AI',
        question: '什么是 Constitutional AI（宪法人工智能）？',
        answer: `## Constitutional AI

Constitutional AI = 基于规则的约束

核心理念：
1. 预定义一套"宪法"规则
2. AI根据规则评估行为
3. 自动拒绝违规行为

优势：
- 可解释性强
- 调试方便
- 减少人工标注

与RLHF对比：
- RLHF：人类反馈学习
- Constitutional：规则约束

两者常结合使用。`,
        tags: ['Constitutional', 'AI安全', '对齐'],
        status: 'unvisited',
        difficulty: 'medium',
      },
      {
        id: 'ai-028',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'Agent框架',
        question: '主流的 Agent 开发框架有哪些？',
        answer: `## 主流Agent开发框架

1. **LangChain/LangGraph**
   - 最流行的LLM应用框架
   - Chain、Agent、Memory组件

2. **AutoGen**
   - 微软出品
   - 多Agent协作框架

3. **CrewAI**
   - 角色扮演Agent
   - 任务分解与执行

4. **MetaGPT**
   - 多Agent软件生成

5. **自研框架**
   - 大厂自建Agent平台

选择考虑：需求复杂度、社区支持、成本。`,
        tags: ['Agent', '框架', 'LangChain'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-029',
        module: 'ai',
        chapterId: 'ai-progress',
        category: 'Function Calling',
        question: '什么是 Function Calling（函数调用）？',
        answer: `## Function Calling

Function Calling = 让LLM调用外部工具

工作流程：
1. 定义工具（函数）及其描述
2. LLM决定是否调用
3. 执行函数获取结果
4. 将结果返回LLM生成答案

应用场景：
- 数据库查询
- API调用
- 代码执行
- 文件操作

是Agent能力的重要基础。`,
        tags: ['Function Calling', '工具调用', 'Agent'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'ai-030',
        module: 'ai',
        chapterId: 'ai-progress',
        category: '推理优化',
        question: 'LLM推理优化有哪些常用技术？',
        answer: `## LLM推理优化技术

1. **量化**
   - INT8/INT4 量化
   - 精度与速度平衡

2. **投机解码**
   - 小模型预测+大模型验证
   - 加速生成

3. **KV Cache 优化**
   - 缓存Attention键值
   - 减少重复计算

4. **批处理**
   - 多请求并行
   - 共享计算

5. **剪枝**
   - 去除冗余层/参数

这些技术使AI推理成本大幅下降。`,
        tags: ['推理', '优化', 'LLM'],
        status: 'unvisited',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'claw-product',
    name: 'Claw 产品',
    description: 'Claw 类产品技术与商业差异对比分析',
    files: {
      html: '/docs/AI_Devlopments/claw产品/claw类产品技术与商业差异对比分析.html',
    },
    cards: [
      {
        id: 'claw-001',
        module: 'ai',
        chapterId: 'claw-product',
        category: '产品定义',
        question: '什么是 Claw 类产品？',
        answer: `## Claw 类产品定义

Claw类产品指基于AI能力实现自动化操作的产品。

核心特征：
1. **自动化**：模拟人类操作
2. **智能化**：理解任务意图
3. **多功能**：跨应用协作
4. **可编程**：支持自定义流程

典型代表：Claude Code、Cursor等AI编程工具。

这些产品正在重新定义软件使用方式。`,
        tags: ['Claw', '自动化', 'AI产品'],
        status: 'unvisited',
        difficulty: 'easy',
      },
      {
        id: 'claw-002',
        module: 'ai',
        chapterId: 'claw-product',
        category: '技术特点',
        question: 'Claw 类产品的核心技术特点是什么？',
        answer: `## Claw类产品核心技术

1. **浏览器自动化**
   - 网页操作模拟
   - 内容抓取与分析

2. **智能推理**
   - 大模型规划能力
   - 多步骤任务执行

3. **自然语言交互**
   - 理解用户意图
   - 生成操作指令

4. **视觉理解**
   - 屏幕内容识别
   - UI元素定位

5. **安全隔离**
   - 沙箱运行环境
   - 权限控制

技术堆栈：大模型 + 浏览器自动化 + 计算机视觉。`,
        tags: ['Claw', '技术', '自动化'],
        status: 'unvisited',
        difficulty: 'medium',
      },
    ],
  },
];

// 获取项目卡片
export const getProjectCards = (projectId: string): FlashCard[] => {
  const project = aiProjects.find(p => p.id === projectId);
  return project?.cards || [];
};