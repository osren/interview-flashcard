## Context

用户在不同环境（白天/夜间、强光/弱光）下使用面试刷题应用时，亮色主题会造成视觉疲劳。黑白主题切换功能让用户根据环境和偏好选择合适的显示模式。

**现状**：
- 已实现彩色主题切换（blue/rose/sunset 等配色方案）
- Tailwind 已配置 `darkMode: 'class'`
- 已有 `useThemeStore` 管理主题状态

**问题**：缺少亮色/暗色模式（Light/Dark Mode）的切换能力。

## Goals / Non-Goals

**Goals:**
- 新增亮色/暗色模式切换，与现有彩色主题系统解耦
- 暗色模式采用低亮度配色，减少眼睛疲劳
- 主题偏好持久化到 localStorage

**Non-Goals:**
- 不改变现有彩色主题（blue/rose/sunset 等）系统
- 不支持跟随系统主题自动切换（可在 v2 实现）

## Decisions

### 1. 模式切换 vs 配色主题分离

**选择**：在 `useThemeStore` 中新增 `themeMode` 字段（light/dark），与 `themeColor` 分开管理。

**理由**：
- 保持现有彩色主题系统不受影响
- 用户可以同时选择"暗色模式 + 蓝色主题"

### 2. 暗色模式实现方式

**选择**：使用 Tailwind `dark:` 变体 + CSS 变量。

**理由**：
- 项目已有 `darkMode: 'class'` 配置
- 通过 `themeMode` 控制 `html` 元素的 `class`（dark/light）
- 样式通过 `dark:` 变体响应式覆盖

### 3. 主题状态持久化

**选择**：沿用现有 zustand persist，在 `theme-storage` 中存储 `themeMode`。

**理由**：复用现有架构，改动最小。

### 4. 切换组件位置

**选择**：在 `ThemeSwitcher` 中新增亮色/暗色切换按钮。

**理由**：
- 现有 ThemeSwitcher 位于 Header
- 避免新增组件，保持 UI 简洁

## Risks / Trade-offs

[Risk] 暗色模式覆盖不全 → [Mitigation] 逐步检查并补充 `dark:` 样式，特别是 Card/Button/Badge 等核心组件

[Risk] 与自定义主题冲突 → [Mitigation] 暗色模式优先级高于自定义配色

## Migration Plan

1. 修改 `useThemeStore`：新增 `themeMode` 状态
2. 修改 `ThemeProvider`：根据 `themeMode` 添加/移除 `dark` class
3. 修改 `ThemeSwitcher`：添加亮色/暗色切换 UI
4. 检查并补充暗色样式：Card/FlashCard/Button 等核心组件

## Open Questions

- 是否需要暗色模式的键盘快捷键（如 Cmd+Shift+D）？