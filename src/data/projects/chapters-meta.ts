import type { Chapter } from '@/types';

export const projectChapters: Chapter[] = [
  {
    id: 'interviewflash',
    module: 'projects',
    title: 'InterviewFlash 秋招面试一体化备战平台',
    description:
      '项目搭建、架构组织、开发流程、核心功能、性能优化与项目亮点（含岗位池/拆包/keep-alive 复盘）',
    cardCount: 15,
    icon: '⚡',
  },
  {
    id: 'didi',
    module: 'projects',
    title: '滴滴企业版 - 商旅体验',
    description: '遗留系统重构、AI工程化转型、弱网性能优化、业务功能开发、技术架构设计、性能优化',
    cardCount: 43,
    icon: '🚗',
  },
  {
    id: 'didi-performance',
    module: 'projects',
    title: '商旅 H5 / 小程序性能监控与体验优化',
    description: '双端性能监控、列表首屏与日期切换优化、星河菜单卡顿治理及性能分析 Skill',
    cardCount: 10,
    icon: '⚡',
  },
  {
    id: 'ai-monitor',
    module: 'projects',
    title: 'AI 监控降噪工具',
    description: '接口错误告警智能上报判定：LLM 降噪、可插拔 Domain、评测闭环',
    cardCount: 21,
    icon: '📡',
  },
  {
    id: 'gresume',
    module: 'projects',
    title: 'GResume 智能简历平台',
    description: 'CRDT文档冲突、IndexedDB离线、AI集成ATS评分、协同编辑',
    cardCount: 67,
    icon: '📝',
  },
  {
    id: 'didi-interview-guide',
    module: 'projects',
    title: '滴滴实习项目简历备战指南',
    description: '项目问答、技术亮点、避坑指南与快速复习',
    cardCount: 13,
    icon: '📋',
  },
  {
    id: 'comprehensive-interview',
    module: 'projects',
    title: '综合面试题与参考回答',
    description: '前端基础、工程实践、AI 项目深挖与现场情景题，共 54 道问答',
    cardCount: 54,
    icon: '🗣️',
  },
];

export const PROJECT_TOTAL_CARD_COUNT = projectChapters.reduce((sum, c) => sum + c.cardCount, 0);
