/*
接口请求地址
*/

// NPS 问卷
export const NPS_SURVEY_REWARDS = '/esapp/railway/nps/reward';

// 一键分享 - 获取行程分享展示数据
export const GET_SHARE_ORDER = '/esapp/railway/order/shareSearch';

//审批单 - 获取查询标准接口信息 - 用来获取除了差旅单之外的配置信息
export const GET_CUSTOMER_SERVICE_INFO = '/esapp/railway/home/index';

//-----------------------------下单---------------------------------------------

//下单 - 支付方式鉴权
export const GET_PAY_TYPE = '/esapp/train/getPayType';

//下单 - 预估
export const MULTI_GET_PAY_TYPE = '/esapp/train/multiGetPayType';

export const PRE_AUTH = '/esapp/railway/booking/preAuth';

//下单 - 获取下单基础数据
export const ORDER_BASE_INFO = '/esapp/railway/base/fillPage';

//下单 - 购票
export const MAKE_ORDER = '/esapp/train/makeOrder';

//下单 - 预订发单
export const MAKE_ORDER_REPLACE = '/esapp/railway/makeOrder/index';

//下单 - 改签
export const CHANGE_TICKET_ORDER = '/esapp/train/changeTicket';

////下单 - 获取改签费用明细
export const CHANGE_FEE_DETAIL = '/esapp/railway/change/estimateFee';

//下单 - 支付车票
export const MAKE_PAY = '/esapp/railway/makePay/index';

// 获取第三方支付链接，后续会在 makePay 前置调用
export const GET_PAY_LINK = '/esapp/railway/makePay/getPayLink';

// 获取支付渠道
export const GET_PAY_CHANNEL = '/esapp/railway/makePay/getPayChannel';

// 查询12306渠道的回调支付结果
export const GET_PAY_STATUS = '/esapp/railway/makePay/getPayStatus';

// 确认支付结果
export const MAKE_PAY_CONFIRM = '/esapp/railway/makePay/confirm';

//订单详情-  订单状态查询
export const ORDER_DETAIL = '/esapp/train/order/orderDetail';

//订单详情-  获取交易记录
export const DEAL_DETAIL = '/esapp/train/order/feeDetail';

//订单详情- 部分出票交易记录
export const PART_DEAL_DETAIL = '/esapp/railway/refund/partRefundDetail';

//车次列表 - 查询
export const CHECK_TIME = '/esapp/railway/train/verify';

export const GET_TRAIN_LIST = '/esapp/railway/train/queryLeftTicket';

export const GET_TRANSFER_LIST = '/esapp/railway/train/transferLeftTicket';

//余票查询
export const CHECK_REMAIN = '/esapp/train/queryLeftTicketByTrainNo';

// 车次详情 - 查询当前坐席文案提示
export const DETAIL_TIP = '/esapp/railway/auth/overStandard';

// 公告提醒信息
export const SERVICE_NOTICE = '/esapp/category/info/serviceNotice';

export const IDENTITY_INFO_CHECK = '/esapp/train/user/identityInfoCheck';

// 下单前最后一次校验
export const PRE_ORDER_FINAL_CHECK = '/esapp/railway/auth/check';

//-----------------------------下单---------------------------------------------

//------------------------------退票--------------------------------------------

//下单 - 退票金额查询
export const QUERY_REFUND_TICKET_COST = '/esapp/railway/refund/queryRefundTicketCost';

//退票原因页-确认退票
export const REFUND_TICKET = '/esapp/train/refundTicket';

//退票前置校验
export const REFUND_PRE_CHECK = '/esapp/railway/refund/preCheck';

//关联12306账号
export const REFUND_ACCOUNT_LINK = '/esapp/railway/travelers/accountLink';

//退票详情
export const REFUND_DETAIL = '/esapp/train/order/getRefundInfo';

//改签详情
export const CHANGE_DETAIL = '/esapp/train/order/getChangeInfo';

//查询停靠站信息
export const QUERY_TRAIN_INFO = '/esapp/railway/station/queryStation';

export const CANCEL_TRIP_BEFORE = '/esapp/train/cancelBefore';

//证件类型
export const TRAIN_ID_TYPE_LIST = '/esapp/train/common/idTypeList';

//获取验证码(找回密码)
export const TRAIN_RETRIEVE_PASSWORD = '/esapp/train/user/retrievePassword';

//密码找回 提交
export const TRAIN_VALIDATE_PASSWORD = '/esapp/train/user/sendCaptchaResult';

//一键登录核验
export const ONE_CLICK_LOGIN = '/esapp/railway/user/getUserAccountInfo';

//查询全车次固定日期余票信息
export const TRAIN_DETAIL_ESTIMATE = '/esapp/railway/estimate/direct';

export const TRAIN_DETAIL_CHANGE_ESTIMATE = '/esapp/railway/estimate/change';

//查询全车次固定日期余票信息
export const TRAIN_INFO_BY_NO = '/esapp/train/estimate/indexV2';
//查询中转全车次固定日期余票信息
export const TRANSFER_TRAIN_INFO_BY_NO = '/esapp/train/transfer/estimate/indexV2';

//登录
export const LOGIN_12306_API = '/esapp/train/user/login';

//退出登录
export const LOGIN_OUT_12306_API = '/esapp/train/user/logout';

export const REGISTER_12306_API = '/esapp/railway/user/register';

export const ID_TYPE_MAP_API = '/esapp/railway/user/register/form';

//人脸核验
export const FACE_VERIFICATION_12306_API = '/esapp/train/user/faceVerification';

export const MESSAGE_VERIFICATION_12306_API = '/esapp/train/user/messageVerification';

// 短信验证码校验
export const MESSAGE_VERIFICATION_SEND_CODE = '/esapp/railway/user/messageVerificationSendCode';

//保存出行人信息
export const SAVE_CONTACT_INFO = '/esapp/train/user/add';

//用户预定校验
export const USER_REVERSE = '/esapp/train/user/reverse';

export const GET_RESULT_INFO = '/esapp/railway/order/pageInfo';

// ------抢票-------
// 抢票人员鉴权
export const GET_GRAB_SEAT_AUTH = '/esapp/railway/grab/seatAuth';
// 抢票预订前鉴权
export const GET_GRAB_PRE_AUTH = '/esapp/railway/grab/booking/preAuth';
export const GET_CHANGE_TRIP = '/esapp/train/tripList/index';
export const GET_STOP_TRAFFIC_CHECK = '/esapp/train/change/stopTraffic/check';

//外国护照核验接口
export const IDENTITY_VERIFICATION = '/esapp/railway/travelers/identityVerification';
// 外国护照核验结果查询
export const IDENTITY_VERIFICATION_QUERY = '/esapp/railway/travelers/identityVerificationQuery';
export const GET_CHANGE_REMARK = '/esapp/railway/remark/history';
// 改签
export const CHANGE_CHECK = '/esapp/railway/change/checkChanging';
export const GET_ORDER_STATUS = '/esapp/railway/order/getOrderStatus';

export const GET_PERSONNEL_VERIFICATION = '/esapp/railway/travelers/personnelVerification';
export const GET_PERSONNEL_VERIFICATION_STATUS = '/esapp/railway/travelers/personnelVerificationQuery';

export const GET_PERSONNEL_VERIFICATION_NOTICE = '/esapp/railway/travelers/personnelVerificationNotice';

// 一体化推荐
// 接口文档：https://chibi.intra.xiaojukeji.com/#/docDetail?id=668d3431781b010a8c35f6a1&version=1.0.3&revision=5&branch=f-j-integration#GetCategoryRecommend
export const GET_TRAIN_RECOMMEND = '/esapp/railway/trip/recommend';
export const GET_MAS_ORDER_QUANTITY = '/esapp/mars/cn/query-order-quantity/v1';
export const GET_MAS_ORDER_CANCEL = '/esapp/mars/cn/cancel-order/v1';

//改签 - 获取改签费用明细
//接口文档 https://cooper.didichuxing.com/docs2/document/2205117481963
export const CHANGE_FEE_MAKE = '/esapp/railway/change/preAuth';

// 支付宝企业码授权状态查询
export const GET_ALIPAY_AUTH_STATUS = '/esapp/railway/payment/authStatus';
