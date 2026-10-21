// domains/train/rules.js —— 火车票领域的 url → key 路由表
//
// 由 onboard-triage-domain 从 train-urls.js（discover-triage-urls 摘取，源码 fe-estrain @ 9ea7a882f）重生成。
// 一个 domain 只需导出 rules（有序，命中靠前优先）和 fallbackKey（未命中兜底）+ ownedPrefixes（归属边界）。
// 引擎(createRouter)消费它，domain 不关心匹配实现。匹配的是 pathname（引擎已去 host/query）。

export const fallbackKey = 'order';

// 自有接口路径前缀：火车票自有接口有 /esapp/train/（旧）与 /esapp/railway/（迁移后）两子命名空间，
// 另有中台 /esapp/mars/、/esapp/category/，均在 /esapp/ 下 → 自有。故归属边界取 /esapp/ 即可覆盖。
// 不在此前缀内的（/eos/、/marketing/ 等）→ 路由到 non-core。
export const ownedPrefixes = ['/esapp/'];

export const rules = [
  // ===== 特例：必须排在下面宽松规则之前，否则会被吞 =====
  { pattern: '/change/stopTraffic/', key: 'order' },            // 停运核验属下单，先于 /change/
  { pattern: '/estimate/change', key: 'refund-change' },        // 改签场景全车次余票预估，先于 /estimate/
  { pattern: '/refund/partRefundDetail', key: 'order-detail' }, // 部分出票交易记录(边缘)，先于 /refund/
  { pattern: '/user/identityInfoCheck', key: 'order' },         // 下单前乘车人身份核验，先于 /user/
  { pattern: '/user/reverse', key: 'order' },                   // 预定登录态校验，先于 /user/
  { pattern: '/booking/preAuth', key: 'payment' },              // 含 railway/booking/preAuth 与 grab/booking/preAuth

  // ===== 支付（资金 + 下单主流程核心）=====
  { pattern: '/makePay/', key: 'payment' },                     // index/getPayChannel/getPayLink/confirm
  { pattern: '/getPayType', key: 'payment' },                   // 支付方式鉴权
  { pattern: '/payment/authStatus', key: 'payment' },           // 支付宝企业码授权状态(边缘)
  { pattern: '/grab/seatAuth', key: 'payment' },                // 抢票座席鉴权

  // ===== 退票 / 改签 =====
  { pattern: '/refund/', key: 'refund-change' },                // preCheck/queryRefundTicketCost
  { pattern: '/refundTicket', key: 'refund-change' },           // 无尾斜杠，/refund/ 不覆盖
  { pattern: '/changeTicket', key: 'refund-change' },           // 无尾斜杠，/change/ 不覆盖
  { pattern: '/change/', key: 'refund-change' },                // checkChanging/preAuth/estimateFee
  { pattern: '/getRefundInfo', key: 'refund-change' },          // 退票详情
  { pattern: '/getChangeInfo', key: 'refund-change' },          // 改签详情
  { pattern: '/tripList/index', key: 'refund-change' },         // 可改签车次行程
  { pattern: '/remark/history', key: 'refund-change' },         // 改签备注历史(边缘)

  // ===== 查询（余票/车次/中转/预估）=====
  { pattern: 'LeftTicket', key: 'query' },                      // queryLeftTicket/transferLeftTicket/byTrainNo
  { pattern: '/estimate/', key: 'query' },                      // estimate/direct、estimate/indexV2
  { pattern: '/station/queryStation', key: 'query' },           // 经停/停靠站(边缘)
  { pattern: '/transfer/stateless', key: 'query' },             // 中转无状态查询(中台，边缘)

  // ===== 用户与鉴权 =====
  { pattern: '/user/', key: 'user-auth' },                      // login/register/验证码/faceVerification/logout 等
  { pattern: '/travelers/', key: 'user-auth' },                 // 账号关联/实名核验/护照人证核验/出行人增删查
  { pattern: '/common/idTypeList', key: 'user-auth' },          // 证件类型列表

  // ===== 订单详情 =====
  { pattern: '/order/orderDetail', key: 'order-detail' },       // 订单详情/状态查询
  { pattern: '/order/feeDetail', key: 'order-detail' },         // 费用/交易记录(边缘)
  { pattern: '/mars/', key: 'order-detail' },                   // MAS 在途订单数量/取消(中台，边缘)

  // ===== 展示 / 弱业务（清单标为边缘）=====
  { pattern: '/home/index', key: 'display' },                   // 首页/审批单配置
  { pattern: '/serviceNotice', key: 'display' },                // 公告提醒(中台)
  { pattern: '/nps/', key: 'display' },                         // NPS 问卷(silent)
  { pattern: '/auth/overStandard', key: 'display' },            // 坐席文案提示
  { pattern: '/order/shareSearch', key: 'display' },            // 行程分享展示数据
  { pattern: '/order/pageInfo', key: 'display' },               // 占座/改签/退票完成页信息
  { pattern: '/trip/recommend', key: 'display' },               // 一体化返程推荐

  // ===== 下单（核心接口显式列出；其余自有未命中兜底到 order）=====
  { pattern: '/makeOrder', key: 'order' },                      // train/makeOrder + railway/makeOrder/index
  { pattern: '/base/fillPage', key: 'order' },                  // 下单基础数据
  { pattern: '/train/verify', key: 'order' },                   // 车次时刻校验(下单前)
  { pattern: '/auth/check', key: 'order' },                     // 下单前最后一次校验
  { pattern: '/order/getOrderStatus', key: 'order' },           // 出票轮询
  { pattern: '/cancelBefore', key: 'order' },                   // 出票前取消
];
