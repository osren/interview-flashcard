export type HandbookCategory = 'basic' | 'project' | 'interview';

export interface HandbookItem {
  id: string;
  title: string;
  url: string;
  password: string;
  category: HandbookCategory;
}

export interface HandbookGroup {
  id: HandbookCategory;
  title: string;
  description: string;
  icon: string;
}

export const handbookGroups: HandbookGroup[] = [
  {
    id: 'basic',
    title: '基础手册',
    description: 'RAG、Agent、框架与 AI 工程化入门',
    icon: '📘',
  },
  {
    id: 'project',
    title: '项目实战',
    description: 'LangChain / LangGraph / 多 Agent 实战项目',
    icon: '🛠️',
  },
  {
    id: 'interview',
    title: '面试求职',
    description: '八股文与 AI 应用开发面试题',
    icon: '💼',
  },
];

export const handbookItems: HandbookItem[] = [
  {
    id: 'rag',
    title: 'RAG 手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/Xum4w0ksBiwgRTkFKeec2MYwnOp',
    password: '5@31U168',
    category: 'basic',
  },
  {
    id: 'agent',
    title: 'Agent 手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/CkzZwmDPbiUvP5kVyiIcVQepnEf',
    password: '22F61422',
    category: 'basic',
  },
  {
    id: 'transformer',
    title: 'Transformer 手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/UVG4wY8JxiIgnyka6dsc3xDanid',
    password: '970a7945',
    category: 'basic',
  },
  {
    id: 'langchain',
    title: 'LangChain 手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/R3eXw8aXeiQqXxkYSrOcPHeznK6',
    password: '544N22#3',
    category: 'basic',
  },
  {
    id: 'langgraph',
    title: 'LangGraph 手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/CIPqwL3XkimM4Qk73ylc2RZMnrg',
    password: '75@1425Z',
    category: 'basic',
  },
  {
    id: 'ai-harness',
    title: 'AI Harness 万字详解 · 入门概念手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/JxIcwQGKEiJKDnkjMmWcF3dAngd',
    password: '95xdclass22',
    category: 'basic',
  },
  {
    id: 'vibe-coding',
    title: 'Vibe Coding 指南 · AI 编辑器全栈开发',
    url: 'https://dqej47nflyz.feishu.cn/wiki/A9fBwjGTaiy3j0kG3qKc7BLpnAe',
    password: '212216W2',
    category: 'basic',
  },
  {
    id: 'codex',
    title: 'Codex 从小白到实战高手 · 大厂工程化实战手册',
    url: 'https://dqej47nflyz.feishu.cn/wiki/OKxWwZo31imUBSkX61OcGheNnph',
    password: '391852P1',
    category: 'basic',
  },
  {
    id: 'claude-code',
    title: 'Claude Code · 入门实战教程文档',
    url: 'https://dqej47nflyz.feishu.cn/wiki/Zuicww3siienxOknDT5cygj9nI3',
    password: '6X2143y5',
    category: 'basic',
  },
  {
    id: 'langchain-kb',
    title: 'LangChain 知识库助手项目',
    url: 'https://dqej47nflyz.feishu.cn/wiki/V6B0wfJvwiAdFIkEN0Lc5h3KnPp',
    password: '13C12#51',
    category: 'project',
  },
  {
    id: 'langgraph-mcp',
    title: 'LangGraph + MCP 智能出行助手项目',
    url: 'https://dqej47nflyz.feishu.cn/wiki/PenqwX3LMiQrVrkaka2c39Vwnvd',
    password: '62p3678b',
    category: 'project',
  },
  {
    id: 'multi-agent-oa',
    title: '多 Agent 项目实战 · 小滴智能 OA 办公审核 AI 系统',
    url: 'https://dqej47nflyz.feishu.cn/wiki/Sjedw0wDSiFj6Dk3rc5c1Ioontf',
    password: 'z23664Q5',
    category: 'project',
  },
  {
    id: 'multi-agent-medical',
    title: '多 Agent 项目实战 · 智能问诊 AI 客服系统',
    url: 'https://dqej47nflyz.feishu.cn/wiki/W87YwmTsSim3lxkxSXicRHcrnbp',
    password: 'X22152Q9',
    category: 'project',
  },
  {
    id: 'java-bagu',
    title: 'Java 全套八股文',
    url: 'https://dqej47nflyz.feishu.cn/wiki/MjOgw3SnjilBSBkZ4vlcLMFinxe',
    password: 'h77943@2',
    category: 'interview',
  },
  {
    id: 'llm-bagu',
    title: 'AI 大模型八股文',
    url: 'https://dqej47nflyz.feishu.cn/wiki/O8KGwvToki7vbwkqKBbckhI1ngd',
    password: '57P89Z21',
    category: 'interview',
  },
  {
    id: 'agent-interview',
    title: 'AI / Agent 应用开发面试题',
    url: 'https://dqej47nflyz.feishu.cn/wiki/ZSBJw2ZqjiNOgVkAAPMc6ShRnYb',
    password: 'bB728394C',
    category: 'interview',
  },
];

export function getHandbooksByCategory(category: HandbookCategory): HandbookItem[] {
  return handbookItems.filter((item) => item.category === category);
}
