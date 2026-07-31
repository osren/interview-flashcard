# 性能监控与体验优化 · 文档索引

> **双轨**：PerfMonitor（运行时真测）+ `page-performance-analysis` Skill（静态分析）  
> 闭环：Skill 定位 → 改代码 → Omega 数字验收

---

## 沉淀文档（按阅读顺序）

| 文档 | 用途 | 建议读者 |
|------|------|----------|
| [功能理解手册.md](./功能理解手册.md) | 大白话：Skill + PerfMonitor | 第一次接触 |
| [PerfMonitor与体验优化.md](./PerfMonitor与体验优化.md) | 监控体系 / 首页列表 / 量化收益 | 写简历、讲结果 |
| [功能全面说明.md](./功能全面说明.md) | Skill 完整技术说明 + 双轨总览 | 深挖 |
| [resume-page-performance-analysis.md](./resume-page-performance-analysis.md) | 简历多版本 + 电梯演讲 | 写简历 |
| [page-performance-analysis-面试卡片.md](./page-performance-analysis-面试卡片.md) | 24 道问答（含 PerfMonitor） | 刷题口述 |
| [../页面性能分析Skill-实习产出描述.md](../页面性能分析Skill-实习产出描述.md) | 实习产出条（合并双轨） | 贴周报/简历 |

---

## 同事口径 · 核心数字（速查）

| 项 | 内容 |
|----|------|
| 监控 | `perf-monitor.js`：跨页 `home_to_list_complete`、LCP/FCP、关键接口 → Omega |
| 首页 | H5/星河双端自监控；`getHomeData`；剥离 `privacyPopList` 等拖长 LCP 的路径 |
| 列表 | 接口返回 + 缓存直渲；切日期口径修正；LCP **1400→1160ms（↓17%）** |
| 卡顿 | 星河底部菜单排序优化，约 **↓27%**；`reportRender` 修复 + 最长进入耗时 |

---

## Skill 原包

```
page-performance-analysis/
├── SKILL.md / skill.json
├── README.md / QUICKSTART.md / INDEX.md
├── examples/usage-examples.md
└── scripts/analyze.sh
```

快速开始：[page-performance-analysis/QUICKSTART.md](./page-performance-analysis/QUICKSTART.md)

---

## 与 AI 监控降噪文档的对应关系

| AI 监控降噪 | 本目录 |
|-------------|--------|
| 功能全面说明 | ✅ + 第 0 节双轨总览 |
| 功能理解手册 | ✅ 含第五部分 PerfMonitor |
| resume-*.md | ✅ 合并双轨写法 |
| *-面试卡片.md | ✅ 18→24 题（补真测轨） |
| 运行时能力 | ✅ PerfMonitor与体验优化.md（业务仓，非 Skill 内嵌） |
