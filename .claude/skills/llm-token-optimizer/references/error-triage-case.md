# Error-Triage 实战对照：Token 优化案例

> 将 AI 监控降噪（error-triage）作为赛题 04 的「已验证案例」引用。

## 案例背景

**系统**：接口错误告警智能降噪（ai-monitor-deposer / error-triage）  
**任务**：每条告警走一次 LLM，判断该不该上报、定什么等级  
**约束**：宁可误报，不可误杀（漏报 ≈ 0）

## Token 相关设计决策

| 决策 | Token 影响 | 原因 |
|---|---|---|
| 每条告警都走 LLM | 不减少调用次数 | 判定质量优先；降本靠**单次瘦身**而非少调 |
| router 先分类 | ↓ 无效 prompt 加载 | 按 key 只拼 `_base + <key>.md` |
| user 只序列化必要字段 | ↓ input token | 不传无关 response 大段 |
| discover sync 增量模式 | ↓ 接入阶段 token | 只处理新增 url delta |
| drift-check 零 LLM | ↓ 维护阶段 token | 纯 grep 发现清单漂移 |
| temperature=0 | ↓ 重试浪费 | 判定可复现，减少解析失败重调 |
| fallback 保守上报 | ↓ 失败重试 | 解析失败直接 P2 上报，不反复调模型 |
| eval 闭环 | 降本门禁 | 改 prompt 必须过 gold 对比 |

## 六层框架映射

```
告警 JSON
  → ① router（pathname → category key）     【零 LLM 路由】
  → ② 字段裁剪（url/errorCode/errorMsg）    【上下文压缩】
  → ③ _base + key prompt 动态组装           【Prompt 瘦身】
  → ④ 统一网关模型（未来可分级）             【模型层接缝】
  → ⑤ JSON 输出 + reason 长度约束            【输出约束】
  → ⑥ 结果缓存（规划中）                     【缓存层接缝】
```

## 可引用的量化叙事（答辩用）

假设单次告警：
- 改造前：system 3000 token + user 1500 token + output 200 token = **4700 token/次**
- 改造后：router 命中 + 动态 prompt 800 token + user 400 token + output 150 token = **1350 token/次**
- **节省约 71%**（示例估算，需用真实埋点替换）

若日告警 10 万次：
- 日节省 ≈ 335M token
- 按 $0.01/1K input 粗算 ≈ **$3350/天**（仅作数量级说明）

## Hackathon 加分表述

1. **不是理论**：已在商旅告警场景有脚手架与 eval 闭环
2. **可迁移**：引擎领域无关，换 domain 即可复用到其他 LLM 任务
3. **有纪律**：降本不以漏报为代价，eval 是硬门禁
4. **可演进**：缓存、模型分级、中心化配置的接缝已预留

## 引用路径

- 功能说明：`docs/简历修改/ai 智能监控/功能全面说明.md`
- 引擎代码：`docs/简历修改/ai 智能监控/ai-monitor-deposer/src/plugins/error-triage/`
- 接入 Skill：`discover-triage-urls`（增量省 token）、`onboard-triage-domain`
