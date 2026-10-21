/* flight（机票）核心链路接口清单
 * —— discover-triage-urls 从 fe-esflight 自动摘取，需人工确认后交给 onboard-triage-domain。
 * 源码: /Users/didi/Desktop/codeRepo/esHotel/esflight/fe-esflight @ 0bd9888e3   （sync 时用 git diff 0bd9888e3..HEAD -- src/api 缩小范围）
 *
 * ownedPrefixes（自有 vs 非自有 归属边界）：['/esapp/']
 *   —— 凡 /esapp/ 开头 = 自有接口，走正常业务规则路由（含 /esapp/flight 及 laputa/crius/mars/
 *      qingfeng/qingcheng/category/finance/hotel-intl/v3 等内部中台，只要在 /esapp/ 下就是自有）。
 *   —— 非 /esapp/ 开头 = non-core：/marketing/、/perceive/、https://invoiceapi.udache.com/（发票绝对域名）。
 *
 * 推断的主流程链：搜索/查询 → 下单(RC鉴权/审批) → 支付 → 出票 → 退票/改签
 *   （业务专属高危轴：无；清风拦截走 /esapp/qingfeng/，本就在自有前缀内，无需提升）
 *
 * 另一维度「核心 vs 边缘」与归属正交，只影响下游 severity 基线，不影响路由归属：
 *   核心 = 阻塞主流程（搜索→下单→支付→出票→退改，异常会卡住用户完成交易）→ 高基线 P0/P1。
 *   边缘 = 弱业务（展示/NPS/公告/日志/AB/分享/邮寄地址等，挂了不阻塞主流程）→ 低基线 P2/P3。
 *
 * 每条注释 = 代码里的语义（导出名 / @Description / 行内注释）。核心/边缘已在分组标题标注。
 * 覆盖：132 个 /esapp/ 去重 URL + 4 个绝对域名三方 URL；已剔除约 15 条注释死码（见文件末）。
 * 非 /esapp/ 接口（marketing/perceive/发票绝对域名）经核查均失败放行/弱业务，无一阻塞主流程（见第八组）。
 */

// ==================================================================
// 一、搜索 / 查询链路（核心）
// 链路语义：查航班列表/报价/余票。正常拒绝=无航班/无余票/报价已售罄/价格有所变动（空列表走 no-airline
//   兜底，非故障；依据 list-mixin/request-mixin.js:504 + common/constant/default.js ERROR_MESSAGE_WHITE_LIST）。
// ==================================================================
export const HOME_DATA            = '/esapp/flight/base/getHomeData/v1';        // 首页数据
export const CITY_LIST            = '/esapp/laputa/api/flight-hot-city';        // 热门城市列表（中台）
export const SEARCH_CITY          = '/esapp/laputa/api/flight-search';          // 搜索城市（中台）
export const LIMITED_CITIES       = '/esapp/laputa/api/airport-city';           // 支持/受限城市（中台）
export const CITY_DETAIL          = '/esapp/laputa/api/city';                   // 城市详情（中台）
export const FLIGHT_LIST          = '/esapp/flight/info/getList/v2';            // 航班列表
export const FLIGHT_LIST_INTL     = '/esapp/flight/intl/info/getList/v2';       // 国际航班列表
export const PRICE_LIST           = '/esapp/flight/info/getPriceList/v3';       // 报价列表
export const PRICE_LIST_INTL      = '/esapp/flight/intl/info/getPriceList/v1';  // 报价列表（国际）
export const ALL_CABIN_PRICE      = '/esapp/flight/info/allCabinPrice';         // 全舱位报价
export const FLIGHT_LIST_POINTS   = '/esapp/flight/info/getListExtra/v2';       // 航班列表积分
export const FLIGHT_LABEL         = '/esapp/flight/info/label/v1';              // 航班标签信息
export const BAGGAGE_LIST         = '/esapp/flight/info/getBaggageList';        // 行李额列表
export const RC_BAGGAGE_POLICY    = '/esapp/flight/info/getReturnChangeBaggagePolicy/v2';       // 退改/行李政策（下单前）
export const RC_BAGGAGE_POLICY_INTL = '/esapp/flight/intl/info/getReturnChangeBaggagePolicy/v1'; // 退改/行李政策（下单前，国际）
export const CHEAPEST_FLIGHT      = '/esapp/flight/beforeOrder/getCheapestFlightList/v3';  // 最低价航班
export const TRAVEL_DATA          = '/esapp/flight/requisition/getIndexList/v2';           // 差旅单/制度数据
// 边缘：
export const ROUTES_NOTICE_INTL   = '/esapp/flight/intl/info/routesNotice/v1'; // 航班详情通知列表（边缘）
export const TRIP_RECOMMEND       = '/esapp/flight/trip/recommend';            // 推荐信息（边缘）

// ==================================================================
// 二、下单链路（核心）
// 链路语义：下单基础数据/RC鉴权/审批/创建订单。正常拒绝（orderCreate 的 code 分支，均预期业务态、不告警）=
//   航班报价失效(2000)/重复下单(2025)/风控拦截(2027)/差标超标需确认(6320)/差旅制度不可用(6,1206,1207)/
//   限额用尽 deny_book/需审批 need_approval/企业余额不足/未按天数提前预订/报价已售罄等
//   （依据 make-order/order-create.mpx:4573-4794、1026-1055）。
// ==================================================================
export const ORDER_BASE_DATA      = '/esapp/flight/beforeOrder/getBaseData/v3';        // 下单基础数据（国内）
export const ORDER_BASE_DATA_INTL = '/esapp/flight/intl/beforeOrder/getBaseData/v1';   // 下单基础数据（国际）
export const AUTHENTICATION       = '/esapp/flight/beforeOrder/authentication/v3';     // 内部鉴权-支付方式/金额
export const AUTHENTICATION_INTL  = '/esapp/flight/intl/beforeOrder/authentication/v1';// 内部鉴权-支付方式/金额（国际）
export const DO_RC                = '/esapp/flight/beforeOrder/doRc';                   // 触发 RC 超标校验
export const TRIP_PURPOSE_LIST    = '/esapp/flight/beforeOrder/getTripPurposeList/v1';  // 出行目的列表
export const VALIDATE_BOOKING     = '/esapp/flight/beforeOrder/validateBooking/v3';     // BK 校验
export const VALIDATE_BOOKING_INTL= '/esapp/flight/intl/beforeOrder/validateBooking/v1';// BK 校验（国际）
export const BEFORE_ORDER_CREATE  = '/esapp/flight/beforeOrder/create/v3';             // 发起创建订单（国内，旧）
export const ORDER_CREATE         = '/esapp/flight/order/create/v1';                   // 发起创建订单（国内，新）
export const ORDER_CREATE_INTL    = '/esapp/flight/intl/beforeOrder/create/v1';        // 发起创建订单（国际）
export const ORDER_CREATE_RESULT_INTL = '/esapp/flight/intl/beforeOrder/createResult/v1'; // 查询创单结果（国际）
export const ORDER_STEP           = '/esapp/flight/order/step/v1';                     // 查询创单及占座结果
export const UPDATE_CONTACT       = '/esapp/flight/order/updateContactInfo/v1';        // 更新联系人信息
export const UPDATE_CONTACT_INTL  = '/esapp/flight/intl/order/updateContactInfo/v1';   // 更新联系人信息（国际）
export const VFCODE_SEND          = '/esapp/flight/vfCode/orderShowClear/send/v1';     // 下单验证码-发送
export const VFCODE_CHECK         = '/esapp/flight/vfCode/orderShowClear/check/v1';     // 下单验证码-校验
export const BUDGET_CENTER        = '/esapp/v3/eBudgetCenterSearch';                    // 成本中心列表（中台）
export const INVOICE_QUERY        = '/esapp/flight/invoice/query';                     // 查询发票抬头
// RC / 审批（core：在下单 mixin request-mixin.js 的 handleRcAuth 里，挂了阻塞下单）：
export const RC_REASON_LIST       = '/esapp/crius/orderreason/flightGetList';          // RC 原因列表
export const RC_REASON_CHECK      = '/esapp/crius/orderreason/check';                  // RC 原因敏感词校验
export const CHECKER_LIST         = '/esapp/crius/approval/CheckerList';               // 审批人列表
export const CHECKER_LIST_V2      = '/esapp/crius/approval/CheckerListV2';             // 审批人列表 V2
// 边缘：
export const DEFAULT_INVOICE_TITLE= '/esapp/finance/invoice/in/api/usualInfo/getMatchTitleByCompanyId'; // 默认发票抬头（中台，边缘）
export const EXT_FIELD            = '/esapp/crius/metadata/requisitions/GetExtField';  // 扩展字段（边缘）
export const AB_LIB               = '/esapp/flight/base/abm';                          // AB 实验版本（边缘）
export const FILE_UPLOAD          = '/esapp/qingcheng/file/uploadWithAudit';           // 文件上传并审核（中台，边缘）
export const ORDER_EXCEPTION_DETAIL = '/esapp/qingfeng/core/flight/detail';            // 下单异常详情（中台，边缘）
export const SUBMIT_EXCEPTION_REASON= '/esapp/crius/orderlb/qingfeng/explain';         // 提交异常原因（中台，边缘）

// ==================================================================
// 三、支付链路（核心）
// 链路语义：发起/确认支付。正常拒绝（handErrorCode 分支，走 toast/Dialog 不告警）=国际支付处理中(2047,轮询)/
//   航班失效(2000)/企业余额不足(3102)/价格变动订单被取消(5)/重复或已支付/用户主动取消收银台
//   （依据 order/detail.mpx:2616-2715、2403-2421、2803-2816）。
// ==================================================================
export const PAY_CREATE           = '/esapp/flight/pay/create/v1';                     // 发起支付
export const PAY_AUTO             = '/esapp/flight/pay/auto/v1';                        // 自动支付
export const PAY_FOR_CREATE_ORDER = '/esapp/flight/order/pay/v1';                      // 国内创单（非改签）支付
export const CONFIRM_PAY_CHECK    = '/esapp/flight/order/confirmToPay/v1';             // 确认支付检查
export const PAY_CREATE_INTL      = '/esapp/flight/intl/pay/create/v1';                // 国际支付创建
export const PAY_AUTO_INTL        = '/esapp/flight/intl/pay/auto/v1';                  // 国际自动支付
export const PAY_MANUAL_INTL      = '/esapp/flight/intl/manual/pay/create/v1';         // 国际手动支付创建
export const CHANGE_PAY_MANUAL_INTL = '/esapp/flight/intl/order/change/manual/pay/create/v1'; // 国际手动改签支付创建
export const CHANGE_PAY_INTL      = '/esapp/flight/intl/order/change/pay/create/v1';   // 国际改签支付创建
export const SAVE_RC_VERIFY_INTL  = '/esapp/flight/intl/order/change/saveRcAndVerifyInfo/v1'; // 国际订单保存 RC 和验证信息

// ==================================================================
// 四、出票 / 发票链路（核心；邮寄地址等为边缘）
// 链路语义：出票占座轮询 + 报销开票。正常拒绝=供应商下单失败/占座失败(code 12/22 走"重新预订/暂不预订")、
//   不可开票/重复申请开票(code 1 走 Dialog)、退票订单因公不可开行程单
//   （依据 order/detail.mpx:2432-2464、reimburse/token.mpx:501-527、281）。
// ==================================================================
export const TO_ISSUE_LIST        = '/esapp/flight/invoice/before/list/v2';            // 待开票列表
export const TO_ISSUE_LIST_INTL   = '/esapp/flight/invoice/before/list/v1';            // 待开票列表（国际）
export const ISSUED_LIST          = '/esapp/flight/invoice/after/list/v2';             // 已开票列表
export const ISSUED_LIST_INTL     = '/esapp/flight/invoice/after/list/v1';             // 已开票列表（国际）
export const TOKEN_DETAIL         = '/esapp/flight/invoice/before/detail/v2';          // 开票前详情
export const TOKEN_DETAIL_INTL    = '/esapp/flight/invoice/before/form/v1';            // 开票前表单（国际）
export const TOKEN_DETAIL_AFTER   = '/esapp/flight/invoice/after/detail/v2';           // 开票后详情
export const TOKEN_DETAIL_AFTER_INTL = '/esapp/flight/invoice/after/detail/v1';        // 开票后详情（国际）
export const COMMIT_TOKEN         = '/esapp/flight/invoice/before/submit/v2';          // 提交开票
export const COMMIT_TOKEN_INTL    = '/esapp/flight/invoice/before/submit/v1';          // 提交开票（国际）
export const MODIFY_TOKEN_INTL    = '/esapp/flight/invoice/after/modify/v1';           // 开票后修改（国际）
// 边缘：
export const RESEND_EMAIL         = '/esapp/flight/invoice/after/resend/v1';           // 重发邮件（边缘）
export const ADDRESS_ADD          = '/esapp/flight/voucher/sendAddress/create/v1';     // 新增邮寄地址（边缘）
export const ADDRESS_LIST         = '/esapp/flight/voucher/sendAddress/getList/v1';    // 邮寄地址列表（边缘）
export const ADDRESS_EDIT         = '/esapp/flight/voucher/sendAddress/update/v1';     // 修改邮寄地址（边缘）
export const ADDRESS_DEL          = '/esapp/flight/voucher/sendAddress/delete/v1';     // 删除邮寄地址（边缘）
export const SMS_ORDER_LINK       = '/esapp/flight/smsOrderInfo/getSmsLink';           // 短信订单链接（边缘）

// ==================================================================
// 五、退票 / 改签链路（核心）
// 链路语义：退票/改签校验与提交。正常拒绝=不可退改/超时限/需收手续费(退票 code!=0 走 Dialog/toast)、
//   不可改签/限额超标(改签 6204/6205)、重复或状态变化(改签提交 2030)、不可改舱位置灰(disallowed_cabins)
//   （依据 refund-ticket/apply-refund-ticket/index.mpx:589-608、774-792、change-ticket/confirm-change-ticket.mpx:627-684）。
// ==================================================================
// 改签：
export const CHANGE_TRIP_LIST     = '/esapp/flight/order/change/getTripList/v1';       // 改签可选行程
export const CHANGE_REASON_LIST   = '/esapp/flight/order/change/getReasonList/v1';     // 改签原因列表
export const CHANGE_USER_LIST     = '/esapp/flight/order/change/getChangeUserList/v2'; // 可改签用户列表
export const CHANGE_FLIGHT_PRICE  = '/esapp/flight/order/change/getFlightPrice/v2';    // 改签航班价格
export const CHANGE_AMOUNT        = '/esapp/flight/order/change/getChangeAmount/v3';   // 改签金额
export const CHANGE_CHECK         = '/esapp/flight/order/change/check/v1';             // 改签校验
export const CHANGE_RC_CHECK      = '/esapp/flight/order/change/rcCheck/v1';           // 改签 RC 超标检查
export const CHANGE_SUBMIT        = '/esapp/flight/order/change/submit/v3';            // 提交改签
export const CHANGE_HISTORY       = '/esapp/flight/order/change/history/v1';           // 改签详情/历史
export const TRIP_CHECK_INTL      = '/esapp/flight/intl/trip/check/v1';                // 退改行程校验（国际）
export const ORDER_CANCEL         = '/esapp/flight/order/cancel/v1';                   // 取消订单
export const ORDER_CANCEL_INTL    = '/esapp/flight/intl/order/cancel/v1';             // 取消订单（国际）
// 退票（国内字面量 + 国际为 ${isMockUlr} 模板串还原）：
export const REFUND_REASON_LIST   = '/esapp/flight/order/refund/getReasonList/v1';     // 退票原因列表
export const REFUND_TRIP_LIST     = '/esapp/flight/order/refund/getTripList/v1';       // 退票可选行程
export const REFUND_USER_LIST     = '/esapp/flight/order/refund/getRefundUserList/v2'; // 可退票用户列表
export const REFUND_AMOUNT        = '/esapp/flight/order/refund/getRefundAmount/v2';   // 退票金额
export const REFUND_SUBMIT        = '/esapp/flight/order/refund/submit/v3';            // 提交退票
export const REFUND_HISTORY       = '/esapp/flight/order/refund/history/v1';           // 退票详情/历史
export const REFUND_CHECK         = '/esapp/flight/order/refund/check/v1';             // 退票校验
export const REFUND_TRIP_LIST_INTL   = '/esapp/flight/intl/order/refund/getTripList/v1';       // 退票行程（国际）
export const REFUND_USER_LIST_INTL   = '/esapp/flight/intl/order/refund/getRefundUserList/v1'; // 可退票用户（国际）
export const REFUND_REASON_LIST_INTL = '/esapp/flight/intl/order/refund/getReasonList/v1';     // 退票原因（国际）
export const REFUND_AMOUNT_INTL      = '/esapp/flight/intl/order/refund/getRefundAmount/v1';   // 退票金额（国际）
export const REFUND_SUBMIT_INTL      = '/esapp/flight/intl/order/refund/submit/v1';            // 提交退票（国际）
export const REFUND_HISTORY_INTL     = '/esapp/flight/intl/order/refund/history/v1';           // 退票详情（国际）
export const REFUND_CHECK_INTL       = '/esapp/flight/intl/order/refund/check/v1';             // 退票校验（国际）

// ==================================================================
// 六、订单详情链路（核心；MAS/权益等为边缘）
// ==================================================================
export const ORDER_DETAIL         = '/esapp/flight/merge/order/detail/v1';             // 订单详情
export const ORDER_LIST           = '/esapp/flight/merge/order/list/v1';               // 订单列表
export const DEAL_DETAIL          = '/esapp/flight/order/getDealDetail/v1';            // 交易记录
export const DEAL_DETAIL_INTL     = '/esapp/flight/intl/order/getDealDetail/v1';       // 交易记录（国际）
export const ORDER_COMPLETE       = '/esapp/flight/order/complete/v1';                // 订单完成/审批信息
export const ORDER_COMPLETE_INTL  = '/esapp/flight/intl/order/complete/v1';           // 订单完成/审批信息（国际）
export const FLIGHT_CHANGED       = '/esapp/flight/order/getFlightChanged/v1';         // 航变详情
export const FLIGHT_CHANGED_INTL  = '/esapp/flight/intl/order/getFlightChanged/v1';    // 航变详情（国际）
export const ORDER_RC_BAGGAGE      = '/esapp/flight/info/getOrderReturnChangeBaggagePolicy/v1';      // 退改/行李政策（下单后）
export const ORDER_RC_BAGGAGE_INTL = '/esapp/flight/intl/info/getOrderReturnChangeBaggagePolicy/v1'; // 退改/行李政策（下单后，国际）
export const INQUIRY_CONTACT_INTL = '/esapp/flight/intl/info/getContactInfo/v1';       // 询价单-联系人信息（国际）
export const INQUIRY_CREATE_INTL  = '/esapp/flight/intl/info/createInquiryForm/v1';    // 创建询价单（国际）
// 边缘：
export const SEND_CONFIRM_INFO    = '/esapp/flight/order/sendConfirmInfo/v1';          // 发送确认单（边缘）
export const SEND_CONFIRM_INFO_INTL = '/esapp/flight/intl/order/sendConfirmInfo/v1';   // 发送确认单（国际，边缘）
export const EXPEDITE_TASK        = '/esapp/flight/merge/order/expediteTask/v1';       // 催退改通知（边缘）
export const VIP_HALL             = '/esapp/flight/order/detail/vip_hall';             // VIP 厅列表（边缘）
export const EXPENSIVE_COMPENSATE = '/esapp/flight/order/expensiveCompensate/submit';  // 贵必赔申请（边缘）
export const MAS_ORDER_QUANTITY   = '/esapp/mars/cn/query-order-quantity/v1';          // MAS 订单数量（中台，边缘）
export const MAS_ORDER_CANCEL     = '/esapp/mars/cn/cancel-order/v1';                  // MAS 订单取消（中台，边缘）
export const BENEFIT_CHANGE_DETAIL= '/esapp/hotel-intl/cn/flightChangeDetail';         // 机票权益变更详情（中台，边缘）
export const HOTEL_TAG_HISTORY    = '/esapp/hotel-intl/cn/orderTagHistory';            // 酒店订单标签历史（中台，边缘）

// ==================================================================
// 七、展示 / 弱业务（边缘）
// ==================================================================
export const NPS_REWARD           = '/esapp/flight/nps/reward';                        // NPS 问卷奖励（FLIGHT_API 拼接）
export const PROCLAIM_INFO        = '/esapp/flight/info/proclaimInfo';                 // 协议信息
export const PROCLAIM_INFO_INTL   = '/esapp/flight/intl/info/proclaimInfo';            // 协议信息（国际）
export const EPIDEMIC_INFO_INTL   = '/esapp/category/info/travelTip';                  // 国际疫情信息（中台）
export const SERVICE_NOTICE       = '/esapp/category/info/serviceNotice';             // 服务公告（中台）
export const TRANSFER_STATELESS   = '/esapp/category/transfer/stateless';             // 无状态转发（中台）
export const MY_SHARE_FLIGHT      = '/esapp/flight/order/share';                       // 我的分享航班数据
export const WEIXIN_SHARE         = '/esapp/mars/tool/weixin/share/v1';               // 微信二维码/scheme（中台）
export const COMPANY_CONFIG       = '/esapp/flight/base/getCompanyConfig';            // 公司配置
export const FE_LOG               = '/esapp/flight/base/log/v1';                       // 前端日志上报

// ==================================================================
// 八、非 /esapp/ 接口（non-core：不在自有前缀 /esapp/ 下 → 路由到 non-core.md）
// ==================================================================
export const PERCEIVE_REALTIME    = '/marketing/eos/rule/api/v1/flight/perceive/info/realTimeProcess'; // 望岳实时感知（三方）
export const POINT_DATA           = '/marketing/eos/bcoupon/point/app/flight/finishOrderPoint';        // 国内机票积分（三方）
export const HOME_ACTIVITY_INFO   = '/marketing/api/eos/promotion/batchList/v1';       // 首页运营活动（三方）
export const JOIN_TASK            = '/marketing/eos/rule/task/api/my/jointTask';        // 参与任务（三方）
export const PERCEIVE_MEMBER_LIST = '/perceive/api/client/getPerceiveMemberList';       // 感知成员列表（三方）
export const APP_INFO             = '/perceive/api/client/getAppInfo';                  // App 信息（三方）
// 发票服务：绝对域名（invoiceapi.udache.com），非 /esapp/ —— 仅 pathname 供路由参考：
export const INVOICE_TITLES       = '/invoice-api/scinvoice/v2/invoicetitle/getInvoiceTitles';   // 发票抬头（三方）
export const INVOICE_HEADER_LIST  = '/invoice-api/scinvoice/v2/invoicetitle/query';              // 发票抬头列表（三方）
export const INVOICE_TAX_NUMBER   = '/invoice-api/scinvoice/v2/invoicetitle/getInvoiceTaxNumber';// 发票税号（三方）
export const INVOICE_HEADER_MANAGE= '/invoice-api/scinvoice/v2/invoicetitle/manage';             // 发票抬头管理（三方）

/* ------------------------------------------------------------------
 * 已剔除的注释死码（不进 live 清单，列此备查）：
 *   - beforeOrder/getRcVerifyUserList/v2      （旧审批人，被 crius/approval/CheckerList 取代）
 *   - order/getDetail/v2                      （旧订单详情，被 merge/order/detail/v1 取代）
 *   - intl/order/refund/[各接口]/v1 的注释字面量（真实调用走 isMockUlr 模板串，已在退票节收录）
 *   - intl/order/change/{getChangeUserList/v1, getChangeAmount/v3, submit/v3}、intl/order/cancel/v1（旧改签，被 changeTicket/ 取代）
 *   - pay/create/v1 的注释字面量               （被 pay/ 目录取代）
 *   - share/getMyShareFlightData 旧字面量、flightDetail 旧行李政策注释
 *   - qingfeng/core/flight/intercept（订单拦截）：API 有定义，但全项目除 api 层外无调用方 = 死代码，
 *     已从 live 清单移除（原误标核心）。若后续启用，需按"是否阻塞下单"重判核心/边缘。
 *
 * 待你人工拍板：
 *   1) 归属：ownedPrefixes = ['/esapp/']，非 /esapp/ 开头（marketing/perceive/发票绝对域名）走 non-core。确认无误。
 *   2) 核心/边缘（只影响 severity 基线）：核心 = 阻塞主流程；NPS/公告/分享/日志/AB/贵必赔/邮寄地址等标为边缘。确认是否符合告警关注面。
 *   3) 新旧双份 live（order-edit.js / orderEdit/ 等同名并存）——路由不受影响，清理死码需另行确认。
 * ------------------------------------------------------------------ */
