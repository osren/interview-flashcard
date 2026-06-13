## ADDED Requirements

### Requirement: 导航栏炫彩样式
导航栏 SHALL 采用炫彩渐变风格设计，每个模块按钮有专属主题色高亮，提升视觉吸引力和模块辨识度。

#### Scenario: Logo 区域动态渐变
- **WHEN** 页面加载时
- **THEN** Logo 区域显示品牌渐变背景 (from-brand-500 to-brand-700)

#### Scenario: 导航按钮模块主题色
- **WHEN** 用户悬停或选中某导航按钮时
- **THEN** 按钮显示对应模块的主题渐变背景，而非单调的黑白色

#### Scenario: 悬停光效动画
- **WHEN** 用户悬停在导航按钮上
- **THEN** 显示炫彩光效动画过渡效果

### Requirement: 模块配色映射
每个导航模块 SHALL 有对应的专属主题色：

#### Scenario: 核心考点模块配色
- **WHEN** 选中或悬停"核心考点"模块时
- **THEN** 显示品牌蓝色渐变 (blue)

#### Scenario: 项目复盘模块配色
- **WHEN** 选中或悬停"项目复盘"模块时
- **THEN** 显示紫色渐变 (violet)

#### Scenario: 刷题模块配色
- **WHEN** 选中或悬停"刷题模块"模块时
- **THEN** 显示绿色渐变 (emerald)

#### Scenario: AI资讯模块配色
- **WHEN** 选中或悬停"AI资讯"模块时
- **THEN** 显示粉蓝渐变 (pink → sky)

#### Scenario: 简历模块配色
- **WHEN** 选中或悬停"简历"模块时
- **THEN** 显示玫瑰色渐变 (rose)

#### Scenario: 面经模块配色
- **WHEN** 选中或悬停"面经"模块时
- **THEN** 显示橙黄渐变 (sunset)

#### Scenario: 收藏模块配色
- **WHEN** 选中或悬停"收藏"模块时
- **THEN** 显示粉色渐变 (pink)

### Requirement: 响应式兼容性
炫彩样式 SHALL 在移动端正常工作：

#### Scenario: 移动端显示
- **WHEN** 在小屏幕设备显示导航栏时
- **THEN** 炫彩效果正常渲染，无性能问题