# 性能监控与体验优化 — 简历 & 面试表述

> 双轨：`PerfMonitor`（运行时）+ `page-performance-analysis` Skill（静态分析）  
> 真测数字来自同事口径，使用前请与个人参与度对齐  
> 详文：[PerfMonitor与体验优化.md](./PerfMonitor与体验优化.md) · [功能全面说明.md](./功能全面说明.md)

---

## 一、简历可直接粘贴版

### 基本信息（按需替换）

| 字段 | 建议写法 |
|------|----------|
| 项目名 | 性能监控与体验优化（PerfMonitor + 性能分析 Skill） |
| 角色 | 监控打点 / 首屏与卡顿优化 / 分析规程沉淀（按实际勾选） |
| 技术栈 | PerfMonitor · Omega · Web Vitals · MPX 多端（H5/星河）· Claude Code Skill |
| 业务域 | 滴滴企业版商旅 / 酒店等业务页 |

---

### 版本 A：精简版（1 段，推荐主投前端）

**性能监控与体验优化** | PerfMonitor / Omega / Web Vitals

搭建 PerfMonitor 性能监控体系，覆盖跨页链路（home→list）、同页 LCP/FCP 与关键接口耗时并统一 Omega 上报；首页自建双端（H5/星河）指标并剥离拖长 LCP 的非关键接口，列表覆盖接口返回与缓存直渲双路径、修正切日期重渲口径，首屏 LCP 1400→1160ms（↓17%）；修复渲染上报异常并优化星河底部菜单切换卡顿（约 ↓27%）。同步沉淀页面性能分析 Skill，形成「静态定位 → 改造 → 数字验收」闭环。

---

### 版本 B：标准版（4 条 bullet，推荐）

**性能监控与体验优化** | PerfMonitor · Omega · Agent Skill

- **监控底座**：搭建 `perf-monitor.js`，跨页 `home_to_list_complete`、同页 LCP/FCP、关键接口耗时统一经 Omega 上报；环境 class 兼容 H5 与星河
- **首页/列表**：接入 `getHomeData` 耗时；剥离 `privacyPopList` 等拖长 LCP 的路径；列表覆盖「接口返回 / 缓存命中直渲」双路径并修正切日期重渲口径，LCP **↓17%**（1400→1160ms）
- **稳定性**：修复 `reportRender` 报错并补最长进入耗时埋点；优化星河底部菜单切换排序逻辑，卡顿约 **↓27%**
- **分析闭环**：沉淀 page-performance-analysis Skill（加载/交互/监听三阶段 + P0/P1/P2），与监控指标互相校验

---

### 版本 C：只写 Skill（投 AI Coding / Agent 岗）

**Agent 驱动的页面性能复盘 Skill** | Skill 工程 · 报告契约

- 用 Skill 固化「读源码 → 估耗时 → 找瓶颈 → 出方案」，覆盖加载 / 交互 / 监听
- 耗时估算表 + 串行瀑布 / Watch 连锁等瓶颈清单，报告强制 P0/P1/P2
- 与业务仓 PerfMonitor/Omega 形成闭环：Skill 定位，线上数字验收（列表 LCP↓17% 等）

---

### 版本 D：只写 PerfMonitor（空间紧、突出结果时）

**商旅页性能监控与体验优化** | PerfMonitor / Omega

- 搭建跨页 + LCP/FCP + 关键接口监控，H5/星河双端上报
- 列表 LCP 1400→1160ms（↓17%）；星河菜单切换卡顿约 ↓27%
- 首页剥离非关键接口对 LCP 的污染；修渲染上报与统计口径

---

## 二、一句话 / 电梯演讲（30 秒）

> 性能这块我做成了双轨：一边用 PerfMonitor 把跨页、LCP/FCP、关键接口打到 Omega，真的把列表首屏 LCP 打掉 17%、星河菜单卡顿打掉约 27%；一边沉淀性能分析 Skill，用静态分析快速给出函数级优化清单。监控负责验收，Skill 负责定位。

---

## 三、核心产出清单（面试前必背）

| # | 能力点 | 可陈述数字/事实 |
|---|---|---|
| 1 | PerfMonitor 体系 | 跨页 / 同页 / 接口 → Omega |
| 2 | 双端指标 | H5 + 星河，环境 class |
| 3 | 首页 LCP 路径 | 剥离 `privacyPopList`；`getHomeData` 打点 |
| 4 | 列表双路径 | 接口返回 + 缓存直渲；切日期口径 |
| 5 | 列表 LCP | 1400→1160ms（↓17%） |
| 6 | 菜单卡顿 | 排序逻辑，约 ↓27% |
| 7 | 稳定性埋点 | `reportRender` 修复 + 最长进入耗时 |
| 8 | 分析 Skill | 三阶段 + P0/P1/P2 规程 |

---

## 四、STAR 口述模板（合并版）

**S**：业务页慢、卡，缺少统一打点，优化难量化；静态排查也难复用。  
**T**：既要可观测的监控体系，也要可复用的分析流程。  
**A**：落地 PerfMonitor（跨页/LCP/接口/Omega）并改首页列表关键路径；沉淀性能分析 Skill 做函数级复盘。  
**R**：列表 LCP ↓17%；星河菜单卡顿约 ↓27%；形成定位→改造→验收闭环。

---

## 五、挂简历的位置建议

1. **实习经历下「性能监控与体验优化」独立小节**（推荐，用版本 B）  
2. 与 AI 降噪、OpenSpec 等并列的工程化产出  
3. 投 Agent 岗时拆出版本 C 单独写 Skill

---

## 六、相关文档

| 文档 | 用途 |
|---|---|
| [PerfMonitor与体验优化.md](./PerfMonitor与体验优化.md) | 真测轨细节 |
| [功能全面说明.md](./功能全面说明.md) | Skill 轨细节 |
| [功能理解手册.md](./功能理解手册.md) | 快速建立直觉 |
| [page-performance-analysis-面试卡片.md](./page-performance-analysis-面试卡片.md) | 刷题口述 |
