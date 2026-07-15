# 分类：订单详情（order-detail）

涉及接口（订单状态/交易记录/MAS 中台订单）：
- `/esapp/train/order/orderDetail`（订单详情/状态查询）
- `/esapp/train/order/feeDetail`（费用/交易记录，边缘）
- `/esapp/railway/refund/partRefundDetail`（部分出票交易记录，边缘）
- `/esapp/mars/cn/query-order-quantity/v1`（MAS 在途订单数量，中台，边缘）
- `/esapp/mars/cn/cancel-order/v1`（MAS 取消订单，中台，边缘）

## 判定要点

- 订单详情（orderDetail）是用户查看已购订单的主入口，基线 `P2`；若大面积无法加载订单详情 → 升 `P1`。
- `cancel-order`（MAS 取消订单）属写操作，`server_error`/`timeout` 影响用户取消 → 上报 `P1`。
- 交易记录/费用明细（feeDetail / partRefundDetail）、在途订单数量（query-order-quantity）属查询展示，基线 `P2`，高频升级。
- **预期内结果 → `business_reject`，不上报**：orderDetail `code=='2032'` 无效订单（order/detail.mpx:1933 `errorMsg:['无效的订单']`）；订单不存在、无交易记录。接口本身报错/超时/解析失败仍要上报。
