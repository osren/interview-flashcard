# 分类：非核心 / 三方接口（non-core）

凡是**不属于火车票自有域**（路径不以 `/esapp/` 开头）的接口都路由到这里，例如：
- 营销/积分中台：`/marketing/eos/bcoupon/point/app/train/finishOrderPoint`（下单积分，前端 catch 吞错）
- 推荐中台：`/eos/eos/rule/api/recommendBooking/getRecommendBookingInfo`（推荐预订信息，silent 静默请求）
- 其他业务线、埋点、客服、广告、第三方 SDK 等被火车票页面调用、但非火车票后端负责的接口。

> 经核查火车票的非自有接口均为失败放行/弱业务，无一阻塞主流程（不存在酒店 `/qingfeng/intercept` 那种"失败即拦下单"的拦截型接口，故无需提升进 `ownedPrefixes`）。

## 判定要点

- 这些接口**不在火车票核心链路上，也不归我们负责**，挂了通常不该 page 我们的值班。真异常基线 **P3**。
- **单点错误默认降噪**：`network_error`（ERR_NETWORK）、客户端错误、`silent=true` 的静默请求、单次 4xx/5xx 等，大概率是用户弱网或依赖方偶发抖动 → 判 `business_reject`，`should_report=false`。
- **只有同指纹高频/大面积**（count 偏高，或明显批量）才升级到 `P2` 上报——此时疑似依赖方服务整体异常、影响了我们页面的展示，值得知会。
- 升级上报时，`reason` 注明"**非自有接口，疑似依赖方（<域名/业务>）异常**"，方便直接转给对应团队，而不是我们自己排查。
- 不要因为它兜底进了判定流程就按核心接口对待；归属边界由 domain 的 `ownedPrefixes` 决定。
- 例外：若该三方接口**确实阻断了我们的核心流程**（如下单页强依赖某营销校验，拿不到结果进不去下单），按受影响的核心流程升级，并在 reason 说明依赖关系。
