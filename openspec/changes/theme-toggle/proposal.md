## Why

用户在不同环境（白天/夜间、强光/弱光）下使用面试刷题应用时，亮色主题会造成视觉疲劳。黑白主题切换功能让用户根据环境和偏好选择合适的显示模式，提升长时间学习的使用体验。

## What Changes

- 新增主题切换组件，支持亮色/暗色模式切换
- 主题偏好持久化到 localStorage，重启后保留用户选择
- 暗色主题采用低亮度配色方案，减少眼睛疲劳
- 主题切换动画平滑过渡，避免突兀闪烁
- 支持跟随系统主题偏好（可选）

## Capabilities

### New Capabilities

- `theme-toggle`: 黑白主题切换功能，包含切换按钮、主题持久化和跟随系统选项

### Modified Capabilities

- 无

## Impact

- 前端样式：新增 Tailwind CSS 暗色模式配置
- 状态管理：Zustand store 新增主题状态
- 组件：Header 或设置面板中添加主题切换按钮
