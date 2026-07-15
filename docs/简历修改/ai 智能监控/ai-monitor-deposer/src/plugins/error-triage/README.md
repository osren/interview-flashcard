# error-triage 接口错误上报判定服务

一个常驻服务：接收接口错误告警，**每条都走一次 LLM** 判定该不该上报、定什么等级，返回标准 JSON。
引擎与业务解耦——通用引擎一份，各团队各带一个 `domain`（路由表 + prompts）。

---

## 1. 目录结构

```
error-triage/
├── router.js      通用：createRouter(rules, fallbackKey) → route(url)=>key
├── triage.js      通用：createTriage({route, promptsDir, llm}) → triage(alarm)
├── llm.js         通用：createGatewayLLM() → 接公司大模型网关的 llm 适配器
├── pipeline.js    按 DOMAIN 加载 domain，拼出 triage，导出 handleAlarm
├── server.js      HTTP 入口（POST /triage）
├── consumer.js    Kafka 入口（kafkajs）
└── domains/
    └── train/         一个 domain = 一个团队/业务
        ├── rules.js            url → category key 路由表
        └── prompts/
            ├── _base.md        公共片段：输出 schema + error_type 枚举 + 全局规则
            ├── payment.md … display.md   各 category 的业务判定要点
```

引擎（router/triage/llm）零业务痕迹；火车票全部在 `domains/train/`，和别的团队完全平等。

---

## 2. 运行前提

- **Node 18+**（用到内置 `fetch`、ESM 顶层 `await`）。
- 运行环境为 **ESM**：`package.json` 里 `"type": "module"`。
- Kafka 入口需安装 `kafkajs`：`npm i kafkajs`（仅用 `consumer.js` 时需要）。

---

## 3. 环境变量

| 变量 | 用途 | 默认 |
|---|---|---|
| `DOMAIN` | 加载哪个 domain（`domains/<DOMAIN>/`） | `train` |
| `LLM_GATEWAY_ENDPOINT` | 大模型网关地址（**必填**） | — |
| `LLM_GATEWAY_KEY` | 网关鉴权凭证 | — |
| `LLM_MODEL` | 模型名（建议小模型即可） | `gpt-4o-mini` |
| `PORT` | HTTP 端口（server.js） | `8080` |
| `KAFKA_BROKERS` | Kafka broker 列表，逗号分隔（consumer.js） | — |
| `KAFKA_TOPIC` | 订阅 topic | `alerts` |
| `KAFKA_GROUP` | 消费组 | `error-triage` |
| `KAFKA_CONCURRENCY` | 跨分区并发度（= LLM 调用并发旋钮） | `4` |

> 接入网关前，先按 `llm.js` 里 3 处 `TODO` 改鉴权头 / 请求体字段 / 响应取文本路径。

---

## 4. 启动

**HTTP 入口：**
```bash
DOMAIN=train \
LLM_GATEWAY_ENDPOINT=https://your-gateway/v1/chat \
LLM_GATEWAY_KEY=xxx \
node src/plugins/error-triage/server.js
```

**Kafka 入口：**
```bash
DOMAIN=train \
LLM_GATEWAY_ENDPOINT=... LLM_GATEWAY_KEY=xxx \
KAFKA_BROKERS=broker1:9092,broker2:9092 KAFKA_TOPIC=alerts \
node src/plugins/error-triage/consumer.js
```

两个入口可同进程或分进程跑，都只调用同一个 `handleAlarm`。

---

## 5. 调用与返回

**HTTP 调用：**
```bash
curl -XPOST localhost:8080/triage \
  -H 'Content-Type: application/json' \
  -d '{"url":"/esapp/railway/train/queryLeftTicket","env":"prod","level":"error","errorMsg":"validate failed","count":12}'
```

**输入告警字段**（都可选，缺字段也会判，信息不足倒向上报）：

| 字段 | 说明 |
|---|---|
| `url` | 出错接口路径，**路由依据**。缺失则路由到兜底 key |
| `env` | `prod` / `pre` / `test` 等 |
| `level` | 告警级别（来源系统的） |
| `errorCode` | 错误码 |
| `errorMsg` | 错误信息 |
| `count` | 同指纹近期出现次数（用于高频升级判断） |

**返回：**
```json
{
  "should_report": true,
  "severity": "P1",
  "error_type": "param_validate_failed",
  "reason": "余票查询属下单主流程，validate failed 判 P1",
  "confidence": 0.9,
  "_category": "query"
}
```

| 字段 | 说明 |
|---|---|
| `should_report` | 是否上报（`false` = 判为噪音，已丢弃，不会派发） |
| `severity` | `P0` / `P1` / `P2` / `P3` |
| `error_type` | `business_reject` `param_validate_failed` `auth_failed` `timeout` `server_error` `dependency_error` `network_error` `data_empty` `unknown` |
| `reason` | 中文判定依据 |
| `confidence` | 0~1 |
| `_category` | 路由命中的 category（引擎附加） |

Kafka 入口不返回，结果直接进 `pipeline.js` 的 `dispatch`（目前 `console.log`，需接你们的上报通道）。

---

## 6. 行为与保证

- **每条告警 = 一次 LLM 调用**（前期流量小，未做缓存；后续缓存只会加在 `pipeline.js` 的 `handleAlarm` 里）。
- **永不吞告警**：`llm` 超时/网关报错/输出无法解析 → 一律兜底 `should_report=true, severity=P2`，保守上报。
- **信息不足倒向上报**：缺关键字段时上报而非放过（规则写在各 domain 的 `_base.md`）。
- **按 pathname 路由**：引擎先把 url 归一成 pathname（去掉 host 和 query），避免 query 里的 token/sig blob 误匹配规则。
- **归属判别（核心 vs 非核心）**：配了 `ownedPrefixes` 后，路径不在自有前缀内的接口（营销中台、其他业务线、三方等）直接路由到 `non-core`（基线 P3，单点错误默认不上报，仅高频升级）。**保守上报只作用于"我们自己的接口"，三方接口不背锅。**
- **路由命中靠前优先 + 未命中兜底**：自有域内没覆盖到的新接口不会漏判，先按 `fallbackKey` 判（保守上报）。
- **Kafka 位移安全**：`handleAlarm` 永不抛错，消息总能正常提交，不会因失败无限重投打爆网关；脏消息（JSON 解析失败）跳过。

---

## 7. 新团队接入（不改任何引擎代码）

三步：

**1）建路由表 `domains/<你的团队>/rules.js`**
```js
export const fallbackKey = 'order';        // 自有域内未命中兜底到哪个 category
export const ownedPrefixes = ['/esapp/'];  // 自有接口路径前缀；不在此前缀内 → non-core
export const rules = [
  // 有序：命中靠前优先，特例放前面（按 pathname 匹配）
  { pattern: '/pay/',        key: 'payment' },   // 字符串 = pathname.includes 匹配
  { pattern: /\/order\/\d+/, key: 'order' },     // 也支持正则
  // ...
];
```

**2）建 prompts `domains/<你的团队>/prompts/`**
- `_base.md`：直接复制 `domains/train/prompts/_base.md`，输出 schema、`error_type` 枚举、全局降噪规则本就通用，顶多改标题和 severity 基线举例。
- `<key>.md`：你 `rules.js` 里出现的每个 `key` 各一个文件，写该类的业务判定要点（哪些算 `business_reject`、severity 基线等）。**这步是唯一真正的人工成本。**
- `non-core.md`：配了 `ownedPrefixes` 就需要它（处理非自有/三方接口）。可直接复制 `domains/train/prompts/non-core.md`。

**3）启动**
```bash
DOMAIN=<你的团队> LLM_GATEWAY_ENDPOINT=... node src/plugins/error-triage/server.js
```

> category key 自定，只要 `rules.js` 的 key 和 `prompts/<key>.md` 文件名对得上即可；火车票用的是 payment/order/refund-change/query/user-auth/order-detail/display + non-core，可参考但不强制。
> 不想做归属判别就别导出 `ownedPrefixes`（或留空数组），所有接口都走正常规则。

---

## 8. 自定义判定逻辑

判定逻辑全在 prompt 里，**不改代码**：
- 跨 category 的通用规则（输出格式、错误枚举、信息不足上报、高频升级、env 策略）→ 改 `_base.md`。
- 某一类的业务规则（如"余票查询异常判 P1"）→ 改对应 `<key>.md`。

修改 prompt 后重启服务生效（`createTriage` 启动时读取并缓存 prompt）。

---

## 9. 后续演进（接缝已留好）

- **缓存 / 指纹去重**：加在 `pipeline.js` 的 `handleAlarm` 内，引擎与入口都不动。
- **Prompt caching**：`system = _base + <key>.md` 是稳定前缀，接网关支持的缓存可大幅降本提速。
- **批处理 / 异步队列 / 限流**：在入口或 `handleAlarm` 层扩展，`triage` 判定核不变。
```
