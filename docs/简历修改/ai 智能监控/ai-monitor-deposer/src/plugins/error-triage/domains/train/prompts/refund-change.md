# 分类：退票改签（refund-change）

涉及接口：
- 退票：`/esapp/railway/refund/preCheck`（退票前置校验）、`/esapp/railway/refund/queryRefundTicketCost`（退票金额查询）、`/esapp/train/refundTicket`（确认退票）、`/esapp/train/order/getRefundInfo`（退票详情）
- 改签：`/esapp/railway/change/checkChanging`（改签校验）、`/esapp/railway/change/preAuth`（改签费用明细，填单页）、`/esapp/railway/change/estimateFee`（改签费用明细）、`/esapp/railway/estimate/change`（改签场景全车次余票预估）、`/esapp/train/tripList/index`（可改签车次行程）、`/esapp/train/changeTicket`（改签发单）、`/esapp/train/order/getChangeInfo`（改签详情）、`/esapp/railway/remark/history`（改签备注历史，边缘）

## 判定要点

- 退改涉及资金（退款金额/改签差价），属交易链路，真异常基线 `P1`。
- 提交类（refundTicket / changeTicket）`server_error`、`timeout`、`dependency_error`（12306 退改下游）→ `P1`，批量 `P0`。
- 金额查询/费用明细（queryRefundTicketCost / estimateFee / change·preAuth）`data_empty` 或金额异常 → 上报，可能引发资金投诉，基线 `P1`。
- **预期内拒绝 → `business_reject`，不上报**：不可退/不可改、已退已改、超过退改时限、无可改签车次；退票 preCheck `2035` 需人证核验、`2036` 需关联 12306 账号（refund-ticket-page.mpx:881,885 分支注释）；refundTicket `10608` 需静默登录走风控（同文件:1004）；停运校验 `success && code=='0'`（正常态）。
- 详情类（getRefundInfo / getChangeInfo / remark·history）异常多为查询失败，基线 `P2`；若阻断用户查看退改进度且高频 → 升 `P1`。
