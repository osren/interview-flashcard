# 分类：支付（payment）

涉及接口（支付/支付鉴权/抢票鉴权 —— 资金 + 下单主流程核心）：
- `/esapp/railway/makePay/index`（支付车票）
- `/esapp/railway/makePay/getPayChannel`（获取支付渠道）
- `/esapp/railway/makePay/getPayLink`（获取第三方支付链接）
- `/esapp/railway/makePay/confirm`（确认支付结果，二次确认）
- `/esapp/train/getPayType`（支付方式鉴权）
- `/esapp/railway/booking/preAuth`（下单前预订鉴权，含填单预估）
- `/esapp/railway/payment/authStatus`（支付宝企业码授权状态，边缘）
- `/esapp/railway/grab/seatAuth`（抢票座席鉴权）
- `/esapp/railway/grab/booking/preAuth`（抢票预订前鉴权）

## 判定要点

- 支付链路属于**资金 + 下单主流程**，真异常基线 `P1`，大面积/批量失败或资金不一致风险（confirm 异常）升 `P0`。
- `dependency_error`（支付渠道、12306、支付宝企业码下游异常）若导致用户无法完成支付 → 上报 `P1`。
- 鉴权类（getPayType / booking·preAuth / authStatus / grab seatAuth）失败若**阻断进入支付**，按 `P1`；若是用户无权限/未授权的预期拒绝，判 `business_reject` 不上报。
- **预期内轮询/拒绝 → `business_reject`，不上报**：确认支付（confirm）返回未支付/待回调属预期轮询态；preAuth 侧 `9507` 坐席二次确认 / `9504` 乘车人核验待处理（make-order/index.mpx:2795,2799）；用户主动放弃支付、超时未支付被取消。（注：`2032` 无效订单是订单详情的码，不在支付链路，见 order-detail。）
- 涉及金额计算/扣款的 `server_error`、`data_empty`（金额为空）一律上报，置信度不足也保守上报。
