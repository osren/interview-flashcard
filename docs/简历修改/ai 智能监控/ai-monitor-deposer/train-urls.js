/* train（火车票）核心链路接口清单
 * —— discover-triage-urls 从 fe-estrain（Vue2.7+mpx 前端）自动摘取，需人工确认后交给 onboard-triage-domain。
 * 源码: /Users/didi/Desktop/codeRepo/h5Code/fe-estrain @ 9ea7a882f   （sync 时用 git diff 9ea7a882f..HEAD -- src/api 缩小范围）
 *
 * ownedPrefixes（自有 vs 非自有 归属边界）：['/esapp/']
 *   —— 火车票自有接口有两个子命名空间：/esapp/train/（旧）与 /esapp/railway/（迁移后），二者同为自有、无路由差别；
 *      另有中台 /esapp/mars/、/esapp/category/，均在 /esapp/ 下 → 自有。故归属边界取 /esapp/ 即可覆盖。
 *   —— 非 /esapp/ 开头 = non-core：/eos/、/marketing/（推荐/积分，见末组）。
 *   （与现有手工维护的 domains/train/rules.js 的 ownedPrefixes: ['/esapp/'] 一致，可交叉印证。）
 *
 * 推断的主流程链：查询(余票/车次/中转/预估) → 填单预估(fillPage/preAuth/getPayType) → 下单前校验(auth/check/
 *                 identityInfoCheck) → 下单占座(makeOrder/抢票 grab) → 支付(makePay) → 出票轮询(getOrderStatus) → 退改
 *   （业务专属高危轴：无；主流程的拦截/校验全在 /esapp/ 自有域内，无需提升非自有前缀）
 *
 * 「核心 vs 边缘」与归属正交，只影响下游 severity 基线：核心=阻塞上面主流程链→P0/P1；边缘=弱业务→P2/P3。
 * 每条注释=代码语义（urls.js 常量名/函数名/注释）。覆盖 /esapp/ 去重约 71 条 + 非 /esapp/ 2 条；死码见文件末。
 */

// ==================================================================
// 一、查询（余票/车次/中转/预估/经停）（核心，部分边缘）
// 链路语义：查直达/中转车次余票、坐席、经停站、全车次日历预估、车次时刻校验。
// 正常拒绝：无票/售罄由列表空或坐席不可选表达（预期展示态，非故障；success && code=='0' 判成功，
//   依据 select-change-ticket-page.mpx:211/232/254、train/index.js:50-144）。
// ==================================================================
export const GET_TRAIN_LIST         = '/esapp/railway/train/queryLeftTicket';        // 直达车次余票列表
export const GET_TRANSFER_LIST      = '/esapp/railway/train/transferLeftTicket';     // 中转车次列表
export const CHECK_REMAIN           = '/esapp/train/queryLeftTicketByTrainNo';       // 按车次号余票查询
export const CHECK_TIME             = '/esapp/railway/train/verify';                 // 车次时刻校验(下单前)
export const TRAIN_INFO_BY_NO       = '/esapp/train/estimate/indexV2';              // 全车次固定日期余票(车次详情)
export const TRANSFER_TRAIN_INFO    = '/esapp/train/transfer/estimate/indexV2';      // 中转全车次固定日期余票
export const TRAIN_DETAIL_ESTIMATE  = '/esapp/railway/estimate/direct';             // 全车次固定日期余票(direct)
export const TRAIN_CHANGE_ESTIMATE  = '/esapp/railway/estimate/change';             // 改签场景全车次余票
// 边缘：
export const QUERY_TRAIN_INFO       = '/esapp/railway/station/queryStation';        // 经停/停靠站信息（边缘）
export const DETAIL_TIP             = '/esapp/railway/auth/overStandard';           // 坐席文案提示（边缘）
export const TRANSFER_STATELESS     = '/esapp/category/transfer/stateless';         // 中转无状态查询（中台，边缘）

// ==================================================================
// 二、下单（填单/校验/占座/购票）（核心）
// 链路语义：填单预估→支付方式鉴权→身份核验→占座下单/预订发单。
// 正常拒绝（make-order/index.mpx 密集分支，均预期业务态）：3019 已预订去支付/3020 重复下单/3026 12306占座取消次数耗尽/
//   2022 已售罄换坐席/2023  距发车太近需换车次(中转=不足30分钟)/2035 需强制人脸核验/3037 儿童票拦截/3038 代客下单支付方式受限/7004 支付宝企业码未授权/10608 需静默登录/
//   3033 可继续抢票；preAuth 9507 坐席二次确认、9504 乘车人核验待处理；identityInfoCheck code!=0 核验未通过。
//   （依据 make-order/index.mpx:2687,4885,4938,4949,4970,4979,4986,4996,5008,5020,5030,2795,2799）。
// ==================================================================
export const ORDER_BASE_INFO        = '/esapp/railway/base/fillPage';               // 下单基础数据
export const GET_PAY_TYPE           = '/esapp/train/getPayType';                    // 支付方式鉴权
export const PRE_AUTH               = '/esapp/railway/booking/preAuth';             // 下单前预订鉴权(填单预估)
export const IDENTITY_INFO_CHECK    = '/esapp/train/user/identityInfoCheck';        // 下单前乘车人身份核验(DIDI_REQUEST 直调)
export const PRE_ORDER_FINAL_CHECK  = '/esapp/railway/auth/check';                  // 下单前最后一次校验
export const MAKE_ORDER             = '/esapp/train/makeOrder';                     // 购票下单
export const MAKE_ORDER_REPLACE     = '/esapp/railway/makeOrder/index';            // 预订发单(智能中转)
export const USER_REVERSE           = '/esapp/train/user/reverse';                 // 预定登录态校验

// ==================================================================
// 三、支付（核心）
// 链路语义：获取支付渠道/第三方链接→支付→回页轮询确认。
// 正常拒绝：confirm 未支付/待回调属预期轮询态。
//   （更正：2032 无效订单是订单详情的码、不在支付链路，见订单详情组；getPayStatus 为死代码。已回源码核验。）
// ==================================================================
export const MAKE_PAY               = '/esapp/railway/makePay/index';               // 支付车票
export const GET_PAY_CHANNEL        = '/esapp/railway/makePay/getPayChannel';       // 获取支付渠道
export const GET_PAY_LINK           = '/esapp/railway/makePay/getPayLink';          // 获取第三方支付链接
export const MAKE_PAY_CONFIRM       = '/esapp/railway/makePay/confirm';             // 确认支付结果(二次确认)
// 边缘：
export const GET_ALIPAY_AUTH_STATUS = '/esapp/railway/payment/authStatus';          // 支付宝企业码授权状态（边缘）

// ==================================================================
// 四、退票 / 改签（核心）
// 链路语义：退票前置校验/金额→退票；改签行程/停运校验/费用明细→改签发单。
// 正常拒绝：退票 preCheck 2035 需人证核验、2036 需关联12306账号；refundTicket 10608 需静默登录；
//   停运校验 success&&code=='0'（依据 refund page:881/885/1004、select-change:211）。
// ==================================================================
export const REFUND_PRE_CHECK       = '/esapp/railway/refund/preCheck';             // 退票前置校验
export const QUERY_REFUND_COST      = '/esapp/railway/refund/queryRefundTicketCost'; // 退票金额查询
export const REFUND_TICKET          = '/esapp/train/refundTicket';                 // 确认退票
export const CHANGE_CHECK           = '/esapp/railway/change/checkChanging';        // 改签校验
export const STOP_TRAFFIC_CHECK     = '/esapp/train/change/stopTraffic/check';      // 停运校验
export const GET_CHANGE_TRIP        = '/esapp/train/tripList/index';               // 可改签车次行程
export const CHANGE_TICKET_ORDER    = '/esapp/train/changeTicket';                 // 改签发单
export const CHANGE_FEE_MAKE        = '/esapp/railway/change/preAuth';             // 改签费用明细(填单页)
export const CHANGE_FEE_DETAIL      = '/esapp/railway/change/estimateFee';         // 改签费用明细
// 边缘：
export const GET_CHANGE_REMARK      = '/esapp/railway/remark/history';             // 改签备注历史（边缘）

// ==================================================================
// 五、订单详情（核心主数据 + 边缘明细）
// 链路语义：订单详情/状态轮询/费用明细/取消订单。
// 正常拒绝：orderDetail code=='2032' 无效订单(order/detail.mpx:1933)；getOrderStatus 轮询中间态 102占座中/105出票中/
//   301改签占座中/303改签中/401退票中 属预期（真值在自有包 @didi/es-train-foundation/lib/constant/orderDetail.js:10-26 的 BaseOrderStatus 枚举，非 app 源码）。已回源码核验。
// ==================================================================
export const ORDER_DETAIL           = '/esapp/train/order/orderDetail';            // 订单详情/状态查询
export const GET_ORDER_STATUS       = '/esapp/railway/order/getOrderStatus';        // 轮询订单状态
export const CANCEL_TRIP_BEFORE     = '/esapp/train/cancelBefore';                 // 取消订单(出票前)
// 边缘：
export const DEAL_DETAIL            = '/esapp/train/order/feeDetail';              // 费用/交易记录（边缘）
export const PART_DEAL_DETAIL       = '/esapp/railway/refund/partRefundDetail';     // 部分出票交易记录（边缘）
export const REFUND_DETAIL          = '/esapp/train/order/getRefundInfo';          // 退票详情（边缘）
export const CHANGE_DETAIL          = '/esapp/train/order/getChangeInfo';          // 改签详情（边缘）
export const MAS_ORDER_QUANTITY     = '/esapp/mars/cn/query-order-quantity/v1';     // 在途订单数量（中台，边缘）
export const MAS_ORDER_CANCEL       = '/esapp/mars/cn/cancel-order/v1';            // 取消订单（中台，边缘）

// ==================================================================
// 六、用户与鉴权（登录/注册/实名/12306关联/出行人）（核心登录 + 边缘辅助）
// 链路语义：12306 登录/静默/短信/人脸/一键登录；注册；出行人增删查核验；护照/人证核验；关联12306账号。
// 正常拒绝：登录风控走静默 10608；出行人/护照核验通过前返回待核验属预期；退票需 2036 关联账号。
//   （依据 login12306.js、passenger/index.js、other/index.js）。
// ==================================================================
export const LOGIN_12306            = '/esapp/train/user/login';                   // 12306 登录
export const ONE_CLICK_LOGIN        = '/esapp/railway/user/getUserAccountInfo';     // 一键登录信息核验
export const FACE_VERIFICATION      = '/esapp/train/user/faceVerification';        // 人脸核验
export const MESSAGE_VERIFICATION   = '/esapp/train/user/messageVerification';     // 短信校验
export const MESSAGE_SEND_CODE      = '/esapp/railway/user/messageVerificationSendCode'; // 发送短信验证码
export const ACCOUNT_LINK           = '/esapp/railway/travelers/accountLink';       // 关联12306账号
export const PASSENGER_ALL          = '/esapp/train/travelers/travelersAllQuery';   // 获取12306所有乘车人
export const PASSENGER_ADD          = '/esapp/train/travelers/travelersOnceAdd';    // 单独添加出行人
export const PASSENGER_VALIDATE     = '/esapp/train/travelers/travelersValidate';   // 单个出行人核验
export const PASSENGER_VALIDATE_Q   = '/esapp/train/travelers/travelersValidateQuery'; // 出行人核验状态查询
// 边缘：
export const LOGOUT_12306           = '/esapp/train/user/logout';                  // 退出登录（边缘）
export const RETRIEVE_PASSWORD      = '/esapp/train/user/retrievePassword';        // 找回密码验证码（边缘）
export const VALIDATE_PASSWORD      = '/esapp/train/user/sendCaptchaResult';       // 密码找回提交（边缘）
export const REGISTER_12306         = '/esapp/railway/user/register';             // 12306 注册（边缘）
export const ID_TYPE_MAP            = '/esapp/railway/user/register/form';         // 注册证件类型映射（边缘）
export const ID_TYPE_LIST           = '/esapp/train/common/idTypeList';           // 证件类型列表（边缘）
export const PASSENGER_DEL          = '/esapp/train/travelers/travelersBatchDel';   // 删除出行人（边缘）
export const PASSENGER_DEL_Q        = '/esapp/train/travelers/travelersBatchDelQuery'; // 删除状态查询（边缘）
export const IDENTITY_VERIFICATION  = '/esapp/railway/travelers/identityVerification';  // 外国护照核验（边缘）
export const IDENTITY_VERIFY_Q      = '/esapp/railway/travelers/identityVerificationQuery'; // 护照核验结果（边缘）
export const PERSONNEL_VERIFY       = '/esapp/railway/travelers/personnelVerification';  // 人证核验(发票)（边缘）
export const PERSONNEL_VERIFY_Q     = '/esapp/railway/travelers/personnelVerificationQuery'; // 人证核验状态（边缘）
export const PERSONNEL_VERIFY_NOTICE= '/esapp/railway/travelers/personnelVerificationNotice'; // 人证核验授权通知（边缘）

// ==================================================================
// 七、抢票 grab（核心）
// 链路语义：抢票座席鉴权→抢票预订前鉴权，接入下单主流程。正常拒绝：同下单 preAuth 9507/9504 + makeOrder 3033 可继续抢票。
// ==================================================================
export const GRAB_SEAT_AUTH         = '/esapp/railway/grab/seatAuth';               // 抢票座席鉴权
export const GRAB_PRE_AUTH          = '/esapp/railway/grab/booking/preAuth';        // 抢票预订前鉴权

// ==================================================================
// 八、展示 / 弱业务（/esapp 下，边缘）
// 链路语义：公告、NPS、行程分享、结果页、返程推荐、首页配置。全部 silent 或失败放行，不影响主流程。
// ==================================================================
export const HOME_CONFIG            = '/esapp/railway/home/index';                 // 首页/审批单配置（边缘）
export const SERVICE_NOTICE         = '/esapp/category/info/serviceNotice';         // 公告提醒（中台，边缘）
export const NPS_REWARD             = '/esapp/railway/nps/reward';                 // NPS 问卷提交(silent)（边缘）
export const SHARE_ORDER            = '/esapp/railway/order/shareSearch';           // 行程分享展示数据（边缘）
export const RESULT_INFO            = '/esapp/railway/order/pageInfo';             // 占座/改签/退票完成页信息（边缘）
export const TRIP_RECOMMEND         = '/esapp/railway/trip/recommend';             // 一体化返程推荐（边缘）

// ==================================================================
// 九、非 /esapp/ 接口（non-core：不在自有前缀 /esapp/ 下 → 路由到 non-core.md）
// 经核查均失败放行/弱业务，无一阻塞主流程（无酒店 /qingfeng/intercept 那种拦截型）。
// ==================================================================
export const ORDER_POINT            = '/marketing/eos/bcoupon/point/app/train/finishOrderPoint';         // 下单积分(catch吞错)（三方，边缘）
export const RECOMMEND_BOOKING      = '/eos/eos/rule/api/recommendBooking/getRecommendBookingInfo';       // 推荐预订信息(silent)（三方，边缘）

/* ------------------------------------------------------------------
 * 疑似死代码（wrapper 无调用方，不进 live 清单，列此备查）：
 *   - /esapp/train/multiGetPayType（getMultiPayType）：urls.js:20 + make-order/index.js:48 定义，pages/store 无调用方。
 *   - /esapp/railway/makePay/getPayStatus（getPayStatus）：定义存在但无调用方，支付确认实际走 makePay/confirm。
 *   - /esapp/train/user/add（saveContactInfo）：定义存在但无调用方。
 *   - /esapp/train/order/getList/filterTerms（订单列表筛选项）：广召回出现但 urls.js 无对应常量，疑似页面内联，边缘展示。
 *   注：identityInfoCheck 的 wrapper 函数无人调用，但其 url 被 make-order/index.mpx:2671 经 DIDI_REQUEST 直调，
 *       故该 url 是核心链路存活（已列入第二组），只是 wrapper 死。
 *
 * 动态路径：无。所有 /esapp/ url 均为 urls.js 里的静态字面量常量，无模板串拼接。
 *
 * 待你人工拍板：
 *   1) 归属：ownedPrefixes = ['/esapp/']（train/ 与 railway/ 两子域 + mars/category 中台均自有）；/eos、/marketing 走 non-core。
 *      与现有手工 domains/train/rules.js 一致。
 *   2) 核心/边缘（只影响 severity 基线）：主流程链(查询→填单→校验→占座/抢票→支付→出票→退改)标核心，其余边缘。确认是否符合关注面。
 *   3) 死代码 3-4 条（multiGetPayType / getPayStatus / user/add / getList/filterTerms）——删还是留。
 *   4) 交叉印证：本清单可与现有 domains/train/rules.js 对照——该 rules.js 已覆盖 makePay/refund/LeftTicket/user/change 等，
 *      本次摘取的 url 集应是它的超集（含出行人核验、人证核验等更细的接口），可据此补全既有规则。
 * ------------------------------------------------------------------ */
