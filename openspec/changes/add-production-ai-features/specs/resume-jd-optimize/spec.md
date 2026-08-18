## ADDED Requirements

### Requirement: Markdown 主简历管理
InterviewFlash SHALL 在 Resume 模块维护至少一份 Markdown 格式主简历，支持编辑与 localStorage 持久化。

#### Scenario: 默认主简历
- **WHEN** 用户首次打开 JD 优化 Tab
- **THEN** 系统加载预置精简版秋招 Markdown 作为主简历，可编辑保存

### Requirement: 按 JD 生成优化副本
已登录用户 SHALL 基于主简历（或当前选中副本）与指定 JD 生成新的 Markdown 简历副本，不捏造未发生的经历。

#### Scenario: 选择 Campus 岗位 JD
- **WHEN** 用户在校招看板已有岗位中选择目标 JD
- **THEN** 系统将岗位 jd_summary + requirements 与当前 Markdown 简历发送至 optimize-resume，流式展示优化结果

#### Scenario: 粘贴自定义 JD
- **WHEN** 用户粘贴 JD 文本而非选择已有岗位
- **THEN** 同样触发优化流程

#### Scenario: 保存为新副本
- **WHEN** 用户对优化结果满意并点击「保存为新副本」
- **THEN** 创建新 `MarkdownResume` 记录（含 sourceResumeId、jdSnapshot、标题如「{公司}-{职位}-优化版」），列表可切换查看

### Requirement: 轻量实现边界
简历优化 MUST NOT 依赖 GResume 项目 API；506 Resume iframe Tab SHALL 保持独立可用。

#### Scenario: 在线简历 Tab 不受影响
- **WHEN** 用户切换至「在线简历」Tab
- **THEN** 仍嵌入 506 Resume，与 Markdown JD 优化链路无耦合
