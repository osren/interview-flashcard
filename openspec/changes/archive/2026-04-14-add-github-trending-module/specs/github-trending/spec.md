## ADDED Requirements

### Requirement: GitHub Trending Tab 切换功能
用户 SHALL 能够在 GitHub Trending 模块中通过 Tab 切换查看每月 Trending 和每周 Trending 数据。

#### Scenario: 切换到每月 Trending
- **WHEN** 用户点击 "每月" Tab
- **THEN** 页面展示当月 GitHub Trending 项目列表

#### Scenario: 切换到每周 Trending
- **WHEN** 用户点击 "每周" Tab
- **THEN** 页面展示本周 GitHub Trending 项目列表

### Requirement: GitHub Trending 项目列表展示
系统 SHALL 展示 GitHub Trending 项目列表，仿照 github.com/trending UI 风格，包含项目名称、描述、star 数、fork 数。

#### Scenario: 查看项目列表
- **WHEN** 用户进入 GitHub Trending 页面
- **THEN** 展示Trending项目列表，每行包含：项目名、描述、star数、fork数

### Requirement: 获取项目 README 摘要
系统 SHALL 能够获取Trending项目的README.md，并提取核心信息（工作流、解决的问题）展示给用户。

#### Scenario: 查看项目README摘要
- **WHEN** 用户点击某个Trending项目
- **THEN** 展示该项目README的核心内容摘要，包含工作流和解决的问题

### Requirement: 数据获取时间记录
系统 SHALL 记录每次数据获取的时间，并展示给用户。

#### Scenario: 显示最后更新时间
- **WHEN** 用户查看GitHub Trending页面
- **THEN** 显示"最后更新：XXX时间"

### Requirement: 手动刷新功能
用户 SHALL 能够手动刷新获取最新Trending数据。

#### Scenario: 手动刷新数据
- **WHEN** 用户点击刷新按钮
- **THEN** 重新获取Trending数据并更新展示

### Requirement: 外部链接跳转
用户 SHALL 能够点击项目跳转到 GitHub 原始项目页面。

#### Scenario: 跳转到GitHub
- **WHEN** 用户点击项目名称或链接按钮
- **THEN** 在新标签页打开GitHub项目页面