# Token 优化模式库

> 按需加载。配合 `SKILL.md` 六层框架使用。

## 目录

1. [六类浪费详解](#1-六类浪费详解)
2. [路由模式](#2-路由模式)
3. [上下文压缩模式](#3-上下文压缩模式)
4. [Prompt 瘦身模式](#4-prompt-瘦身模式)
5. [RAG 优化模式](#5-rag-优化模式)
6. [输出约束模式](#6-输出约束模式)
7. [缓存模式](#7-缓存模式)
8. [Eval 验证模式](#8-eval-验证模式)

---

## 1. 六类浪费详解

### 1.1 上下文过长

**信号**：`messages` 数组越来越长；user payload 含完整 API response / 整页 HTML / 全量日志。

**改造**：
```javascript
// ❌ 全量传入
const user = JSON.stringify(alarm);

// ✅ 字段裁剪
const user = JSON.stringify({
  url: alarm.url,
  errorCode: alarm.errorCode,
  errorMsg: alarm.errorMsg,
  count: alarm.count,
  traceid: alarm.traceid,
});
```

### 1.2 Prompt 冗余

**信号**：system prompt > 2000 token；多个场景共用一份超长 prompt；规则重复出现。

**改造**：
```
system = _base.md（全局 200 token）
       + category.md（按路由 key 加载 100–300 token）
// 而非每次加载全部 10 个 category 的 prompt
```

### 1.3 RAG 不精准

**信号**：top-k 召回 5 个各 2000 token 的 chunk；命中率低但 token 高。

**改造**：两阶段召回
```
Stage 1: 标题+摘要索引 → 选 3 个候选（各 50 token）
Stage 2: 只对候选拉正文 chunk（各 300 token）
// 总计 ~1000 token，而非 10000
```

### 1.4 模型路由不当

**信号**：所有请求走 GPT-4 / 最大模型；简单 yes/no 也调大模型。

**改造**：
```
if (complexity === 'simple') → 规则 / 小模型
if (complexity === 'medium')  → 中等模型
if (complexity === 'complex') → 大模型
```

### 1.5 输出不受控

**信号**：模型返回长段 markdown；reason 字段经常超 500 字。

**改造**：
```json
{
  "should_report": true,
  "severity": "P1",
  "error_type": "param_validate_failed",
  "reason": "≤80 字中文依据",
  "confidence": 0.86
}
```

### 1.6 失败重试

**信号**：解析 JSON 失败就原样重调；工具超时无限 retry。

**改造**：
```
try parse → fail → fallback 保守结果（1 次）
// 而非 while(retry < 3) 原 prompt 重调
```

---

## 2. 路由模式

### 2.1 前缀归属（error-triage 模式）

```
pathname 归一 → ownedPrefixes 判别 → 有序规则匹配 → prompt key
```

- 非自有前缀 → 直接 `non-core`（一条规则，零 LLM 歧义）
- 自有前缀内未命中 → `fallbackKey` 保守处理

### 2.2 复杂度路由

| 输入特征 | 路由 |
|---|---|
| 结构化字段齐全 + 规则可覆盖 | 规则引擎 |
| 需语义理解但单轮 | 小模型 |
| 多步推理 / 长上下文 | 大模型 |

### 2.3 零 LLM 哨兵

纯 grep / 规则检查（如 `drift-check.sh`）挂 CI，**零 token** 发现清单漂移。

---

## 3. 上下文压缩模式

### 3.1 对话摘要

```
每 5 轮 → 用轻量模型摘要历史 → 替换为 1 条 summary message
保留最近 2 轮原文
```

### 3.2 增量处理（sync 模式）

```
delta = 新项目 url − 已有清单 url
只对 delta 做语义分类
// token ∝ 新增量，而非全量
```

### 3.3 结构化替代自然语言

```
❌ "用户于 2024-01-15 14:30 下单，商品是..."
✅ { "action": "order", "time": "2024-01-15T14:30", "sku": "X" }
```

---

## 4. Prompt 瘦身模式

| 技巧 | 示例 |
|---|---|
| 删范例冗余 | 每类 1 个正例 + 1 个反例，不要 5 个 |
| 指令表格化 | 用表格代替长段落描述 severity 规则 |
| 引用而非内嵌 | 业务码清单放外部，prompt 只写「见 rules.js」 |
| 分层加载 | base 写通用原则，category 写特例 |

**反模式**：为防 undertrigger 把 skill/prompt 写得过长——skill 本身也要遵守「精简优先」。

---

## 5. RAG 优化模式

```
Query → HyDE/改写（可选，小模型）
     → 向量召回 top-20 标题
     → Rerank top-3
     → 只注入 top-3 正文 chunk
     → 生成
```

**关键指标**：recall@3 准确率、平均注入 token 数。

---

## 6. 输出约束模式

```javascript
// prompt 末尾
// 只输出 JSON，不要 markdown 包裹。reason 不超过 80 字。

// 解析侧
const parsed = extractJSON(raw);
if (!parsed) return fallbackConservative();
```

---

## 7. 缓存模式

| 类型 | Key | TTL |
|---|---|---|
| 精确指纹 | hash(url+errorCode+errorMsg) | 5–15 min |
| 语义缓存 | embedding(query) 相似度 > 0.95 | 1 h |
| Prompt 缓存 | 启动时读入 prompts/ | 进程生命周期 |

---

## 8. Eval 验证模式

```
datasets/<domain>.jsonl   # gold 标注
run.js                    # 批量跑模型
score.js                  # 对比 baseline，输出 report
```

**验收门槛示例**：
- input token P50 ↓ ≥ 40%
- 准确率下降 ≤ 1%
- 漏报率不升（告警场景）
