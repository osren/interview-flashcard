# error-triage 调优评测 API 手册（使用方视角）

面向**接入方团队**：不需要 clone 项目、不碰引擎代码，只通过 API 就能调优自己业务的告警判定 prompt。

> 一句话流程：**拿 `/judge` 攒标准答案 → 调 `/eval` 拿分数和失败清单 → 改自己的 prompt → 再调 `/eval` 对比**。团队全程只碰"数据集"和"自己的 prompt"两样东西。

---

## 0. 前提：先接入，有自己的 domain

调优是"对着你自己的 prompt 打分"，所以得先有 domain（路由表 `rules.js` + 判定 `prompts/`）。这步由两个 skill 生成并配置进中心：

```
/discover-triage-urls   团队名=<team>，项目路径=<你的代码库>   → <team>-urls.js（人工确认）
/onboard-triage-domain  团队名=<team>，url 清单=<team>-urls.js  → domains/<team>/{rules.js, prompts/}
```

没接入就没东西可评。接入细节见项目根 README。

---

## 1. Endpoint 一览

| Endpoint | 用途 | 会不会派发告警 |
|---|---|---|
| `POST /judge` | 单条只判定（攒 gold 草稿 / 回放） | **否**（安全） |
| `POST /eval` | 批量判定 + 对比 gold 打分 | **否**（安全） |
| `POST /triage` | 生产主链路：判定 + 派发 | **会**，评测**别用它** |
| `GET /health` | 健康检查 | — |

> ⚠️ 评测/回放一律用 `/judge` 或 `/eval`。`/triage` 会真派发告警到值班通道。

所有请求 `Content-Type: application/json`。`domain` 参数标明你是谁，服务据此路由到你的 rules/prompts（多租户为阶段二能力；阶段一可能是中心为你单独跑一个实例，此时 `domain` 由实例固定，可省略）。

---

## 2. `POST /judge` —— 只判定、不派发

**请求**：
```bash
curl -s $SVC/judge -H 'Content-Type: application/json' -d '{
  "domain": "flight",
  "alarm": {
    "url": "/esapp/flight/pay/create/v1",
    "env": "prod",
    "level": "error",
    "errorCode": "500",
    "errorMsg": "系统内部异常"
  }
}'
```

**响应**：
```json
{
  "should_report": true,
  "severity": "P1",
  "error_type": "server_error",
  "reason": "支付创建返回 500 系统内部异常，阻塞支付主流程，判 P1",
  "confidence": 0.83,
  "_category": "payment"
}
```

**`alarm` 字段**：唯一必填是 `url`（路由用）；其余（`errorCode`/`errorMsg`/`env`/`level`/`traceid`/`response` 等）都是喂给模型的判定材料，缺失时走"信息不足保守上报"。字段含义见 README 的"服务入参契约"。

**用途**：① 回放单条线上错误看判定；② **自举 gold**——拿它的输出当标准答案草稿，人工纠正后写进数据集（见下）。

---

## 3. 数据集格式

一个 JSON 数组，每个元素是一个 case：

```json
{
  "case_id": "pay-create-5xx",
  "split": "train",
  "count": 12,
  "alarm": { "url": "/esapp/flight/pay/create/v1", "errorCode": "500", "errorMsg": "系统内部异常" },
  "gold":  { "should_report": true, "severity": "P1", "error_type": "server_error" }
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `case_id` | 是 | 唯一 id，报告里按它定位 |
| `alarm` | 是 | 判定入参（同 `/judge` 的 alarm） |
| `gold` | 打分时需要 | 标准答案：`should_report` / `severity` / `error_type` |
| `split` | 建议 | `train`（调 prompt 时看）/ `holdout`（约 20%，只验证不过拟合，调优期间别看） |
| `count` | 可选 | 同指纹频次，用于验证"高频升级" |

**怎么攒数据集**：用你自己的 MCP/监控拉某 url 全部异常 → 归一成 `alarm` → **按指纹去重**成几十个 unique case → 用 `/judge` 出 gold 草稿 → 人工纠正 → 打 `split`。

---

## 4. `POST /eval` —— 批量判定 + 打分

**请求**：
```bash
curl -s $SVC/eval -H 'Content-Type: application/json' -d '{
  "domain": "flight",
  "dataset": [
    { "case_id": "pay-create-5xx", "split": "train",
      "alarm": { "url": "/esapp/flight/pay/create/v1", "errorCode": "500", "errorMsg": "系统内部异常" },
      "gold":  { "should_report": true, "severity": "P1", "error_type": "server_error" } },
    { "case_id": "pay-repeat", "split": "holdout",
      "alarm": { "url": "/esapp/flight/pay/create/v1", "errorCode": "2032", "errorMsg": "重复支付" },
      "gold":  { "should_report": false, "severity": "P3", "error_type": "business_reject" } }
  ]
}'
```

**响应**：
```json
{
  "report": {
    "train":   { "n": 1, "fn": [], "fp": [], "sevExact": 1, "sevOff1": 0, "sevOffBig": [], "typeOk": 1, "missing": [] },
    "holdout": { "n": 1, "fn": [], "fp": ["pay-repeat (判 P2)"], "sevExact": 0, "sevOff1": 1, "sevOffBig": [], "typeOk": 0, "missing": [] }
  },
  "outputs": {
    "pay-create-5xx": { "should_report": true,  "severity": "P1", "error_type": "server_error", "reason": "...", "_category": "payment" },
    "pay-repeat":     { "should_report": true,  "severity": "P2", "error_type": "data_empty",  "reason": "...", "_category": "payment" }
  }
}
```

**`report` 指标**（`train` / `holdout` 分开）：

| 字段 | 含义 |
|---|---|
| `n` | 参与打分的 case 数（有 gold 的） |
| `fn` | **漏报清单（头号指标）**：gold 该报、判成不报 |
| `fp` | 误报清单：gold 不报、判成报 |
| `sevExact` / `sevOff1` / `sevOffBig` | severity 完全一致 / 差一级 / 差多级 |
| `typeOk` | error_type 判对的数量 |
| `missing` | 没跑出判定的 case（异常） |

`outputs`：每个 case 的原始判定，供逐条看 `reason`、定位问题。

---

## 5. 调优循环

```
① 准备数据集（拉→去重→/judge 自举 gold→人工纠正→打 split）   ← 一次性
② POST /eval  → 看 report（FN 优先）+ failure 清单
③ 定位到具体哪条 prompt 规则没覆盖/写歧义 → 改自己 domain 的 prompt（配置中心）
④ 数据集不动，再 POST /eval → 对比新旧 report，确认变好且无退化
   ↺ 回到 ②，直到达标
```

**改前改后对比示例**（上例 `pay-repeat` 补上 `2032 重复支付` 的 business_reject 后）：

```
              改前        改后
FP(误报)      1/1    →    0/1   ✅
severity一致  0/1    →    1/1   ✅
```

### 5.1 谁来调 prompt —— 人机协作

不是纯人工、也不建议一上来全自动，而是 **AI 出分析和改稿、人拍板并守住 gold**。按自动化程度分三档，推荐中间档：

| 档位 | 谁改 prompt | 评价 |
|---|---|---|
| 纯人工 | 人读报告、手改 | 慢、不规模化 |
| **AI 辅助（推荐）** | AI 做错误分析 + 给具体改稿，人 review 后应用，再重跑 | 快且可控 |
| 全自动闭环 | AI 改→重跑→迭代到达标，人只设目标 + 终审 | 强，但必须上护栏 |

**分工本质**（哪步归谁）：

| 环节 | 主力 |
|---|---|
| 错误分析（为什么错、命中哪条规则） | **AI** |
| 出 prompt 改稿（改哪几行、为什么） | **AI** |
| **标 / 守 gold** | **人**（AI 可出草标，但⚠️ **不能为刷分改 gold**） |
| severity 基线 / business_reject 语义 | **人**（业务判断，有些需回源码核证据） |
| 上线前终审 | **人**（人闸门，防改坏直接进生产） |

**推荐循环**：`/eval 出报告 → 把 report+outputs 给 AI → AI 逐条归因 + 给 prompt diff → 人 review 采纳 → 数据集不动重跑对比 → 达标后人终审上线`。

**若要做全自动闭环，四道护栏缺一不可**：
1. **holdout 绝不参与调**（AI 只看 train 改，holdout 仅最终验证）→ 防过拟合；
2. **gold 冻结、AI 碰不到** → 防"改标准答案刷分"作弊；
3. **FN 和 FP 一起卡** → 否则 AI 会把 prompt 改成"一律上报"把 FN 打到 0、FP 爆掉；
4. **人闸门在上线前** → 自动循环只产候选 + 指标对比，进生产必须人点头。

> 一句话：**改 prompt 的"手"可以是 AI，但"标准答案(gold)"和"最终拍板"必须在人手里。**

---

## 6. 使用纪律（和内部同一套）

- **漏报优先**：先把 FN 压到 0/接近 0，再降误报。别为降噪把 recall 做掉。
- **数据集冻结**：一轮调优期间数据集不动，否则新旧 report 不可比。加样本 → 开新版本重建基线。
- **train 调、holdout 验**：train 一直涨而 holdout 不涨/下跌 = 过拟合，回退。
- **正负样本平衡**：真实异常里 business_reject 占多数，数据集要保留足够"真故障"正样本，否则"一律不报"也能刷高分——这正是 FN 要单独盯的原因。
- **prompt 改完需生效**：prompt 在服务启动时读入缓存，改完需重启/重载对应 domain（中心化后由平台提供重载）。

---

## 7. 你只需要碰这三样

| 你负责 | 中心提供 |
|---|---|
| 用自己的 MCP 拉数据、去重 | 引擎（路由 + 编排 + 兜底） |
| 拥有并维护自己的**数据集 + gold** | 模型网关凭证（你不用接模型） |
| 在配置中心改自己的 **prompt** | 统一的判定 API 和打分口径 |

引擎、模型、打分逻辑都在中心，接入方**零项目集成**。
