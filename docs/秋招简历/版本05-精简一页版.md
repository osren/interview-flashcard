# 谭成 · 秋招简历 · 精简一页版

> 适用：一页纸 / 网申字数受限 / 快速投递  
> 各模块 3～4 条，保留核心量化与关键词

---

## 专业技能

- **前端基础**：JavaScript / TypeScript（ES6+）、HTML5 / CSS3；React（熟练）、Vue（熟悉）；小程序 / H5 多端
- **工程化**：Ant Design、Tailwind CSS、Redux / Zustand、Vite / Webpack、Git 协作发版
- **拓展**：Node.js、Supabase；LLM 接入与 AI 辅助开发（Claude Code / Agent Skills）

---

## 实习经历

**滴滴出行 · 企业版商旅** | 前端开发实习生 | 2026.01 — 2026.07

- 双端交付：C 端预订链路 + B 端配置中台双线开发，累计 **20+** 项需求/特性随 **15 次发版** 上线
- 业务覆盖：分享转化、超标管控、代订选号（C 端）；机票政策、用车、供应商等配置模块（B 端）
- AI 规范开发：按团队 AI Coding Spec，用大模型 + Skills 协同完成读需求到规范编码
- 质量门禁：样式兼容、业务边界与上线质量经人工 Review / 自测把关

---

## 实习产出

### 性能监控与体验优化

**性能监控与体验优化** | PerfMonitor / Omega / Agent Skill | 实习产出

- 监控体系：统一性能监控（跨页 / LCP·FCP / 关键接口），覆盖 H5 与星河双端
- 体验收益：列表首屏 LCP **1400→1160ms（↓17%）**；星河底部菜单切换卡顿约 **↓27%**
- 分析闭环：沉淀 page-performance-analysis Skill，形成「定位 → 改造 → 验收」闭环
- 技术实现：PerfMonitor SDK + Omega 上报；Skill 三阶段分析与 P0/P1/P2 报告契约

### 商旅 AI 智能监控降噪

**商旅 AI 告警智能降噪（error-triage）** | Node.js / LLM | 实习产出

- 业务问题：机酒火接口告警噪音高，真故障易被淹没，需在派发前智能判定
- 核心能力：LLM 派发前判定（是否上报 + 等级 + 依据），异常保守上报
- 工程保障：可插拔 Domain + Skills 接入 + Eval 漏报优先；火车 Domain 已接入
- 技术实现：Node.js 引擎 + LLM Gateway；Domain 配置化路由与 Prompt，Skills 自动化接入

---

## 项目经历

**GResume 智能简历平台** | React / TipTap / Supabase | 个人项目 | 2025.10 — 2026.06

- 业务问题：求职需同时过人审与 ATS，内容、模板、优化、投递分散，缺少一站式工具
- 编辑内核：Schema 驱动多模块编辑器 + TipTap 富文本 + 实时预览与 A4 分页导出
- AI 闭环：ATS 五维结构化评分与可执行修复；划词改写；JD 驱动派生简历（事实字段保护）
- 协作与求职：Automerge CRDT 实时共编；模板与内容解耦；投递看板 + 版本历史
