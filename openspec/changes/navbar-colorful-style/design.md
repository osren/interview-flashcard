## Context

当前导航栏使用简约的黑白色调 (`bg-white/90`, `bg-black/5`)，缺乏视觉层次和品牌特色。项目已有完整的色彩系统 (brand, accent, rose, sunset, sapphire, emerald, violet 等)，但导航栏未充分利用。每个导航项对应不同模块（核心考点、项目复盘、刷题模块等），适合使用模块专属配色增强辨识度。

## Goals / Non-Goals

**Goals:**
- 导航栏采用炫彩渐变风格，提升视觉吸引力
- 每个导航按钮有对应模块的主题色（选中/悬停时）
- Logo 区域增加动态渐变效果
- 悬停/选中状态有流畅的过渡动画
- 保持响应式和可访问性

**Non-Goals:**
- 不修改导航结构（保持现有 navItems 数组）
- 不添加新的 npm 依赖（使用现有 framer-motion）
- 不影响 ThemeSwitcher 和 Pomodoro 组件功能

## Decisions

1. **模块配色方案** - 为每个导航模块分配专属主题色:
   - 首页/核心考点: brand (蓝色系, `#3b82f6` → `#1456f0`)
   - 项目复盘: violet (紫色系, `#8b5cf6`)
   - 刷题模块: emerald (绿色系, `#10b981`)
   - AI资讯: pink/sky (渐变粉蓝, `#ea5ec1` → `#3daeff`)
   - 简历: rose (玫瑰色系, `#f43f5e`)
   - 面经: sunset (橙黄色系, `#f59e0b`)
   - 收藏: pink (粉色系, `#ec4899`)
   - 简历: rose (玫瑰色系)

2. **Logo 渐变** - 保持现有 brand 渐变，可增加动态光效

3. **动画方案** - 使用 framer-motion 实现悬停光效，CSS transition 处理颜色过渡

## Risks / Trade-offs

- [配色冲突] → 确保文字与背景对比度足够，使用 `bg-white/95` 背景或调整透明度
- [暗色模式兼容] → 暗色模式下调整配色，保持炫彩但不过于刺眼
- [性能影响] → framer-motion 的 hover 动画开销较小，保持流畅