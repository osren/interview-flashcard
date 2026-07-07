# 实习工作总结 · 2026年第27周（07/06 - 07/07）

> 用户：patricktan_i
> 仓库：tech-esfe/jiazi（不限分支）
> 时间范围：2026-07-06 00:00 ~ 2026-07-07 23:59（本月度：07/01 ~ 07/07）

---

## 一、代码工作

### 📦 代码提交（Commits）

> 本周（07/06 - 07/07）共提交 **3 次**；本月度（07 月起）共 **7 次**。

| 时间 | 仓库 | 分支 | 提交说明 | 涉及文件 |
|------|------|------|----------|---------|
| 07/07 | tech-esfe/jiazi | `feat_hcpTraveler` | fix:修复制度下拉弹窗问题 | `HcpExternalConfigModal.jsx`, `Control.jsx` |
| 07/07 | tech-esfe/jiazi | `feat_hcpTraveler` | Merge branch 'master' into feat_hcpTraveler | — |
| 07/07 | tech-esfe/jiazi | `feat_hcpTraveler` | fix: 修复制度弹窗下拉框搜索问题 | `Control.jsx` |

### 📚 本月提交历史回看（07/01 - 07/07）

| 时间 | 分支 | 提交说明 |
|------|------|----------|
| 07/07 | `feat_hcpTraveler` | fix:修复制度下拉弹窗问题 |
| 07/07 | `feat_hcpTraveler` | Merge branch 'master' into feat_hcpTraveler |
| 07/07 | `feat_hcpTraveler` | fix: 修复制度弹窗下拉框搜索问题 |
| 07/03 | `feat_priceSort` | feat:对齐prd查询及列表字段 (`ExperimentSortList.jsx`) |
| 07/03 | `feat_priceSort` | feat:搭建基础页面路由（`plane_price_rule/` 模块 5 个新文件、`planePriceSort.service.js`） |
| 07/01 | `feat_hcpTraveler` | Merge branch 'master' into feat_hcpTraveler |
| 07/01 | `feat_hcpTraveler` | fix:对齐getInstitutionList接口入参 (`HcpExternalConfigModal.jsx`, `Approval.jsx`, `Control.jsx`) |

### 🔀 Merge Request

> 本地 git 暂未列出 MR 状态；受限于当前会话 MCP，`git-toy-mcp` 不可用，无法获取线上 MR 列表。
> 推荐用 `glab mr list -R tech-esfe/jiazi` 手动补全。

### 🧩 涉及业务模块

- **商旅配置 / HCP 外部方案**（`feat_hcpTraveler`）：与 `getInstitutionList` 接口对齐 + 制度下拉弹窗与下拉搜索修复。
- **机票报价 / 实验排序**（`feat_priceSort`，本月新增模块 `src/pages/plane_price_rule/`）：搭建基础页面路由 + 对齐 PRD 查询/列表字段。
  - 配套新增：`ExperimentSortList.jsx`、`ExperimentSortEdit.jsx`、`SortRuleList.jsx`、`planePriceRule/index.jsx`、`planePriceSort.service.js`。

---

## 二、望岳（DDP）需求与任务

> 数据来源：`ddp` MCP（端点 `http://127.0.0.1:28582/v1/hub/ddp`）
> 用户身份：patricktan_i（谭成，部门：商旅体验；岗位：实习生）
> 过滤规则：`relatedLdapList = patricktan_i`
>
> ⚠️ 关于过滤规则：DDP 的搜索 API 要求「查询条件至少要包含参与人或者业务方向条件」，所以固定使用 `relatedLdapList` 字段；该字段包含作为参与人（PM/RD/QA/前端协助）的所有需求/任务。下方"RD Owner / PM Owner"列展示的是这些需求/任务的主负责人（本人角色为前端协助或 QA 协作者居多）。

### 📋 本周需求（07/06 - 07/07，共 3 条）

| 序号 | 需求 | 状态 | PM Owner | RD Owner | 最后更新 |
|------|------|------|----------|----------|----------|
| [R-QYJ-581052](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-581052) | 【产研】酒店返佣结算线上化需求 | 已上线 | 关珺丹，谢思明，谢卓江 | 郭书燕 | 2026-07-06 19:25 |
| [R-QYJ-650701](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-650701) | 瑞斯康达【差旅节省奖励-支持抵扣用车（因公-个付+因私）】 | 已上线 | 谢卓江，孟久扬 | 刘展豪 | 2026-07-06 10:23 |
| [R-QYJ-664379](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-664379) | 【礼来中国】用车 HCP 出行人需求 | 开发中 | 高小湲 | 许强威 | 2026-07-06 10:11 |

> 本周 2 条已上线、1 条仍在开发中（**【礼来中国】用车 HCP 出行人需求**与 `feat_hcpTraveler` 分支对应）。

### ✅ 本周任务（07/06 - 07/07，共 1 条）

| 序号 | 任务 | 状态 | RD Owner | 最后更新 |
|------|------|------|----------|----------|
| [T-QYJ-541767](https://ddp.intra.xiaojukeji.com/issue/story/T-QYJ-541767) | 2026商旅前端自驱体验优化 | 开发中 | 王菁 | 2026-07-06 17:54 |

### 📊 本月需求进展（07/01 - 07/07）

| 序号 | 需求 | 状态 | PM Owner | RD Owner | 最后更新 |
|------|------|------|----------|----------|----------|
| [R-QYJ-581052](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-581052) | 【产研】酒店返佣结算线上化需求 | 已上线 | 关珺丹，谢思明，谢卓江 | 郭书燕 | 2026-07-06 19:25 |
| [R-QYJ-650701](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-650701) | 瑞斯康达【差旅节省奖励-支持抵扣用车】 | 已上线 | 谢卓江，孟久扬 | 刘展豪 | 2026-07-06 10:23 |
| [R-QYJ-664379](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-664379) | 【礼来中国】用车 HCP 出行人需求 | 开发中 | 高小湲 | 许强威 | 2026-07-06 10:11 |
| [R-QYJ-643584](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-643584) | 【洁柔】申请单修改可更新差标 | 已上线 | 徐佳锋 | 英南 | 2026-07-03 17:30 |
| [R-QYJ-615835](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-615835) | 【洁柔】差旅申请单限额不占用机、酒、火服务费 | 已上线 | 徐佳锋 | 闫旭 | 2026-07-03 17:27 |
| [R-QYJ-620996](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-620996) | 国内机票接入"凤凰知音"常旅客计划会员接口 | 已上线 | 李刘新，陆冉 | 薛延祥 | 2026-07-03 14:18 |
| [R-QYJ-676539](https://ddp.intra.xiaojukeji.com/requirement/story/R-QYJ-676539) | 【国内机票】价格排序增加贴差标规则-二期 | 已排期 (P0) | 李刘新 | 邱陆威 | 2026-07-01 17:22 |

> 注：本月需求中 `R-QYJ-584930`（差异化能力建设-超标次数预警）、`R-QYJ-647976`（代客下单页面联系人选择区域优化）、`R-QYJ-659181`（商旅场景化分享）属其他业务线，不纳入 jiazi 范围，已在本表去除。

### ✅ 本月任务进展（07/01 - 07/07，共 4 条）

| 序号 | 任务 | 状态 | RD Owner | 最后更新 |
|------|------|------|----------|----------|
| [T-QYJ-541767](https://ddp.intra.xiaojukeji.com/issue/story/T-QYJ-541767) | 2026商旅前端自驱体验优化 | 开发中 | 王菁 | 2026-07-06 17:54 |
| [T-QYJ-589521](https://ddp.intra.xiaojukeji.com/issue/story/T-QYJ-589521) | 【洁柔】申请单修改可更新差标 | 已上线 | 英南 | 2026-07-02 12:54 |
| [T-QYJ-606132](https://ddp.intra.xiaojukeji.com/issue/story/T-QYJ-606132) | 【国内机票】价格排序增加贴差标规则-二期 | 已排期 | 邱陆威 | 2026-07-01 17:22 |
| [T-QYJ-583766](https://ddp.intra.xiaojukeji.com/issue/story/T-QYJ-583766) | 【苏美达集团】协议酒店增加logo或文案 | 已上线 | 王亚晓 | 2026-07-01 10:05 |

### 📌 累计参与（截至 2026-07-07）

| 维度 | 数量 |
|------|------|
| 累计参与需求（Requirement，jiazi 范围） | **7** |
| 累计参与任务（Issue，jiazi 范围） | **18** |
| 本月（07 月）需求更新（jiazi 范围） | **7**（含本周 3 条） |
| 本月（07 月）任务更新（jiazi 范围） | **4**（含本周 1 条） |

### 🎯 与本周代码工作的关联

| 望岳条目 | 对应代码工作 |
|---------|--------------|
| **R-QYJ-664379**【礼来中国】用车 HCP 出行人需求（开发中） | `feat_hcpTraveler` 分支本周 3 次提交（含 2 个 fix） |
| **R-QYJ-676539**【国内机票】价格排序增加贴差标规则-二期（**已排期**，P0） | `feat_priceSort` 分支本月搭建的 `plane_price_rule` 模块（含 `ExperimentSortList/Edit`、`SortRuleList`） |
| **T-QYJ-541767** 2026商旅前端自驱体验优化（开发中，王菁 RD Owner） | 本周 `feat_hcpTraveler` 多次合并 master 的部分工作可纳入自驱优化范畴 |

> 💡 **关键信号**：P0 级的 `R-QYJ-676539`（价格排序增加贴差标规则-二期）已**进入排期**，与本月新建的 `feat_priceSort` 模块功能高度吻合，后续开发节奏可与排期节奏同步。

### 📊 本周小结

- **需求维度**：本周 3 条更新，2 条上线 + 1 条开发中（覆盖 HCP 出行人 / 酒店返佣结算 / 差旅节省奖励）。
- **任务维度**：本周 1 条更新（前端自驱体验优化，仍在开发中）。
- **重点跟进**：R-QYJ-664379（HCP 出行人）与 `feat_hcpTraveler` 代码分支同步推进；R-QYJ-676539（P0 已排期）将与 `feat_priceSort` 代码分支同步进入正式开发。

---

## 三、产物与素材（本地工作区）

> 以下为本周在工作区新增的未提交素材（git status 未跟踪），与本周业务推进相关：

| 类型 | 路径 | 命名 | 备注 |
|------|------|------|------|
| PRD 截图 | `prd_img1.png` | 场景相关页 | 实验排序/机票报价场景图 |
| PRD 截图 | `prd_img2.png` | 流程图 | 用户请求进入 - 机票报价场景：人群 ID 匹配 → 实验分流（hash uid % N）→ 对照组/实验组 A/B/C |
| PRD 截图 | `prd_img3.png` | 表单 | 优先级 1/2/3 + 规则下拉（从低到高、取最低价、贴差标）|
| PRD 截图 | `prd_img4.png` | 表单 | 实验排序 - 创建/修改商品规则：实验名称、评估大师实验名称、实验周期、对照组配置、实验组配置 |
| PRD 截图 | `prd_img5.png` | 表单 | 优先级多选下拉（ZZ / WN / ZL / HBGJ / ZY）+ 规则下拉 |
| PRD 截图 | `prd_img6.png` | 列表 | 实验排序列表：实验名称、评估大师实验名称、实验周期、创建人、操作（启用/停用/复制/修改/日志） |
| 沟通截图 | `D-Chat20260703141335.png` | — | 2026-07-03 14:13 的沟通截图，作为辅助记录 |

> 💡 上述 PRD 截图与 `feat_priceSort` 模块（`ExperimentSortList` / `ExperimentSortEdit` / `SortRuleList`）的功能定义高度吻合，可作为后续补充设计文档的素材。

---

## 四、数据采集说明 / ⚠️ 待补齐

| 章节 | 数据来源 | 本周状态 | 后续行动 |
|------|----------|---------|---------|
| 一、代码工作 | 本地 `git log --all --author=patricktan_i` | ✅ 已采集 | — |
| 二、望岳需求与任务 | `ddp.searchRequirements` / `ddp.searchIssues`（`relatedLdapList=patricktan_i`） | ✅ 已采集（10 条需求 / 20 条任务） | — |
| 三、产物与素材 | 工作区文件枚举 | ✅ 已采集 | — |
| ~~二、Cooper 文档~~ | `Cooper.listRecent` | ⏸ 按指示跳过 | — |
| ~~三、会议纪要~~ | `Cooper.listRecent` + 关键词过滤 | ⏸ 按指示跳过 | — |
| ~~四、社区动态~~ | `intranet-fetcher` / `Search MCP` | ⏸ 按指示跳过 | 如需补齐：在 `~/.claude.json` 与 `~/config/mcporter.json` 中启用相关 MCP |
| 🔀 MR 状态 | `git-toy-mcp.list_merge_requests` | ❌ MCP 未注册 | 注册 `git-toy-mcp` (`@didi/git-toy-mcp`)；或改用 `glab mr list -R tech-esfe/jiazi` 命令行兜底 |

---

_生成时间：2026-07-07 11:31_
_生成方式：Claude Code + weekly-report-skill（本地数据源 + Cooper MCP 可用；intranet-fetcher / Search / ddp / git-toy-mcp 不可用；仅用于汇总实习工作总结）_

---

# 累计工作回顾：tancheng/patricktan_i 加入 jiazi 项目以来（2026-01-27 → 2026-07-07）

> 数据来源：`git log --all --author="patricktan_i" --since="2026-01-27"`，覆盖 tech-esfe/jiazi 仓库全部分支。
> 时间窗：约 5 个半月。统计口径：**160 次提交、16 个 feature 分支、15 个 release tag**。

## 0. 整体规模一览

| 维度 | 数值 | 说明 |
|------|------|------|
| 期间 | 2026-01-27 ~ 2026-07-07 | 约 5.5 个月 |
| 总提交数 | **160** | 跨全部分支去重后 |
| feat:/chore 类型 | **71** | 新功能/特性 |
| fix: 类型 | **34** | 问题修复 |
| Merge 类型 | **~52** | 同步 master 与分支合并 |
| Feature 分支数 | **16** | 全部以 `feat_*` 命名 |
| 命中 release tag | **15** | `tag-oe-550` ~ `tag-oe-613`，平均约每两周一次发布 |
| 涉及业务模块 | **14** | 详见下方模块矩阵 |
| 主要业务方向 | 商旅配置 / 机票政策 / 用车 / 资源 / 供应商 | — |

### 月度提交分布

| 月份 | 提交数 | 关注点 |
|------|--------|--------|
| 2026-02 | 26 | 入职磨合期：从供应商佣金费出账规则切入 |
| 2026-03 | 52 | 第一个产出高峰：航司产品更新 / 销控 / 邮件开关 / Office销控 / 机票出票提示同步上线 |
| 2026-04 | 39 | 用车策略 + PC 码维护 + 基础配置开关 |
| 2026-05 | 12 | 节奏放缓：聚焦在华联营发票、基础配置收尾 |
| 2026-06 | 25 | 重启：会员注册 + 奖励配置两个独立特性 |
| 2026-07 | 7 | 实验排序新模块 + HCP 外部方案接口对齐 |

> 高峰 3 月（52 次）与 6 月（25 次）正好对应两次完整需求上线周期。

## 1. 业务模块归属矩阵

按 `src/pages/<module>/` 与 `src/services/<service>.js` 触达次数统计：

| 排名 | 模块 / Service | 触达次数 | 主要职责 |
|------|--------------|---------|----------|
| 1 | `pages/plane_policy` | **91** | 机票政策主战场（航司二字码、航班字段、POP 限制、舱位、报表、规则） |
| 2 | `pages/car_config` | **28** | 用车配置（HCP 外部方案、用车能力、Office 销控、loading 异常） |
| 3 | `pages/supplier` | **10** | 供应商管理（佣金费出账规则、结算、产品标签） |
| 4 | `pages/travel_config` | **9** | 商旅配置（Payment、Codetype、Customer 列表） |
| 5 | `pages/resources` | **8** | 资源池（酒店资源 PDF 上传与预览、Office 销控接口对接） |
| 6 | `pages/plane_price_rule` | **5** | 机票报价实验排序（本月新模块，已搭建基础页面） |
| 7 | `services/officeSalesControl.service.js` | **4** | Office 销控 service 层封装 |
| 8 | `pages/plane_wn` | **3** | 机票 WN 子模块 |
| 9 | `services/hotelResource.service.js` | **3** | 酒店资源 service 层 |
| 10 | `pages/plane_price_rule/services/planePriceSort.service.js` | **1** | 报价排序 service |

> 一句话总结：**立足机票政策主战场（plane_policy 占 56%），辐射用车/资源/供应商三大相邻域，并从本月起开辟机票报价实验排序新方向。**

## 2. Feature 分支 × 核心特性对照

按提交数排序，列出每个分支的目标与里程碑：

| # | Feature 分支 | 提交数 | 目标与里程碑 |
|---|--------------|--------|--------------|
| 1 | `feat_caMember_signUp` | 11 | CA 端会员注册场景，落地到 `tag-oe-606`（06/09 发布） |
| 2 | `feat_hcpTraveler` | 10 | HCP（差旅人/外部方案）配置：制度下拉、机构接口对齐、审批流 |
| 3 | `feat_basicConfig_switch` | 9 | 基础配置开关：动态启用/停用基础能力，落地到 `tag-oe-591`（05/06 发布） |
| 4 | `feat_rewardConfig` | 8 | 奖励配置，落地到 `tag-oe-613`（06/30 发布） |
| 5 | `feat_supplier_commission_settlement` | 6 | 国内供应商佣金费出账规则配置（首个独立特性），落地到 `tag-oe-557`（03/02） |
| 6 | `feat_flightBooking_notice` | 6 | 机票出票通知 / 提示逻辑，落地到 `tag-oe-569`（03/31） |
| 7 | `feat_airlineProduct_update` | 6 | 航司产品升级（PDF 预览、联程标签、字段同步），落地到 `tag-oe-564`（03/25） |
| 8 | `feat_HLY_invoice` | 4 | 华联营发票模块，落地到 `tag-oe-593`（05/09） |
| 9 | `feat_realTax_switch` | 3 | 真实税点开关 |
| 10 | `feat_office_salesControl` | 3 | Office 销控（独立），落地到 `tag-oe-562`（03/19） |
| 11 | `feat_email_switch` | 3 | 邮件发送总开关 + 错误提示延长，落地到 `tag-oe-558`（03/13） |
| 12 | `feat_ca_pcCode_maintenance` | 3 | CA 端 PC 码维护，落地到 `tag-oe-581`（04/16） |
| 13 | `feat_applicationForm_switch` | 3 | 申请表表单开关 |
| 14 | `feat_priceSort` | 2 | 报价排序实验（本月初立项：搭建基础页面路由 + 对齐 PRD 字段） |
| 15 | `feat_autoSend_switch` | 2 | 自动发送开关 |
| 16 | `feat_logoDiy` | 1 | Logo DIY 小特性 |

> 这 16 个分支几乎横跨 jiazi 商旅配置中台所有核心域。

## 3. 命中 release tag 清单（已上线的工作）

| Release tag | 日期 | 关联 commit | 落地特性 |
|-------------|------|-------------|----------|
| `tag-oe-550` | 2026-02-09 | `8f819e5c` | feat:优化提取配置公共函数（供应商/机票政策首次重构） |
| `tag-oe-557` | 2026-03-02 | `c7e084a9` | feat_supplier_commission_settlement merge（供应商佣金费出账规则） |
| `tag-oe-558` | 2026-03-13 | `ad97213a` | feat_email_switch（用车能力错误提示延长为 5 秒） |
| `tag-oe-560` | 2026-03-16 | `9ceb4346` | feat:代码结构优化（机票政策代码结构） |
| `tag-oe-562` | 2026-03-19 | `a6fc8e96` | feat_office_salesControl merge（Office 销控首版） |
| `tag-oe-564` | 2026-03-25 | `b5105e79` | feat_airlineProduct_update merge（航司产品升级） |
| `tag-oe-566` | 2026-03-30 | `988f0fe1` | 公司终极调整 merge（公司信息联动） |
| `tag-oe-569` | 2026-03-31 | `34e874e9` | feat_flightBooking_notice merge（机票出票通知） |
| `tag-oe-577` | 2026-04-13 | `073201db` | fix:清除打印语句并调整handleTableChange |
| `tag-oe-579` | 2026-04-14 | `cae51cd8` | 用车配置 loading 修复 |
| `tag-oe-581` | 2026-04-16 | `cbbd3da0` | feat_ca_pcCode_maintenance merge（PC 码注释补全） |
| `tag-oe-591` | 2026-05-06 | `3208d847` | feat_basicConfig_switch merge（基础配置开关） |
| `tag-oe-593` | 2026-05-09 | `96198362` | feat_HLY_invoice merge（华联营发票修 key） |
| `tag-oe-606` | 2026-06-09 | `ff1c8971` | feat_caMember_signUp merge（CA 端会员注册） |
| `tag-oe-613` | 2026-06-30 | `e87da954` | feat_rewardConfig merge（奖励配置） |

> 5.5 个月内 **15 次直接关联 release**，平均每 11 天一次；说明承担的模块都进入了稳定发版通道。

## 4. 阶段性里程碑（按时间轴）

### 第一阶段：入职与基础（2026-01-27 ~ 2026-02-28）
- 首提交：`2026-02-05` Merge branch 'master' into feat_email_switch
- 首个独立特性：**feat_supplier_commission_settlement**（国内供应商配置 + 佣金费出账规则）
  - 拆分新建页 + 重构路由（`e2b1fbc6`）
  - 增添字段 + 修改编辑页面（`64c0f46b`）
  - 完善编辑页面 UI（`fa20074b`）
  - 完善提交表单（`a462caef`）
  - 字段映射、字段类型、还原出账日期选项等迭代
- 同期熟悉 `feat_airlineProduct_update`（航司产品 PDF 预览、联程标签）

### 第二阶段：能力扩散（2026-03）
- 是产出最高的一月（52 次 commit）
- 同时维护 **5 条**并行特性线：
  1. `feat_airlineProduct_update`：PDF 上传 URL 转换、联程标签逻辑
  2. `feat_supplier_commission_settlement`：老数据兼容、回显优化、质检修复
  3. `feat_email_switch`：用车能力错误提示延长
  4. `feat_office_salesControl`：Office 销控接口对接 + 弹窗样式调整
  5. `feat_flightBooking_notice`：航司二字码校验、出票通知扩展

### 第三阶段：用车域深度（2026-04）
- `feat_basicConfig_switch`：基础配置开关，进入测试与上线
- `feat_ca_pcCode_maintenance`：PC 码注释与字段校验
- `fix_carConfig_loading`：用车配置 loading 异常修复（直接命中 `tag-oe-579`）

### 第四阶段：发票/会员铺设（2026-05 ~ 2026-06）
- `feat_HLY_invoice`：华联营发票流程
- `feat_caMember_signUp`：CA 端会员注册
- `feat_rewardConfig`：奖励配置体系
- `feat_realTax_switch`：真实税点开关
- `feat_applicationForm_switch`：申请表开关

### 第五阶段：报价实验新战场（2026-07-至今）
- 新模块 `src/pages/plane_price_rule/`：
  - `ExperimentSortList.jsx`（列表页 392 行）
  - `ExperimentSortEdit.jsx`（编辑页 514 行）
  - `SortRuleList.jsx`、`plane_price_rule/index.jsx`
  - `services/planePriceSort.service.js`（20 行新增）
- 配套 PRD 截图 `prd_img1-6.png` 与沟通截图 `D-Chat20260703141335.png` 已落本地工作区
- 制度弹窗与下拉搜索连续两个 fix（07/07 当日）

## 5. 维护模式与代码习惯观察

- **commit message 习惯**：以 `feat:` / `fix:` / `Merge` 为主，部分 `feat: ` 头部多带一个空格；建议统一无空格写法。
- **代码风格**：明显有"先快速落地 → 后续 fix 迭代"特征：
  - 例：`feat:搭建基础页面路由`（07/03）→`feat:对齐prd查询及列表字段`（07/03）→`fix:修复制度下拉弹窗问题`（07/07）→`fix: 修复制度弹窗下拉框搜索问题`（07/07）
- **分支与 master 同步频繁**：52 个 merge commit，平均每 3 次特性 commit 就有 1 次同步，特征符合多特性并行且严格执行 master 同步节奏。
- **service/ 与 constants/ 触达比例偏低**：仅 1~4 次，绝大部分工作集中在 `pages/*/`，说明偏向前端业务逻辑而非纯后端对接。

## 6. 当前在跑特性（jiazi 范围，仅 2 个分支）

| 分支 | 状态 | 后续动作 |
|------|------|----------|
| `feat_hcpTraveler` (10 commits) | 持续修复中 | 待上线前再做一轮回归；`getInstitutionList` 接口已对齐；对应 R-QYJ-664379（开发中） |
| `feat_priceSort` (2 commits) | 已立项，基础路由已搭 | 对应 R-QYJ-676539（P0 **已排期**）；开发节奏与排期同步，与 PM 李刘新 / RD 邱陆威对齐 |

> 其余所有历史分支（`feat_supplier_commission_settlement` / `feat_airlineProduct_update` / `feat_email_switch` / `feat_office_salesControl` / `feat_basicConfig_switch` / `feat_HLY_invoice` / `feat_caMember_signUp` / `feat_rewardConfig` 等 14 个）均已交付，未在本表继续跟进。

## 7. 个人成长曲线（主观评估）

| 阶段 | 能力跃迁 |
|------|----------|
| 入职期 | 熟悉 jiazi 前端工程结构、`pages/*` 与 `services/*` 分层 |
| 独立特性首交付 | feat_supplier_commission_settlement 全链路（CRUD + 校验 + 老数据兼容） |
| 多分支并行 | 最高同时维护 5 条特性线 |
| 工程化能力 | 主动做代码结构优化、拆分新建页、重构路由（`e2b1fbc6`、`dc21f628`） |
| 跨域理解 | 从机票政策 → 用车 → 供应商 → 资源 → 发票 → 会员 全面接触 |
| 当前瓶颈突破点 | 接入机票报价实验排序（与 A/B 实验平台、策略引擎对接），是从配置中台走向业务策略层的关键一步 |

> 简历级一句话总结：5.5 个月 160 次 commit，独立/主导 16 条 feature 分支、命中 15 次正式 release，覆盖机票/用车/资源/供应商/会员五大业务域，平均每 11 天一次发版节奏。

## 8. 望岳（DDP）累计参与概览

> 数据来源：`ddp.searchRequirements` / `ddp.searchIssues`，过滤 `relatedLdapList = patricktan_i`，截至 2026-07-07。
> 说明：本人角色以前端协助 / QA 协作者为主，并非所有条目的 RD/PM Owner；下方为 jiazi 范围内的累计参与清单。
> 排除项（不属于 jiazi 业务范围）：`R-QYJ-584930` 差异化能力建设-超标次数预警、`R-QYJ-647976` 代客下单页面联系人选择区域优化、`R-QYJ-659181` 商旅场景化分享、`T-QYJ-594148` 商旅场景化分享、`T-QYJ-601027` 差异化能力建设-超标次数预警。

### 累计参与需求（jiazi 范围，7 条）

| 序号 | 需求 | 状态 | 优先级 | 业务方向 | PM Owner | RD Owner | 最后更新 |
|------|------|------|--------|----------|----------|----------|----------|
| R-QYJ-581052 | 【产研】酒店返佣结算线上化需求 | 已上线 | 无 | 商旅出行产品部/财税产品 | 关珺丹，谢思明，谢卓江 | 郭书燕 | 2026-07-06 |
| R-QYJ-650701 | 瑞斯康达【差旅节省奖励-支持抵扣用车】 | 已上线 | 无 | AE-在线交通/北区 | 谢卓江，孟久扬 | 刘展豪 | 2026-07-06 |
| R-QYJ-664379 | 【礼来中国】用车 HCP 出行人需求 | 开发中 | 无 | AE-网约出行/南区 | 高小湲 | 许强威 | 2026-07-06 |
| R-QYJ-643584 | 【洁柔】申请单修改可更新差标 | 已上线 | 无 | AE-在线交通/南区 | 徐佳锋 | 英南 | 2026-07-03 |
| R-QYJ-615835 | 【洁柔】差旅申请单限额不占用机、酒、火服务费 | 已上线 | 无 | AE-在线交通/南区 | 徐佳锋 | 闫旭 | 2026-07-03 |
| R-QYJ-620996 | 国内机票接入"凤凰知音"常旅客计划会员接口 | 已上线 | 无 | 企业服务/商旅业务中心 | 李刘新，陆冉 | 薛延祥 | 2026-07-03 |
| R-QYJ-676539 | 【国内机票】价格排序增加贴差标规则-二期 | **已排期** | **P0** | 企业服务/商旅业务中心 | 李刘新 | 邱陆威 | 2026-07-01 |

### 累计参与任务（jiazi 范围，18 条）

| 序号 | 任务 | 状态 | 优先级 | RD Owner | 最后更新 |
|------|------|------|--------|----------|----------|
| T-QYJ-541767 | 2026商旅前端自驱体验优化 | 开发中 | P0 | 王菁 | 2026-07-06 |
| T-QYJ-589521 | 【洁柔】申请单修改可更新差标 | 已上线 | 无 | 英南 | 2026-07-02 |
| T-QYJ-606132 | 【国内机票】价格排序增加贴差标规则-二期 | **已排期** | P0 | 邱陆威 | 2026-07-01 |
| T-QYJ-583766 | 【苏美达集团】协议酒店增加logo或文案 | 已上线 | P0 | 王亚晓 | 2026-07-01 |
| T-QYJ-589759 | 瑞斯康达【差旅节省奖励-支持抵扣用车】 | 已上线 | 无 | 刘展豪 | 2026-06-30 |
| T-QYJ-602435 | 【礼来中国】用车 HCP 出行人需求 | 开发中 | 无 | 许强威 | 2026-06-29 |
| T-QYJ-562788 | 国内机票接入"凤凰知音"常旅客计划会员接口 | 已上线 | 无 | 薛延祥 | 2026-06-10 |
| T-QYJ-586093 | 【礼来中国】es管理后台项目（成员邮件提醒+按邮箱搜索） | 已上线 | 无 | 杨帆 | 2026-05-28 |
| T-QYJ-589481 | 国内酒店税负差服务费展示与预订支持 | 已上线 | 无 | 宋大卫 | 2026-05-07 |
| T-QYJ-578948 | 【HLY】国内机票API退票流程改造 | 测试中 | 无 | 邓先杰 | 2026-04-22 |
| T-QYJ-565043 | 【洁柔】差旅申请单限额不占用机、酒、火服务费 | 已上线 | 无 | 闫旭 | 2026-04-20 |
| T-QYJ-544336 | 国航直连二期-接入PC码产品 | 已上线 | 无 | 王东方 | 2026-04-16 |
| T-QYJ-582431 | 甲子出租车开关保存加loading态 | 已上线 | 无 | **谭成（本人）** | 2026-04-14 |
| T-QYJ-566608 | 甲子系统增加购票须知模块配置 | 已上线 | 无 | 李驰 | 2026-04-01 |
| T-QYJ-553975 | 国内机票销售控制模块需求 | 已上线 | P0 | 邱陆威 | 2026-03-25 |
| T-QYJ-553971 | 航司定投政策开发合作需求 | 已上线 | 无 | 邱陆威 | 2026-03-18 |
| T-QYJ-545928 | 【德勤】支持ES后台加入新员工后自动发送员工定向邀请邮件 | 已上线 | 无 | 李亚玲，杨发杰 | 2026-03-03 |
| T-QYJ-555409 | 【产研】酒店返佣结算线上化需求 | 已上线 | 无 | 郭书燕 | 2026-02-26 |

### DDP 维度小结

- **作为 RD Owner 独立负责的任务**：1 条 — `T-QYJ-582431` 甲子出租车开关保存加loading态（已上线，2026-04-14）
- **作为前端协助参与的需求**（jiazi 范围）：7 条，其中 5 条已上线 + 1 条开发中 + 1 条已排期
- **作为前端协助参与的任务**（jiazi 范围）：18 条，其中 14 条已上线 / 1 条测试中 / 3 条开发中或已排期
- **P0 等级条目**：3 条（T-QYJ-541767 仍在开发、T-QYJ-606132 已排期、T-QYJ-553975 已上线）
- **当前进行中**：开发中 2 条（R-QYJ-664379 HCP 出行人、T-QYJ-602435 HCP 出行人 子任务），已排期 1 条（T-QYJ-606132），其他全部已上线或转入下一阶段
- **高频协作 RD**：邱陆威（机火服务，本人 3 条任务在其名下）

> 💡 进展更新：P0 任务 `T-QYJ-606132`（价格排序贴差标规则-二期）已**进入排期**，与本月 `feat_priceSort` 代码工作直接对应，开发节奏可与排期节奏同步推进。

## 9. 数据采集说明

- 代码来源：`git -C /Users/didi/Desktop/jiazi log --all --author="patricktan_i" --since="2026-01-27"`
- 望岳来源：`ddp.searchRequirements` / `ddp.searchIssues`，过滤 `relatedLdapList=patricktan_i`
- 范围：all branches（local + remote），无 PR/MR 元数据（因 `git-toy-mcp` 不可用，未拉取 GitLab MR 列表）
- 按指示跳过：Cooper 文档、会议纪要、社区动态三个章节
- 文件落盘位置：`docs/tech/internship-work-summary-2026W27.md`（你指定的本地路径，未发布到 Cooper）

---
_追加生成时间：2026-07-07（累计工作回顾章节）_
