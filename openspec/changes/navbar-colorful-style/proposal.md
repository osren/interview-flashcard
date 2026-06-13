## Why

当前导航栏使用简约的黑白色调，缺乏视觉吸引力和品牌特色。用户在学习过程中需要更积极的视觉反馈来提升学习动力，炫彩风格可以增强模块辨识度和使用体验。

## What Changes

- 导航栏整体采用渐变边框/背景的炫彩风格设计
- Logo 区域增加动态渐变效果
- 导航按钮增加每个模块对应的主题色高亮
- 选中状态使用模块专属的渐变背景
- 悬停状态增加炫彩光效动画

## Capabilities

### New Capabilities
- `navbar-styling`: 统一导航栏炫彩样式实现，包括配色、动画、交互效果

### Modified Capabilities
无

## Impact

- 影响代码: `src/components/Layout/Header.tsx`
- 依赖项: Tailwind CSS (已安装), framer-motion (已安装)