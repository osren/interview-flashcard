# 分类：用户与鉴权（user-auth）

涉及接口（登录/注册/12306 账号/实名核验/出行人）：
- 登录注册：`/esapp/train/user/login`（12306 登录）、`/esapp/train/user/logout`、`/esapp/railway/user/register`、`/esapp/railway/user/register/form`、`/esapp/railway/user/getUserAccountInfo`（一键登录信息核验）
- 找回密码/验证码/人脸：`/esapp/train/user/retrievePassword`、`/esapp/train/user/sendCaptchaResult`、`/esapp/train/user/messageVerification`（短信校验）、`/esapp/railway/user/messageVerificationSendCode`（发送短信验证码）、`/esapp/train/user/faceVerification`（人脸核验）
- 12306 账号/实名核验：`/esapp/railway/travelers/accountLink`（关联 12306 账号）、`/esapp/railway/travelers/identityVerification`（外国护照核验）、`/esapp/railway/travelers/identityVerificationQuery`、`/esapp/railway/travelers/personnelVerification`（人证核验）、`/esapp/railway/travelers/personnelVerificationQuery`、`/esapp/railway/travelers/personnelVerificationNotice`
- 出行人/证件：`/esapp/train/travelers/travelersAllQuery`、`/esapp/train/travelers/travelersOnceAdd`、`/esapp/train/travelers/travelersValidate`（+ `travelersValidateQuery`）、`/esapp/train/travelers/travelersBatchDel`（+ `travelersBatchDelQuery`）、`/esapp/train/common/idTypeList`（证件类型列表）

## 判定要点

- 登录、12306 账号关联、实名/人脸核验是下单**前置门槛**，`server_error`/`timeout`/`dependency_error`（12306、核验下游）阻断登录或核验 → 上报，基线 `P1`，大面积 `P0`。
- `auth_failed`：单用户登录态失效、密码错误、验证码错误属预期交互结果 → `business_reject`，不上报；但若**批量/高频** `auth_failed`（疑似鉴权服务异常）→ 升级上报 `P1`。
- **核验类预期内拒绝 → `business_reject`，不上报**：登录风控走静默 `10608`；出行人/护照/人证核验通过前返回"待核验"属预期；人脸不通过、护照核验未通过、信息不匹配；退票场景需 `2036` 关联 12306 账号。
- 证件类型、出行人增删查（idTypeList / travelers 增删查）基线 `P2`；若失败阻断下单填单则升 `P1`。
- 验证码下发失败（messageVerificationSendCode）批量异常 → `P1`（影响所有需短信验证的用户）。
