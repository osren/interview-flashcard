# 分类：下单（order）—— 默认兜底分类

涉及接口（下单主流程：填单/校验/占座/出票轮询）：
- `/esapp/railway/base/fillPage`（下单基础数据）
- `/esapp/train/makeOrder`（购票下单）
- `/esapp/railway/makeOrder/index`（预订发单，智能中转）
- `/esapp/railway/train/verify`（车次时刻校验，下单前）
- `/esapp/train/user/identityInfoCheck`（下单前乘车人身份核验）
- `/esapp/railway/auth/check`（下单前最后一次校验）
- `/esapp/train/user/reverse`（预定登录态校验）
- `/esapp/railway/order/getOrderStatus`（出票轮询订单状态）
- `/esapp/train/cancelBefore`（出票前取消）
- `/esapp/train/change/stopTraffic/check`（停运核验，属下单前置）

> 未在任何分类命中的自有 url 兜底进入本分类（order），保守上报，别漏自己的接口。

## 判定要点

- 下单是核心交易主流程，真异常基线 `P1`；`makeOrder` / `makeOrder/index`（占座出票）大面积失败 → `P0`。
- `param_validate_failed`（validate failed）在下单链路通常代表前置数据异常或接口契约问题，应上报，基线 `P1`。
- `server_error` / `timeout` / `dependency_error`（12306 出票下游）阻断出票 → `P1`，批量则 `P0`。
- **出票轮询（getOrderStatus）的中间态属预期，不要误报**：`102` 占座中 / `105` 出票中 / `301` 改签占座中 / `303` 改签中 / `401` 退票中 均为正常轮询中间态（`BaseOrderStatus` 枚举，自有包 @didi/es-train-foundation/lib/constant/orderDetail.js:10-26）→ `business_reject`，不上报；仅当轮询接口本身报错/超时或最终落到失败态才上报。
- **下单预期内拒绝 → `business_reject`，不上报**（make-order 密集分支，均为预期业务态）：
  - `3019` 已预订成功去支付、`3020` 重复下单、`3026` 12306 占座取消次数耗尽、`2022` 已售罄需换坐席、`2023` 距发车太近需换车次（中转=不足30分钟）、`2035` 需强制人脸核验、`3033` 可继续抢票、`3037` 儿童票拦截、`3038` 代客下单支付方式受限、`7004` 支付宝企业码未授权、`10608` 需静默登录；
  - preAuth 侧 `9507` 坐席二次确认、`9504` 乘车人核验待处理；identityInfoCheck `code!=0` 核验未通过。
  - （以上码均已回源码逐条核验，依据 make-order/index.mpx:4885-5045 各分支的 message/动作。）
- 兜底命中（未知 url）且信息不足时，遵循公共片段全局规则：保守上报，`severity` 至少 `P2`。
