/* hotel（酒店）核心链路接口清单
 * —— discover-triage-urls 从 fe-eshotel（Vue2+mpx 小程序前端）自动摘取，需人工确认后交给 onboard-triage-domain。
 * 源码: /Users/didi/Desktop/codeRepo/esHotel/fe-eshotel @ 8214303db   （sync 时用 git diff 8214303db..HEAD -- src/api 缩小范围）
 *
 * ownedPrefixes（自有 vs 非自有 归属边界）：['/esapp/', '/qingfeng/qingfeng/core/hotel/intercept']
 *   —— 凡 /esapp/ 开头 = 自有（含 hotel/hotel-intl 及 laputa/mars/crius/helios/jinchan/
 *      qingcheng/finance/demeter-ares/category 等内部中台，均在 /esapp/ 下 → 自有）。
 *   —— 非 /esapp/ 开头 = non-core：/eos/、/perceive/（见第十二组）。
 *   —— 例外：/qingfeng/.../hotel/intercept 前缀非 /esapp/，但阻塞下单，故把该具体路径提升进 ownedPrefixes，
 *      路由到 order 核心 category（否则会落 non-core 被漏报）。见第四组。
 *
 * 推断的主流程链：入口校验 → 城市/目的地搜索 → 酒店列表 → 酒店详情(静态+房型价格) →
 *                 库存价格校验 → 填单(费用明细/下单前校验) → makeOrder → 查询订单 → 退订/离店
 *   （支付走外部收银台，不在本前端 /esapp 接口内；业务专属高危轴：无）
 *
 * 「核心 vs 边缘」与归属正交，只影响下游 severity 基线：核心=阻塞上面主流程链→P0/P1；边缘=弱业务→P2/P3。
 * 每条注释 = 代码语义（导出名/函数名/上方注释）。覆盖 /esapp/ 去重约 62 条 + 非 /esapp/ 7 条；死码见文件末。
 */

// ==================================================================
// 一、酒店入口 / 城市搜索（核心，部分边缘）
// 链路语义：进酒店频道做入口权限前置校验，选城市/目的地、关键词联想。
// 正常拒绝：入口无权限/未开通酒店/城市不支持/命中管控拦截（预期业务态，非故障）。
// ==================================================================
export const ENTRANCE_PRECHECK      = '/esapp/hotel/entrancePreCheck';           // 酒店入口前置校验(国内)
export const ENTRANCE_PRECHECK_INTL = '/esapp/hotel-intl/entrancePreCheck';       // 酒店入口前置校验(国际)
export const HOTEL_INDEX_INFO       = '/esapp/hotel-intl/getHotelIndexInfo';      // 首页-差旅列表&制度
export const CITY_ALL               = '/esapp/laputa/api/hotel-hot-city';         // 全部城市列表（中台）
export const CITY_SEARCH            = '/esapp/laputa/api/hotel-search';            // 目的地关键词搜索（中台）
export const CITY_LIST              = '/esapp/laputa/api/city';                    // 市列表 国内&国际（中台）
export const SEARCH_FILTER          = '/esapp/hotel/searchFilterItems';           // 搜索页筛选项(国内)
export const SEARCH_FILTER_INTL     = '/esapp/hotel-intl/searchFilterItems';       // 搜索页筛选项(国际)
export const HOTEL_SUGGEST_INTL     = '/esapp/hotel-intl/hotelSuggest/v1';         // 办公地/酒店名联想(国际)
export const HOTEL_SUGGEST          = '/esapp/hotel-intl/cn/hotelSuggest/v1';      // 办公地/酒店名联想(国内)
// 边缘：
export const GOOD_PRICE_CITY        = '/esapp/hotel-intl/cn/cnGoodPriceCity';      // 好价酒店城市（边缘）
export const EMPTY_SEARCH_HISTORY   = '/esapp/hotel/emptyHistorySearch';          // 清空搜索历史（边缘）
export const REVERSE_GEO            = '/esapp/demeter-ares/api/reverseGeocoding';  // 地址反解（中台，边缘）
export const ZONE_TIME              = '/esapp/category/info/timezone';            // 时区时间（中台，边缘）

// ==================================================================
// 二、酒店列表（核心）
// 链路语义：按城市/条件拉列表并筛选。正常拒绝：无符合条件酒店/满房（空列表，预期态）。
// ==================================================================
export const HOTEL_SEARCH_LIST      = '/esapp/hotel-intl/cn/hotelSearch/v1';       // 酒店列表搜索(国内新)
export const HOTEL_SEARCH_LIST_INTL = '/esapp/hotel-intl/hotelSearch';            // 酒店列表搜索(国际)
export const HOTEL_FILTER           = '/esapp/hotel/hotelFilterItems';            // 列表更多筛选项(国内)
export const HOTEL_FILTER_INTL      = '/esapp/hotel-intl/hotelFilterItems';        // 列表更多筛选项(国际)
// 边缘：
export const HOTEL_RECOMMEND        = '/esapp/hotel/hotelRecommend';              // 推荐酒店（边缘）
export const SERVICE_NOTICE         = '/esapp/category/info/serviceNotice';       // 公告信息（中台，边缘）

// ==================================================================
// 三、酒店详情（核心）
// 链路语义：进详情拉静态信息+房型价格计划，含收藏与管控感知。正常拒绝：房型售罄/无可订价格计划。
// ==================================================================
export const HOTEL_STATIC           = '/esapp/hotel-intl/cn/getHotelStaticInfo/v1';    // 详情静态数据(国内)
export const ROOM_RATE_PLAN         = '/esapp/hotel-intl/cn/getRoomRatePlanList/v1';    // 房型价格计划(国内)
export const HOTEL_STATIC_INTL      = '/esapp/hotel-intl/getHotelStaticInfo/v1';        // 详情静态数据(国际)
export const ROOM_RATE_PLAN_INTL    = '/esapp/hotel-intl/getRoomRatePlanList/v1';       // 房型价格计划(国际)
export const ROOM_DETAIL            = '/esapp/hotel/getHotelRoomDetail';               // 房型详情(国内)
export const ROOM_DETAIL_INTL       = '/esapp/hotel-intl/getHotelRoomDetail';          // 房型详情(国际)
// 边缘：
export const HOTEL_COLLECT          = '/esapp/hotel/hotelCollect';                    // 收藏/取消收藏（边缘）
export const RIGHT_DETAIL           = '/esapp/crius/requisitions/reasonDetail';        // 房间鉴权感知详情（中台，边缘）

// ==================================================================
// 四、下单 / 填写 filling（核心）
// 链路语义：填单拉费用明细/预订原因，下单前做库存价格校验与拦截校验，提交订单。
// 正常拒绝：库存不足/价格变动/差标超标/需审批/清风拦截/命中下单前校验（均预期业务态）。
// ==================================================================
export const PRICE_DETAIL           = '/esapp/hotel/getPriceDetail';                  // 预订费用明细(国内)
export const PRICE_DETAIL_INTL      = '/esapp/hotel-intl/getPriceDetail';             // 预订费用明细(国际)
export const BOOKING_REASON         = '/esapp/hotel/getBookingReason';               // 获取预订原因
export const STOCK_PRICE_CHECK      = '/esapp/hotel/stockPriceCheck';                // 库存价格校验(国内)
export const STOCK_PRICE_CHECK_INTL = '/esapp/hotel-intl/stockPriceCheck';           // 库存价格校验(国际)
export const PRECHECK_MAKEORDER     = '/esapp/hotel/preCheckMakeOrder';              // 下单前校验(国内)
export const PRECHECK_MAKEORDER_INTL= '/esapp/hotel-intl/preCheckMakeOrder';         // 下单前校验(国际)
export const MAKE_ORDER             = '/esapp/hotel/makeOrder';                      // 酒店下单(国内)
export const MAKE_ORDER_INTL        = '/esapp/hotel-intl/makeOrder';                 // 酒店下单(国际)
// 阻塞下单的拦截校验：前缀非 /esapp/，已在文件头把该路径提升进 ownedPrefixes → 路由到 order 核心 category。
export const QINGFENG_INTERCEPT     = '/qingfeng/qingfeng/core/hotel/intercept';      // 进预订页清风拦截(问询/追缴/退改)，失败阻断下单
// 边缘：
export const FILL_BENEFIT_CONFIG    = '/esapp/hotel-intl/cn/cnGetCompanyConfig';      // 填单页权益卡片配置（边缘）
export const DEFAULT_INVOICE_TITLE  = '/esapp/finance/invoice/in/api/usualInfo/getMatchTitleByCompanyId'; // 匹配发票抬头（中台，边缘）

// ==================================================================
// 五、结算 / 支付相关（核心）
// 链路语义：下单后查订单支付/确认状态、发确认单。真正收银台在外部，本前端不含 /esapp 支付创建接口。
// 正常拒绝：已支付/已取消/订单状态流转中。
// ==================================================================
export const QUERY_ORDER            = '/esapp/hotel/queryOrder';                     // 查询订单信息(国内)
export const QUERY_ORDER_INTL       = '/esapp/hotel-intl/queryOrder';                // 查询订单信息(国际)
export const MAS_ORDER_QUANTITY     = '/esapp/mars/cn/query-order-quantity/v1';       // 查询订单量（中台）
// 边缘：
export const SEND_CONFIRM           = '/esapp/hotel/sendConfirmInfo';                // 发送确认单(国内，边缘)
export const SEND_CONFIRM_INTL      = '/esapp/hotel-intl/sendConfirmInfo';           // 发送确认单(国际，边缘)
export const BENEFIT_AFTER_PAY      = '/esapp/jinchan/esBenefit/getRecommendedBenefitAfterDoPay'; // 支付后奖励金（中台，边缘）

// ==================================================================
// 六、订单详情（核心主数据复用第五组 QUERY_ORDER；本组为增值操作，边缘）
// 链路语义：订单详情展示、催单、共享订单、水单上传。正常拒绝：订单已取消/已完成/无权查看。
// ==================================================================
export const REMIND_ORDER           = '/esapp/hotel-intl/cn/cnRemindOrder';           // 催酒店确认/取消（边缘）
export const QUERY_SHARED_ORDER     = '/esapp/hotel-intl/cn/querySharedOrder/v1';      // 查询共享订单（边缘）
export const UPLOAD_ATTACHMENT      = '/esapp/hotel-intl/attachment/upload';          // 上传水单附件（边缘）

// ==================================================================
// 七、退订 / 离店（核心）
// 链路语义：取消订单、前置取消、提前离店/退房及原因提交。
// 正常拒绝：不可取消/超过免费取消时段/需收违约金/已入住。
// ==================================================================
export const CANCEL_ORDER           = '/esapp/hotel/cancelOrder';                    // 取消订单(国内)
export const CANCEL_ORDER_INTL      = '/esapp/hotel-intl/cancelOrder';               // 取消订单(国际)
export const CANCEL_BEFORE          = '/esapp/hotel/cancelBefore';                   // 前置取消(国内)
export const CANCEL_BEFORE_INTL     = '/esapp/hotel-intl/cancelBefore';              // 前置取消(国际)
export const REASON_LIST            = '/esapp/hotel/getReasonList';                  // 取消/退房原因列表(国内)
export const REASON_LIST_INTL       = '/esapp/hotel-intl/getReasonList';             // 取消/退房原因列表(国际)
export const REASON_SUBMIT          = '/esapp/hotel/reasonSubmit';                   // 提前退房原因提交
export const APPLY_CHECKOUT         = '/esapp/hotel/applyCheckout';                  // 申请提前离店
export const CHECKOUT_DATA          = '/esapp/hotel/getCheckoutData';               // 自助离店数据
export const MAS_ORDER_CANCEL       = '/esapp/mars/cn/cancel-order/v1';              // 取消订单（mars 中台）

// ==================================================================
// 八、贵必赔 / 赔付 compensate（边缘）
// 链路语义：贵必赔权益申请——资格校验、上传携程截图、提交理赔、查详情/标签历史。
// 正常拒绝：不在白名单/不满足赔付条件/已申请。整条不阻断主流程。
// ==================================================================
export const COMPENSATE_SUBMIT      = '/esapp/hotel-intl/cn/expensiveCompensateSubmit';  // 发起贵必赔申请（边缘）
export const COMPENSATE_CHECK       = '/esapp/hotel-intl/cn/expensiveCompensateCheck';   // 贵必赔资格校验（边缘）
export const COMPENSATE_DETAIL      = '/esapp/hotel-intl/cn/cnExpensiveCompensateDetail'; // 贵必赔详情（边缘）
export const ORDER_TAG_HISTORY      = '/esapp/hotel-intl/cn/orderTagHistory';           // 订单标签历史（边缘）
export const FILE_UPLOAD            = '/esapp/qingcheng/file/uploadWithAudit';           // 贵必赔文件上传（中台，边缘）

// ==================================================================
// 九、权益绑定 rights（边缘）
// 链路语义：会员/供应商权益绑定、解绑、验证码、改绑手机号。正常拒绝：验证码错误/已绑定/无权益。
// ==================================================================
export const RIGHTS_LIST            = '/esapp/hotel/user/rightsList';                // 预订权益列表（边缘）
export const RIGHTS_BIND            = '/esapp/hotel/user/rightsBind';                // 绑定预订权益（边缘）
export const RIGHTS_UNBIND          = '/esapp/hotel/user/rightsUnBind';              // 解绑预订权益（边缘）
export const RIGHTS_SMS_CODE        = '/esapp/hotel/user/smsCode';                  // 权益绑定验证码（边缘）
export const MODIFY_RIGHTS_PHONE    = '/esapp/hotel-intl/cn/modifyRightsPhone';       // 改绑权益手机号（边缘）

// ==================================================================
// 十、评价 comments（边缘）
// 链路语义：酒店评价列表/详情/点赞/提交（国内+国际）。正常拒绝：无评价/已评价/订单不可评。
// ==================================================================
export const COMMENT_LIST           = '/esapp/hotel/getCommentList';                 // 评价列表(国内，边缘)
export const COMMENT_DETAIL         = '/esapp/hotel/commentDetail';                 // 评价详情(国内，边缘)
export const COMMENT_LIKE           = '/esapp/hotel/commentLike';                   // 评价点赞(国内，边缘)
export const COMMENT_SUBMIT         = '/esapp/hotel/comment';                       // 提交评价(国内，边缘)
export const COMMENT_LIST_INTL      = '/esapp/hotel-intl/hotelOrderReviewList';      // 评价列表(国际，边缘)
export const COMMENT_DETAIL_INTL    = '/esapp/hotel-intl/hotelOrderReviewDetail';    // 评价详情(国际，边缘)
export const COMMENT_LIKE_INTL      = '/esapp/hotel-intl/likeHotelOrderReview';      // 评价点赞(国际，边缘)
export const COMMENT_SUBMIT_INTL    = '/esapp/hotel-intl/submitHotelOrderReview';    // 提交评价(国际，边缘)

// ==================================================================
// 十一、NPS / 分享 / 实验（/esapp 下的弱业务，边缘）
// 链路语义：NPS 问卷、分享转换、AB 实验、FeatureToggle。正常拒绝：不展示/未命中实验。
// ==================================================================
export const NPS_CARD               = '/esapp/hotel-intl/nps/card';                 // NPS 卡片是否展示（边缘）
export const NPS_REWARD             = '/esapp/hotel-intl/nps/reward';               // NPS 卡片提交/关闭（边缘）
export const TRANSFER_STATELESS     = '/esapp/category/transfer/stateless';         // 分享 token 转换（中台，边缘）
export const AB_MASTER              = '/esapp/hotel-intl/getABMaster';              // AB 实验分组（边缘）
export const FEATURE_TOGGLE         = '/esapp/hotel-intl/getFeatureToggle';         // FeatureToggle 配置（边缘）

// ==================================================================
// 十二、非 /esapp/ 接口（non-core：不在自有前缀 /esapp/ 下 → 路由到 non-core.md）
// 注：qingfeng/intercept 虽非 /esapp/，但阻塞下单，已提升进 ownedPrefixes 归到第四组核心，不在此列。
// ==================================================================
export const ORDER_POINT            = '/eos/eos/bcoupon/point/app/hotel/finishOrderPoint';        // 完成订单积分（三方，边缘）
export const RECOMMEND_BOOKING      = '/eos/eos/rule/api/recommendBooking/getRecommendBookingInfo'; // 推荐预订信息（三方，边缘）
export const PROMOTION_LIST         = '/eos/api/eos/promotion/list/v4';               // 营销活动列表（三方，边缘）
export const CHECK_PHONE_TAGS       = '/eos/api/eos/tag/checkPhoneAndTags';           // 校验人群标签（三方，边缘）
export const PERCEIVE_APP_INFO      = '/perceive/api/client/getAppInfo';              // 感知中心 app 信息（三方，边缘）
export const PERCEIVE_MEMBER_LIST   = '/perceive/api/client/getPerceiveMemberList';   // 感知筛选活动物料（三方，边缘）

/* ------------------------------------------------------------------
 * 已剔除的死代码（不进 live 清单，列此备查）：
 *   - /esapp/hotel/getCheckerList（审批人）：已改走管控 SDK fetchCheckerListV2，src/api 里无业务调用方。
 *   - /esapp/helios/requisitions/getHotelReqList（合住人校验）：已改走 SDK fetchHotelReqList，无业务调用方。
 *   - /esapp/hotel-intl/queryOrderList/v1（调试订单列表）：devOrderList.mpx 在 app.mpx 已注释，非正式页面。
 *
 * 动态路径：无真正路径参数段。国内/国际仅是三元在两条固定 pathname 间二选一，已各自独立列出，无需归一。
 *
 * 待你人工拍板：
 *   1) 归属：ownedPrefixes = ['/esapp/', '/qingfeng/qingfeng/core/hotel/intercept']；/eos、/perceive 走 non-core。确认无误。
 *   2) qingfeng/intercept 已按"阻塞下单=核心"提升进 ownedPrefixes、归第四组核心（下游 rules 需给它一条映射到 order 的规则）。确认此处理。
 *   3) 核心/边缘（只影响 severity 基线）：主流程链(入口→搜索→列表→详情→库存校验→填单→makeOrder→queryOrder→取消/离店)标核心，其余边缘。确认是否符合告警关注面。
 *   4) 死代码 3 条（getCheckerList / getHotelReqList / devOrderList url）——删还是留。
 *   5) 未覆盖：走 EsControlInterface SDK 的管控接口不以 url 字面量出现，无法静态摘取真实 pathname（已在死码处标注）；支付收银台在外部前端不含。
 * ------------------------------------------------------------------ */
