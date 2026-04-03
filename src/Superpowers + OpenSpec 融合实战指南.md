Superpowers + OpenSpec 融合实战指南
 两套工具如何配合，将"想法"可靠地变成"代码" 

理解两套工具的定位
在开始之前，先搞清楚每套工具解决什么问题：
它们是互补关系，不是竞争关系：
Superpowers 管 AI 的"思维过程"
OpenSpec    管 Spec 的"文件结构"

两者结合 = 思维过程有纪律 + 输出结构可审核
融合工作流全景
┌─────────────────────────────────────────────────────────────┐
│                    完整开发周期                               │
│                                                             │
│  [探索阶段]          [规格阶段]         [实现阶段]            │
│                                                             │
│  superpowers         OpenSpec          superpowers          │
│  /brainstorm    →   /opsx:propose  →   /write-plan     →   │
│  (理解需求,          (生成结构化         (制定实现步骤)        │
│   提出方案)           规格文件)                               │
│                          ↓                                  │
│                     人工审核 Spec                            │
│                          ↓                                  │
│                    /opsx:apply     →   /execute-plan   →   │
│                    (按 tasks.md         (逐步执行,           │
│                     严格执行)            验证每步)            │
│                          ↓                                  │
│                    /opsx:archive                            │
│                    (归档, 积累知识库)                         │
└─────────────────────────────────────────────────────────────┘

实践案例一：后端新功能开发
场景描述
 需求： 给电商系统添加"优惠券"功能，支持满减和折扣两种类型，用户结算时自动计算优惠。 
Step 1：用 /brainstorm 厘清需求边界
在这一步，不急着写代码，先用 Superpowers 做结构化思考：
你：/brainstorm 给电商系统添加优惠券功能
/brainstorm skill 会引导你回答关键问题（每次一问）：
AI: 优惠券的核心使用场景是什么？
    A) 用户主动输入券码
    B) 系统自动匹配最优惠的券
    C) 两者都支持

你：A，用户手动输入券码

AI: 优惠券的生效条件复杂吗？比如：
    A) 只限制最低消费金额
    B) 还有商品分类限制、用户等级限制等
    C) 暂时只做最简单的：只有金额门槛

你：C，先做最简单的
brainstorm 完成后，AI 产出设计文档（保存到 docs/superpowers/specs/2026-04-01-coupon-design.md）：
# 优惠券功能设计

## 范围（IN SCOPE）
- 满减券：满 X 元减 Y 元
- 折扣券：打折，如 9 折
- 用户手动输入券码，结算时验证

## 明确不做（OUT OF SCOPE）
- 优惠券自动匹配
- 商品分类/品牌限制
- 用户等级限制
- 优惠券叠加使用

## 技术方案
- 新增 coupons 表（code, type, value, min_amount, expire_at, is_used）
- 新增 POST /coupons/validate 接口（验证 + 计算折扣）
- 修改 POST /orders 接口（增加可选的 coupon_code 参数）
...
Step 2：用 /opsx:propose 生成结构化规格
设计方案确认后，交给 OpenSpec 生成可审核的 Spec 文件：
你：/opsx:propose 优惠券功能，参考设计文档 docs/superpowers/specs/2026-04-01-coupon-design.md
OpenSpec 自动创建文件结构：
openspec/changes/coupon-feature/
├── proposal.md          ← Why + What Changes + Impact
├── specs/
│   ├── coupon.md        ← 优惠券模块行为规格
│   └── order.md         ← 订单模块 Delta（新增 coupon 支持）
├── design.md            ← 数据结构 + API + 时序图
└── tasks.md             ← 分步实现清单（15个子任务）
specs/coupon.md（行为规格，WHEN/THEN 形式）：
## Requirement: 优惠券验证

### Scenario: 有效满减券
- WHEN 用户提交 coupon_code="SAVE20"
- AND 订单金额 >= 满减门槛（100元）
- THEN 返回 200，discount_amount=20，final_amount=订单金额-20

### Scenario: 未达门槛
- WHEN 用户提交 coupon_code="SAVE20"  
- AND 订单金额 < 满减门槛（100元）
- THEN 返回 400，message="订单金额不满足使用条件"

### Scenario: 已使用的券
- WHEN 提交的 coupon_code 已被使用
- THEN 返回 400，message="该优惠券已被使用"

### Scenario: 过期券
- WHEN 提交的 coupon_code 已过期
- THEN 返回 400，message="优惠券已过期"
Step 3：人工审核 Spec（最关键）
这是整个流程里最有价值的环节——在写一行代码之前发现问题。
审核清单：
□ proposal.md：Why/What 是否完整？Impact 评估是否准确？
□ specs/*.md：每个场景是否覆盖了边界情况？
□ design.md：数据结构设计是否合理？有无遗漏字段？
□ tasks.md：任务顺序是否正确？有无循环依赖？
常见的审核发现：
审核发现 1：specs/coupon.md 漏了"不存在的券码"场景
→ 补充：WHEN 提交不存在的 coupon_code，THEN 返回 404

审核发现 2：tasks.md 中 "实现 validate API" 排在 "创建数据库表" 前面
→ 修正任务顺序

审核发现 3：design.md 的 coupons 表缺少 used_by（记录使用人）字段
→ 补充字段，便于后续数据分析
Step 4：用 /opsx:apply + /execute-plan 实现
审核通过后执行：
你：/opsx:apply coupon-feature
OpenSpec 把 tasks.md 的每个任务交给 AI 逐步执行。Superpowers 的 /execute-plan skill 确保 AI：
每步完成后验证（不是跑完就算）
遇到偏离规格的情况，先暂停询问
不超出 tasks.md 的范围做"额外优化"
执行过程示例：
[Task 1.1] 创建 coupons 表迁移文件
  → 生成: db/migrations/20260401_create_coupons.sql
  → 验证: migrate up 成功 ✓

[Task 1.2] 定义 Coupon model
  → 生成: internal/model/coupon.go  
  → 验证: go build 通过 ✓

[Task 2.1] 实现 CouponRepository
  → 生成: internal/repository/coupon_repository.go
  → 验证: go test ./internal/repository/... ✓
  
...（每步都有验证，不会一次性全写完）
Step 5：/opsx:archive 归档
你：/opsx:archive coupon-feature
OpenSpec 把 changes/coupon-feature/ 的规格整合进主规格库 openspec/specs/，成为项目知识资产。下次做相关功能（比如"优惠券统计报表"），AI 可以读取这些规格了解上下文，而不是从零开始猜。

实践案例二：前端组件改造（防止 AI 过度改动）
场景描述
 需求： 给现有的 UserCard 组件加一个"关注"按钮，点击后变为"已关注"状态，支持 loading 状态。 
这是前端最常踩坑的场景：AI 帮你加个按钮，顺手把整个组件重构了。
不用 OpenSpec 的结果（对比）
你：给 UserCard 加一个关注按钮，有 loading 状态

AI：好的，我来改造一下...
  → 把 CSS Modules 换成了 styled-components（"更现代"）
  → 引入了 react-spring 做动画（"loading 效果更好看"）
  → 把 props 结构重新设计了（"更合理"）
  → 顺手修复了一个你觉得没问题的"潜在性能问题"

结果：diff 300 行，只有 30 行是你要的功能
用 OpenSpec 的标准流程
Step 1：/brainstorm（精简版，简单需求可快速过）
你：/brainstorm UserCard 加关注按钮
AI: 关注状态需要持久化吗？
    A) 是，调用 API 存到数据库
    B) 否，只是 UI 状态（原型阶段）

你：A，需要调用 /users/:id/follow API

AI: 关注状态的初始值从哪里来？
    A) UserCard 的 props 传入（父组件负责数据）
    B) UserCard 内部 useQuery 自己获取

你：A，父组件传 isFollowing 进来
设计确认：修改范围 = 只改 UserCard 组件，新增 isFollowing prop 和 onFollowChange 回调，用项目现有的 useMutation。
Step 2：/opsx:propose
你：/opsx:propose UserCard 添加关注按钮
生成的 specs/user-card.md：
## CHANGED: UserCard 组件

### Props 变更（新增，不修改现有 props）
- isFollowing: boolean（当前关注状态）
- onFollowChange?: (userId: string, followed: boolean) => void（状态变化回调）

### Behavior: 点击关注
- WHEN isFollowing=false，点击关注按钮
- THEN 按钮显示 loading 状态
- AND 调用 PATCH /users/:id/follow
- AND 成功后调用 onFollowChange(userId, true)
- AND 失败后恢复原状态，显示 toast 错误提示

### Behavior: 点击取消关注  
- WHEN isFollowing=true，点击关注按钮（文案"已关注"）
- THEN 同上，success 时 onFollowChange(userId, false)

## NOT CHANGED（明确禁止改动）
- 组件现有的 props（user, size, variant 等）
- 现有的样式方案（CSS Modules）
- 组件内部的其他子组件
- 不引入新的第三方依赖
生成的 tasks.md（严格限定范围）：
# Tasks: UserCard 关注按钮

- [ ] 1. 在 UserCardProps 中新增 isFollowing, onFollowChange 两个字段
- [ ] 2. 在 UserCard.tsx 中新增关注按钮 JSX（位于头像右侧）
- [ ] 3. 新增 useFollowUser hook（封装 useMutation 调用 follow API）
- [ ] 4. 连接 hook 与按钮的 loading/onClick 逻辑
- [ ] 5. 在 UserCard.module.css 中新增 .followButton 样式
- [ ] 6. 更新 UserCard.test.tsx（新增 3 个测试用例）
- [ ] 7. 更新 UserCard.stories.tsx（新增关注/未关注两个 story）

## 严格禁止
- 修改现有测试用例
- 引入 styled-components / emotion 等
- 修改现有 props 类型
Step 3：审核重点（前端特有检查）
□ tasks.md 里有没有不在 UserCard 目录内的文件修改？
  → 如果有，问清楚为什么

□ 有没有引入新依赖？
  → spec 明确禁止，但 AI 可能"偷偷"加

□ CSS 方案是否保持一致？
  → 确认用 CSS Modules，不用 inline style
审核发现并修正：
发现：tasks.md 第 5 步要创建新的 CSS 文件
修正：应该是在现有的 UserCard.module.css 里追加样式，不是新文件
Step 4：执行结果（严格受控）
[Task 1] 修改 UserCardProps 类型
  → 只修改了 UserCard/index.tsx 的 interface（+2 行）✓

[Task 2] 新增按钮 JSX
  → 在指定位置插入按钮，没有动其他代码 ✓

[Task 3] 新增 useFollowUser hook
  → 新文件 hooks/useFollowUser.ts，用现有的 useMutation ✓

[Task 4-7] 连接逻辑、样式、测试
  → diff 共 89 行，全部在预期范围内 ✓

结果：0 个意外修改，100% 符合 Spec

实践案例三：Bug 修复（快速诊断 + 有据可查的修复）
场景描述
 生产问题： 用户反馈：在订单详情页点击"申请退款"，偶发性地出现"订单不存在"错误，但订单明明存在。 
快速流程（Bug 修复比新功能流程更轻量）
Step 1：/systematic-debugging（先诊断，不要急着改）
你：/systematic-debugging 订单详情页申请退款偶发"订单不存在"
Superpowers 的调试 skill 强制 AI 先假设、再验证，不乱改代码：
AI 分析：
假设 1：退款接口的订单 ID 读取有误（前端传参错误）
  → 验证：查看前端请求日志，order_id 传值正确 ✗

假设 2：并发导致订单状态已变更
  → 验证：查看退款接口代码，发现先查询再操作，有 race condition 可能
  → 进一步：查看数据库事务隔离级别... 

假设 3：订单 ID 类型在某些路径下从 int64 变成了 string
  → 验证：grep 代码，发现前端路由参数取值用了 parseInt，某些 ID 超出 int32 范围后精度丢失 ✓

根本原因：订单 ID 为大数值时（> 2^53），前端 parseInt 精度丢失，
         导致传到后端的 ID 与实际 ID 不匹配。
Step 2：/opsx:propose（记录修复方案，便于 Code Review）
你：/opsx:propose fix: 订单ID大数值精度丢失导致退款失败
生成 changes/fix-order-id-precision/：
# Proposal: 修复订单 ID 精度丢失

## Why
JavaScript Number 最大安全整数为 2^53-1，
超出时 parseInt 精度丢失，传给后端的 ID 发生变化。

## Root Cause
frontend/src/pages/OrderDetail.tsx:23
  const orderId = parseInt(params.orderId)  ← 问题所在

## Fix
将 orderId 以字符串形式传递（不 parseInt），
后端接口修改为接受 string 类型并在服务层转换。

## Risk Assessment
- 风险等级：低（只修改类型传递，不改业务逻辑）
- 影响范围：OrderDetail 页面 + 退款 API handler
- 需要回归测试：退款流程、订单详情加载
tasks.md：
- [ ] 1. OrderDetail.tsx 第 23 行：删除 parseInt，直接用字符串
- [ ] 2. 退款 API handler：将 order_id 参数类型从 int64 改为 string，在 service 层解析
- [ ] 3. 新增单元测试：覆盖大数值 order_id 的退款场景
- [ ] 4. 更新 E2E 测试：使用大数值 ID 的测试订单
好处： 这份 Spec 就是最好的 PR 描述——Reviewer 一眼看出改了什么、为什么改、风险在哪。

实践案例四：重构（大范围改动的安全边界）
场景描述
 需求： 将项目中的 HTTP 客户端从原生 net/http 迁移到 resty，统一错误处理和重试逻辑。 
重构是最需要 OpenSpec 的场景，因为改动文件多、容易超范围。
流程特点
Step 1：/brainstorm 确定重构边界
AI: 这次迁移是全部替换，还是增量迁移？
    A) 一次性全部迁移（可能影响所有 client 文件）
    B) 只迁移 user-service 相关的 client（先试点）

你：B，先试点 user-service

AI: 迁移后错误处理方案是什么？
    A) 保持现有的 error wrapping 不变，只换底层
    B) 同时统一错误类型和 retry 逻辑

你：A，只换底层，行为不变（确保稳定性）
设计结论：只改 internal/client/user_client.go，接口不变，行为不变，只换实现。
Step 2：/opsx:propose 生成精确的范围文档
openspec/changes/refactor-http-client-resty/
├── proposal.md
├── specs/
│   └── user-client.md    ← 行为规格（Before/After 对照）
└── tasks.md
specs/user-client.md（行为等价性规格）：
# UserClient 重构规格

## 核心约束：行为等价
所有现有的测试用例必须通过，外部行为不得改变。

## UNCHANGED（明确不变）
- 所有函数签名（GetUser, CreateUser, UpdateUser...）
- 返回值结构（UserResponse, UserError）
- 超时时间（5s 请求超时，30s 连接超时）
- Header 设置方式（Authorization, X-Request-ID）
- 错误类型（4xx → UserClientError, 5xx → ServerError）

## CHANGED（允许改变的内部实现）
- http.Client → resty.Client
- 手动构造 http.Request → resty 链式调用
- 手动读取 response body → resty 自动 unmarshal

## 验证方式
- 现有测试套件 100% 通过
- 手动测试 GetUser / CreateUser 两个关键接口
tasks.md（文件级别的明确范围）：
# 涉及文件（仅限）
- internal/client/user_client.go（主要改动）
- go.mod / go.sum（新增 resty 依赖）
- internal/client/user_client_test.go（如有必要调整 mock 方式）

## 严格禁止修改
- 除以上文件外的任何文件
- 任何函数的对外签名
- 任何现有测试的期望值
审核时的关键检查：
□ tasks 里有没有超出上述文件范围的修改计划？
□ design.md 里的函数签名与现有代码一致吗？
□ 测试验证策略是否明确？

实践案例五：多人协作（Spec 作为沟通协议）
场景描述
 背景： 后端工程师 A 负责新增 "商品评论" API，前端工程师 B 同步开发评论展示组件。需要并行开发，最后联调。 
OpenSpec 作为团队沟通协议
工程师 A（后端）：
/opsx:propose 商品评论 API（POST /products/:id/reviews, GET /products/:id/reviews）
生成后，人工审核通过，将 specs/review-api.md 提交到 Git。
specs/review-api.md（成为前后端接口契约）：
## POST /products/:id/reviews

### Request
```json
{
  "rating": 5,           // 1-5 整数
  "content": "很好用",   // 10-500 字
  "images": ["url1"]     // 可选，最多 9 张
}
Response 200
{
  "code": 0,
  "data": {
    "id": "review-uuid",
    "user": { "id": "...", "name": "...", "avatar": "..." },
    "rating": 5,
    "content": "很好用",
    "images": ["url1"],
    "created_at": "2026-04-01T10:00:00Z"
  }
}
Error Cases

**工程师 B（前端）拿到这份 Spec：**

/opsx:propose 商品评论组件，基于 openspec/specs/review-api.md 的接口规格

前端生成的 tasks.md 直接引用了 API Spec 里的字段名和错误码，确保前后端实现一致。

**联调效率提升：**
- 接口字段名不一致 → 0 次（Spec 是唯一来源）
- 错误码处理遗漏 → 0 次（Spec 里有完整错误表）
- "我以为你会处理这个情况" → 0 次（OUT OF SCOPE 写清楚了）

---

## 配合技巧总结

### 技巧 1：让 Brainstorm 的输出直接喂给 Propose

先跑 brainstorm，得到 design doc
/brainstorm 你的需求
再跑 propose，引用 design doc 节省重复描述
/opsx:propose 你的需求，参考 docs/superpowers/specs/2026-xx-xx-design.md

### 技巧 2：tasks.md 的粒度决定 AI 的可控度

过粗（AI 自由发挥空间太大）
实现优惠券功能
过细（变成人工手写代码）
在第 45 行 if 语句前加一行 err != nil 判断
刚好
实现 CouponRepository 的 FindByCode 方法，从 coupons 表查询，返回 *Coupon 和 error

### 技巧 3：用 `/systematic-debugging` 代替直接改代码

❌ 直接做：
 "把订单查询的 SQL 加个索引，应该能解决慢查询"
✅ 先诊断：
 /systematic-debugging 订单列表页响应慢（P99 > 3s）
 → 得到诊断结论后，再 /opsx:propose 记录修复方案

### 技巧 4：`/verification-before-completion` 作为 archive 前的质量门禁

执行完 apply 后，archive 之前：
/verification-before-completion
这个 skill 会检查：
- 所有 tasks.md 里的任务是否都完成了？
- 测试是否全部通过？
- 有没有遗漏的 OUT OF SCOPE 检查项？
确认通过后再 /opsx:archive

### 技巧 5：`project.md` 是 Superpowers Skills 的上下文基础

OpenSpec 的 `openspec/project.md` 和 Superpowers 的 Skills 都需要项目上下文。
让它们共享同一份信息：

```markdown
# openspec/project.md（完整版）
# CLAUDE.md 引用它：<see openspec/project.md for project context>

## Technology Stack
...（详细的技术栈描述）

## Architecture Patterns
...（分层架构、命名规范等）

## Code Standards
...（这样 brainstorm 和 propose 都遵循同样的约束）

常见问题
Q：每个需求都需要跑完整个流程吗？
A：按需选择：
Q：brainstorm 生成的 design doc 和 OpenSpec 的 proposal.md 有什么区别？
A：
design doc（Superpowers）：以对话方式探索得来，重在"为什么这样设计"，面向人类阅读
proposal.md（OpenSpec）：结构化的变更说明，重在"改什么/不改什么/影响范围"，面向 AI 执行
两者互补：design doc 是 proposal.md 的思考来源，proposal.md 是 design doc 的执行摘要。
Q：OpenSpec 的规格文件积累多了怎么管理？
A：/opsx:archive 后会进入 openspec/specs/（主规格库）。定期用 Superpowers 的 /brainstorm 重新审视主规格，删除过时内容，更新已变更的设计。这个库是项目的"活文档"，比代码注释更可信（因为有 WHEN/THEN 的行为描述）。

文档版本：v1.0 | 更新日期：2026-04-01
 适用范围：使用 Claude Code + OpenSpec 的中型技术团队