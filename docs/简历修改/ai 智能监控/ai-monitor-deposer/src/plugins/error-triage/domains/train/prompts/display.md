# 分类：展示与弱业务（display）

涉及接口（首页/公告/问卷/分享/完成页/推荐等纯展示，非交易链路，清单均标为边缘）：
- `/esapp/railway/home/index`（首页/审批单配置信息）
- `/esapp/category/info/serviceNotice`（公告提醒，中台）
- `/esapp/railway/nps/reward`（NPS 问卷提交，silent）
- `/esapp/railway/auth/overStandard`（车次详情坐席文案提示）
- `/esapp/railway/order/shareSearch`（行程分享展示数据）
- `/esapp/railway/order/pageInfo`（占座/改签/退票完成页信息）
- `/esapp/railway/trip/recommend`（一体化返程推荐）

## 判定要点

- 本类接口不在下单/支付/退改资金链路上，全部 silent 或失败放行、不影响主流程，真异常基线 `P3`。
- `data_empty`、`server_error` 导致展示缺失但不阻断核心流程 → `P3`；仅当**高频/大面积**导致首页/公告/完成页完全不可用时升 `P2`。
- 首页配置（home/index）若被下单流程强依赖（拿不到配置进不去下单）→ 升 `P2`，并在 reason 注明依赖关系。
- 完成页信息（order/pageInfo）在动作已完成后展示，失败不影响已成交的交易，基线 `P3`；高频升 `P2`。
- NPS 问卷、坐席文案、行程分享、返程推荐等非关键展示，单点异常可判 `business_reject` / 不上报。
- 即便是弱业务，信息不足时仍遵循公共片段全局规则保守上报（至少 `P3`，缺关键字段时 `P2`）。
