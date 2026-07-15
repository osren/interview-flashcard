# 分类：查询（query）

涉及接口（余票/车次/中转/预估/车站）：
- `/esapp/railway/train/queryLeftTicket`（直达车次余票列表）
- `/esapp/railway/train/transferLeftTicket`（中转车次列表）
- `/esapp/train/queryLeftTicketByTrainNo`（按车次号余票查询）
- `/esapp/railway/estimate/direct`（全车次固定日期余票 direct）
- `/esapp/train/estimate/indexV2`（全车次固定日期余票，车次详情）
- `/esapp/train/transfer/estimate/indexV2`（中转全车次固定日期余票）
- `/esapp/railway/station/queryStation`（经停/停靠站信息，边缘）
- `/esapp/category/transfer/stateless`（中转无状态查询，中台，边缘）

## 判定要点

- **余票查询（queryLeftTicket / transferLeftTicket / queryLeftTicketByTrainNo）是下单主流程的必经入口，异常一律判 `P1`**（含 `param_validate_failed` / validate failed）。查询挂了等于阻塞下单，影响面与下单/支付同级，**不要因为名义上是"查询"而降级**。
- 全车次余票/价格预估（estimate/direct、estimate/indexV2）异常基线 `P2`；若导致下单页无法展示价格/余票而阻断进入下单 → 升 `P1`。
- 经停站、中转无状态查询（queryStation / transfer/stateless）属辅助信息，基线 `P3`；高频或批量异常升 `P2`。
- **预期内空结果 → `business_reject`，不上报**：无符合条件车次、查无余票、售罄——这类由列表空或坐席不可选表达（`success && code=='0'` 判成功，属正常展示态，非故障）。但接口本身报错/超时/解析失败要上报。
