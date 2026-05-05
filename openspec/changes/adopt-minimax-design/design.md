# Design: MiniMax 设计风格全局改造方案

## 核心思路

通过更新 Tailwind 配置和全局样式，采用 MiniMax 设计系统的颜色、字体、圆角和阴影规范。

## 实现方案

### 1. 更新 Tailwind 配置

修改 `tailwind.config.js`，采用 MiniMax 色彩系统：

```javascript
// 颜色系统
colors: {
  brand: {
    50: '#eff6ff',
    // ...
    600: '#1456f0',  // 品牌主色
  },
  primary: {
    200: '#bfdbfe',
    light: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  text: {
    primary: '#222222',
    secondary: '#18181b',
    muted: '#45515e',
    tertiary: '#8e8e93',
  },
  surface: {
    white: '#ffffff',
    gray: '#f0f0f0',
    border: '#e5e7eb',
  },
}

// 圆角系统
borderRadius: {
  none: '0',
  sm: '4px',      // 微小标签
  DEFAULT: '8px', // 按钮、小卡片
  md: '13px',    // 中等卡片
  lg: '20px',    // 大产品卡片
  xl: '24px',    // 更大卡片
  full: '9999px', // 导航/胶囊按钮
}

// 阴影系统
boxShadow: {
  subtle: '0 4px 6px rgba(0, 0, 0, 0.08)',
  ambient: '0 0 22.576px rgba(0, 0, 0, 0.08)',
  'brand-glow': '0 0 15px rgba(44, 30, 116, 0.16)',
  elevated: '0 12px 16px -4px rgba(36, 36, 36, 0.08)',
}
```

### 2. 字体配置

在 `index.html` 中引入 Google Fonts：

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600&family=Poppins:wght@500&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
```

全局 CSS 设置：
```css
:root {
  --font-sans: 'DM Sans', Helvetica Neue, Helvetica, Arial;
  --font-display: 'Outfit', Helvetica Neue, Helvetica, Arial;
  --font-mid: 'Poppins', sans-serif;
  --font-mono: 'Roboto', Helvetica Neue, Helvetica, Arial;
}
```

### 3. 组件样式统一

主要更新页面组件：
- Header 导航栏
- 首页模块卡片
- 页面标题和段落
- 按钮样式
- 卡片圆角和阴影

### 4. 文件变更

- `tailwind.config.js` - 更新颜色、圆角、阴影
- `index.html` - 添加字体链接
- `src/index.css` - 更新全局样式
- `src/components/Layout/Header.tsx` - 导航样式
- `src/pages/Home.tsx` - 首页模块卡片

## 优先级

1. **高优先级**：Tailwind 配置、全局字体
2. **中优先级**：首页卡片、Header 导航
3. **低优先级**：其他页面组件（可在后续迭代）