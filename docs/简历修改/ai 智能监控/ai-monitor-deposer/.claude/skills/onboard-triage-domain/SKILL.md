---
name: onboard-triage-domain
description: 为 error-triage 错误上报判定服务生成一个新团队/业务的 domain 骨架（rules.js 路由表 + prompts 判定文件）。当用户要"接入 error-triage""新增一个 triage domain""给某团队/业务生成告警判定 prompt""根据一份接口/urls 清单生成路由表和 prompt"时使用。输入是一份接口 url 清单，输出是 src/plugins/error-triage/domains/<team>/ 下的完整骨架。
---

# 接入 error-triage：生成一个新 domain 骨架

把一份接口 url 清单，转成 `error-triage` 服务能直接加载的一个 domain：
`src/plugins/error-triage/domains/<team>/{ rules.js, prompts/_base.md, prompts/non-core.md, prompts/<key>.md... }`。

引擎（router/triage/llm/pipeline/server/consumer）**不要动**，本 skill 只产出 `domains/<team>/` 下的文件。

## 0. 先确认输入（缺了就问用户）

- **团队/业务名**（domain 目录名，kebab-case，如 `hotel`、`flight`）。
- **接口 url 清单**：文件路径（如某个 `urls.js` 或 discover-triage-urls 产出的 `<team>-urls.js`）或直接粘贴。**优先用 discover 的产物**——它带链路级语义和主流程链，是 prompt 贴合业务的原料。
- **自有接口前缀** `ownedPrefixes`：若用户没说，从清单里所有 url 的公共路径前缀推断（如都为 `/esapp/` 则取它），并跟用户确认。不在此前缀内的接口将归 `non-core`。
- **业务的主流程链 + 专属高危轴**：从清单头部（discover 已推断）或问用户拿到。预订类=搜索→下单→支付→出票→退改；其它业务用它自己的链路。有无专属高危轴（如网约车安全类天然 P0）。**这决定 `_base.md` 的 severity 基线怎么写，别默认套预订。**
- **上报侧是否只投递正式环境告警**：很多接入方在源头/代码层就过滤，只把 `prod` 告警投进 triage。**这决定 `_base.md` 里 env 规则怎么写**（见第 3 步的部署槽）：prod-only 就写不变量声明、不写 test 降级（否则是永不触发的死逻辑）；多环境都会进来才写 prod优先/test降级。缺了就问用户。
- **category 方案**：默认沿用火车票的分类思路（按业务链路分：支付/下单/查询/详情/鉴权/展示…），也允许用户自定义。category key 用 kebab-case。

读现有 `src/plugins/error-triage/domains/train/` 作为风格与结构的范本。

## 1. 给每个 url 归类

按**路径语义**把每个 url 分到一个 category key：
- 资金/支付链路 → `payment`；下单主流程 → `order`；退票改签 → `refund-change`；
  查询/列表/预估 → `query`；登录注册/鉴权/实名 → `user-auth`；订单详情/记录 → `order-detail`；
  纯展示/弱业务 → `display`。
- 这套是参考，不强制；按目标业务的实际链路调整 category。
- 拿不准的归到将作为 `fallbackKey` 的核心兜底类（通常是 `order` 或该业务的主流程类）。

## 2. 生成 `rules.js`

导出 `fallbackKey`、`ownedPrefixes`、`rules`。**rules 顺序至关重要：命中靠前优先**。

```js
export const fallbackKey = 'order';          // 自有域内未命中兜底（保守上报，别漏自己的接口）
export const ownedPrefixes = ['/esapp/'];    // 自有前缀；之外的接口 → non-core
export const rules = [
  // 特例必须排在宽松规则之前，否则会被吞
  { pattern: '/change/stopTraffic/', key: 'order' },
  // 按 category 分组，从具体到宽松
  { pattern: '/makePay/', key: 'payment' },
  // 字符串 = pathname.includes 匹配；也支持正则 { pattern: /\/order\/\d+/, key: 'order' }
];
```

关键规则（务必遵守）：
- **匹配的是 pathname**（引擎已去 host/query），所以 pattern 写路径片段即可，不要带 query。
- **子串包含陷阱**：`'/change/'` 不会匹配 `/changeTicket`（无尾斜杠），这类要单独加 `'/changeTicket'`；反之像 `'/booking/preAuth'` 会同时命中 `/grab/booking/preAuth`，确认归类一致即可。
- **特例前置**：当一个具体 url 的归类与某条宽松规则冲突时（如某 `/user/xxx` 实际属下单而非 user-auth），把具体规则排到宽松规则前面。
- **不要给 `fallbackKey` 写显式宽松规则**去兜全部，留给兜底逻辑，未覆盖的自有新接口才能保守落到 fallbackKey。
- **被提升的非自有前缀路径**：若 discover 清单标了某个非自有前缀接口"已提升进 ownedPrefixes"（因它阻塞主流程），照做两步：① 把该**具体路径**加进 `ownedPrefixes`（如 `['/esapp/', '/qingfeng/qingfeng/core/hotel/intercept']`）——引擎归属判别在规则前，不加就直接落 non-core；② 在 `rules` 里给它一条映射到核心 category（如 `{ pattern: '/qingfeng/qingfeng/core/hotel/intercept', key: 'order' }`）。两者缺一：只加规则不加前缀 → 仍落 non-core；只加前缀不加规则 → 落 fallbackKey（也在自有域内，可接受但不精确）。

生成后**自检**：在脑中（或写个临时 node 片段用 `createRouter` 跑一遍）逐条验证每个输入 url 路由到预期 key，重点查特例和子串陷阱。

## 3. 生成 prompts

目录 `domains/<team>/prompts/`：

- **`_base.md`**：不是照抄 train，而是「**通用核 + 业务槽**」——通用核直接复用，业务槽用 discover 摘到的语义填。
  - **通用核（原样复用，不要改）**：输出 JSON schema、`error_type` 枚举、全局降噪规则（信息不足默认上报、同指纹高频升级、business_reject 不上报）。这些跨业务真通用。
  - **业务槽（按目标业务填，别留 train 的预订例子）**：
    - 标题、业务一句话定位。
    - **severity 基线**：按该业务的**主流程链**举例（预订=阻断下单/支付=P0/P1；其它业务用它自己的主流程链）。若 discover 标出了**业务专属高危轴**（如网约车安全/一键报警），在 _base 里写明这类天然 P0，不受"是否阻塞交易"约束。
    - **business_reject 语义**：用 discover 捕获的「该业务什么算正常拒绝」替换预订举例（无票/已退改 → 如网约车的无司机应答/超服务区）。
  - **部署槽（依接入方而定，不是通用核）**：
    - **env 策略**：按第 0 步确认的结果写——上报侧 **prod-only** 就写一句不变量声明（`本服务只接收正式环境告警，env 恒为 prod，无需按环境降级`），**不要写 test 降级**（永不触发的死逻辑，还误导人以为过滤在 prompt 层）；确会收到多环境告警时才写 `prod 优先 / test 降级`。
  - 拿不准业务槽就留 `<!-- TODO -->` 并提示人工，别拿 train 的预订语义充数。
- **`non-core.md`**：配了 `ownedPrefixes` 就**复制** `domains/train/prompts/non-core.md`，把举例换成该业务可能遇到的三方/中台接口。基线 P3、单点默认不上报、仅高频升级的逻辑保留。
- **每个 category 一个 `<key>.md`**（key 必须和 `rules.js` 里出现的 key 一一对应），用统一结构生成**草稿**：

```markdown
# 分类：<中文名>（<key>）

涉及接口：
- `<path>`（<这个接口干嘛的>）
- ...

## 判定要点
- severity 基线：<P0/P1/P2/P3>。 <!-- 依据 discover 的核心/边缘标注 + 主流程链草拟；人工确认该类影响面 -->
- 哪些算 business_reject（预期内拒绝，不上报）：<用 discover 捕获的该链路"正常拒绝"语义草拟> <!-- 人工补全 -->
- server_error/timeout/dependency_error 的处理与升级条件：<...>
```

- **优先用 discover 产物填草稿**：`涉及接口` 用清单里该分组的 url + 语义；severity 基线用 discover 的核心/边缘标注；business_reject 用它捕获的链路级"正常拒绝"语义。让草稿贴该业务，而非千篇一律。
- **business_reject 码只转抄「带证据」的条目，并把溯源带进 prompt**：只写 discover 清单里附了 `(文件:行 + message)` 证据的码；清单**没给证据的码不要写进 prompt**（防止无中生有）。转抄时把 `(文件:行)` 作为注释保留，让 prompt 自带溯源、复核者能一眼回源。discover 已按规矩逐字取证并自检过的码，onboard **直接采信、不重复核验**——核验已前移到摘取阶段，这里只做忠实转抄。
- 凡最终仍需业务拍板的 severity 基线、business_reject 清单，用 `<!-- TODO -->` 标出，提示人工确认。若 discover 没提供某项语义，别编，留 TODO。

## 4. 产出"待人工确认清单"

生成完后，给用户列出**必须人工拍板**的点（不要假装已经定好）：
1. `ownedPrefixes` 是否正确划定了"自有 vs 三方"边界。
2. 每个 category 的 **severity 基线**。
3. 每个 category 的 **business_reject 清单**（哪些错误码/场景是预期内、不上报）。
4. 有歧义的 url 归类、以及 rules 里的**特例排序**是否符合预期。

## 5. 启动方式（告诉用户）

```bash
DOMAIN=<team> LLM_GATEWAY_ENDPOINT=... LLM_GATEWAY_KEY=... node src/plugins/error-triage/server.js
```

## 注意
- 只生成 `domains/<team>/` 下的文件，不碰引擎代码。
- key、文件名、`rules.js` 三者必须对得上：每个 rule 的 key 都要有对应 `prompts/<key>.md`，否则运行时读不到 prompt。
- 生成的是**草稿**，明确告知用户 severity/business_reject 需人工微调后再上线。
