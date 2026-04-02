<!--
 * @Author: tancheng
 * @Date: 2026-04-02 16:54:48
 * @LastEditors: tancheng
 * @LastEditTime: 2026-04-02 17:02:25
 * @FilePath: /interview-flashcard/CANDIDATE.md
 * @Description: 
-->
# 候选人背景信息

## 基本信息
- **姓名**: 谭成
- **学历**: 硕士（研二下学期）
- **求职方向**: 前端开发工程师
- **实习时间**: 可保证周一至周五全职实习

## 面试自我介绍（精简版）

面试官你好，我叫谭成，一名研二学生，就读于某高校计算机专业，目前课程已基本修完，主要精力放在论文研究和实习上，求职方向是前端开发工程师。

先说技能掌握吧。我主要从事前端开发，熟练掌握 React、TypeScript、Vue，状态管理用过 Redux 和 Zustand，UI 组件库主要用 Ant Design 和 Tailwind CSS，工程化方面熟悉 Vite 和 Webpack，另外还接触过 Supabase 做后端服务，以及 Claude Code 进行 AI 辅助开发。

接下来说实习经历。我从 2025 年开始在滴滴企业版实习，主要参与商旅系统开发，工作围绕三个方面。第一块是遗留系统重构，机票政策模块是 55 个业务模块中最复杂的，单文件超过 2000 行代码，我参与将其从 jQuery 加硬编码转为配置驱动开发，通过 JSON Schema 动态表单大幅提升研发效率。第二块是弱网性能优化，使用 @loadable/component 实现路由分割和预加载，将 FCP 从 3.2 秒优化到 1.8 秒，首屏 JS 减少 45%。第三块是 AI 工程化转型，我参与了 OpenSpec 规范制定和 CLAUDE.md 维护工作，推动 Claude Code Agent 辅助开发工作流落地，帮助团队大需求开发周期缩短 30%。

除了实习，我还独立开发了 GResume 智能简历平台。这是一个开源项目，采用离线优先架构，用 IndexedDB 做本地存储，用 CRDT 解决冲突，配合 Supabase 云端同步。同时集成了 DeepSeek LLM 做 AI ATS 评分，给出简历与岗位 JD 的匹配建议。

以上就是我的基本情况。本科期间我打下扎实的技术基础，研究生阶段在滴滴接触了企业级项目开发流程，也通过 GResume 锻炼了独立设计系统的能力。我是一个喜欢动手实践的人，也愿意持续学习新技术，面试官有什么想深入了解的，我们可以进一步交流。

## 教育背景
- 硕士学位在读，课程已基本修完，主要任务是论文研究
- 实习已纳入研究生培养计划，导师知情并支持
- 论文方向与实习工作相关，可相互促进

## 项目经验

### 1. 滴滴企业版 - 商旅系统（实习）
**技术栈**: React 17, TypeScript, Ant Design 4.x, Redux, @loadable/component

**核心工作**:
- 遗留系统拆解与重构：机票政策模块（55个业务模块中最复杂）从 jQuery + 硬编码转为配置驱动
- 弱网性能优化：路由分割 + 预加载，FCP 从 3.2s → 1.8s
- AI工程化转型：参与 OpenSpec 规范制定、SSD 智能体开发、CLAUDE.md 维护

**关键技术点**:
- 配置驱动开发（JSON Schema 动态表单）
- API 签名机制（MD5 + timestamp + nonce）
- 代码分割与预加载策略
- Redux 状态管理 + 请求拦截器
- Claude Code Agent 辅助开发

### 2. GResume 智能简历平台（个人项目）
**技术栈**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Supabase, Automerge(CRDT), TipTap

**核心工作**:
- 离线优先架构：IndexedDB 本地存储 + Supabase 云端同步
- CRDT 文档冲突解决：基于 Automerge 实现多人协作编辑
- AI ATS 评分：DeepSeek LLM + 流式响应
- 性能优化：路由分割、乐观 UI、光标节流

**关键技术点**:
- CRDT 最终一致性
- IndexedDB 离线存储
- 乐观更新 + 延迟持久化
- Supabase Edge Functions + Realtime
- WebSocket 长连接（通过 Supabase Realtime）

## 技术掌握
- **前端框架**: React, TypeScript, Vue
- **状态管理**: Redux, Zustand
- **UI 组件库**: Ant Design, Tailwind CSS
- **构建工具**: Vite, Webpack
- **后端/云服务**: Supabase, Node.js
- **AI 集成**: Claude Code, Prompt Engineering

## 项目知识储备
项目包含了详细的面试卡片，涵盖以下主题：

### 滴滴项目
- 遗留系统重构、配置驱动、SSD规范、AI工程化
- 性能优化：路由分割、预加载、useMemo/useCallback/memo
- 架构设计：目录结构、服务层封装、动态路由、权限管理
- 安全机制：API签名、数据脱敏、金额精度计算

### GResume 项目
- CRDT 冲突解决、离线优先架构
- 协同编辑：光标同步、实时广播
- 性能优化：代码分割、乐观UI、节流批处理
- AI 集成：ATS评分、流式响应、冷启动优化

## 对话上下文
请根据以下方式与候选人对话：
1. 询问项目细节时，结合项目知识储备中的卡片内容
2. 技术问题需要深入探讨原理，不能只停留在使用层面
3. 可以针对简历中的经历进行追问，如具体实现细节、遇到的挑战、解决方案
4. 考察候选人对技术选型的理解和对项目的整体把控能力
