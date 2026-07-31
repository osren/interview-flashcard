# 性能监控与体验优化 · 实习产出描述

> 与 `AI智能监控降噪-实习产出描述.md` 同级  
> 覆盖双轨：**PerfMonitor 运行时监控/真测优化** + **page-performance-analysis Skill**  
> 条目格式：`简述名称：具体内容`  
> 数字口径来自同事描述，使用前请与个人实际参与度对齐

---

## 一、总述

面向商旅业务页体验问题，落地 **「静态分析 + 运行时监控」双轨性能工程**：

1. **PerfMonitor**：在业务仓搭建 `src/utils/perf-monitor.js`，跨页链路 / 同页 LCP·FCP / 关键接口耗时统一经 Omega 上报；据此优化首页、列表页与星河卡顿，形成可量化收益。  
2. **page-performance-analysis Skill**：把「读源码 → 估耗时 → 找瓶颈 → 出 P0/P1/P2」固化为可复用 Agent 规程，补齐「感觉慢但缺函数级抓手」的分析侧能力。

闭环：**Skill 收敛嫌疑 → 改代码 → PerfMonitor/Omega 验数字**。

---

## 二、分述 · PerfMonitor 与体验优化（真测轨）

| 维度 | 内容 |
|------|------|
| 监控底座 | `perf-monitor.js`；跨页 `home_to_list_complete`；同页 LCP/FCP；关键接口耗时；Omega 上报 |
| 首页 | 自建 LCP/FCP；环境 class 兼容 H5+星河；`getHomeData` 耗时；剥离拖长 LCP 的接口（如 `privacyPopList`） |
| 列表页 | 覆盖「接口返回」与「缓存命中直渲」双路径；修正切日期重渲口径；LCP **1400→1160ms（↓17%）** |
| 稳定性/卡顿 | 修复 `reportRender` 并补最长进入耗时；星河底部菜单排序卡顿改善约 **27%** |

---

## 三、分述 · 性能分析 Skill（静态轨）

| 维度 | 内容 |
|------|------|
| 分析模型 | 加载 / 交互 / 监听三阶段 |
| 耗时估算 | 网络 / 数据处理 / 渲染三套表 |
| 瓶颈库 | 串行瀑布 · 频繁触发 · 防抖节流 · 重复请求 |
| 输出 | 五段报告 + P0/P1/P2 + Web Vitals 对照 |
| 工程化 | `SKILL.md` / `skill.json` · QUICKSTART · `analyze.sh` |

---

## 四、简历可粘贴写法（推荐 · 合并双轨）

**性能监控与体验优化** | PerfMonitor / Omega / Agent Skill

- 搭建 PerfMonitor：跨页 `home_to_list_complete`、同页 LCP/FCP、关键接口耗时统一 Omega 上报；环境抽象覆盖 H5 与星河
- 首页：接入 `getHomeData` 耗时，剥离 `privacyPopList` 等拖长 LCP 的非关键路径；列表覆盖接口返回与缓存直渲双路径，修正切日期重渲口径，LCP 1400→1160ms（↓17%）
- 稳定性：修复 `reportRender` 并补最长进入耗时；优化星河底部菜单切换排序逻辑，卡顿约 ↓27%
- 分析侧沉淀 page-performance-analysis Skill：三阶段函数耗时复盘 + P0/P1/P2，与监控数字形成「定位→改造→验收」闭环

---

## 五、相关文档

- `docs/简历修改/页面性能分析/PerfMonitor与体验优化.md`
- `docs/简历修改/页面性能分析/功能全面说明.md`
- `docs/简历修改/页面性能分析/功能理解手册.md`
- `docs/简历修改/页面性能分析/resume-page-performance-analysis.md`
- `docs/简历修改/页面性能分析/page-performance-analysis-面试卡片.md`
