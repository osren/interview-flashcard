# Tasks: MiniMax 设计风格全局改造任务

## Task List

### Phase 1: 基础配置

- [x] **T1** 修改 `tailwind.config.js`
  - 更新颜色系统（brand, primary, text, surface）
  - 更新圆角系统（sm:4px, DEFAULT:8px, md:13px, lg:20px, xl:24px, full:9999px）
  - 更新阴影系统（subtle, ambient, brand-glow, elevated）
  - 更新 font-family 配置（sans, display, mid, mono）

- [x] **T2** 更新 `index.html` 字体引入
  - 添加 DM Sans, Outfit, Poppins, Roboto 字体链接

- [x] **T3** 更新 `src/index.css` 全局样式
  - 设置 CSS 变量（--font-sans, --font-display, --font-mid, --font-mono）
  - 全局字体配置
  - 背景改为白色，文本改为 #222222

### Phase 2: 核心组件

- [x] **T4** 修改 `src/components/Layout/Header.tsx`
  - 白色背景 + 胶囊按钮导航（rounded-full）
  - 使用 text-text-primary/muted/secondary 颜色
  - 品牌蓝色 logo

- [x] **T5** 修改 `src/pages/Home.tsx`
  - 白色背景替代灰度渐变
  - 模块卡片 20px 大圆角
  - shadow-subtle 阴影
  - 使用 font-display 字体
  - 行高设置为 1.5

### Phase 3: 验证

- [x] **T6** 构建验证通过

## 实现总结

| 任务 | 状态 |
|------|------|
| Tailwind 配置 | ✅ 完成 |
| 字体引入 | ✅ 完成 |
| 全局样式 | ✅ 完成 |
| Header 导航 | ✅ 完成 |
| 首页卡片 | ✅ 完成 |
| 构建验证 | ✅ 通过 |

### 主要变更

1. **Tailwind 配置**：新增 brand、text、surface 颜色系统，新增圆角和阴影系统，新增字体配置
2. **字体**：引入 DM Sans, Outfit, Poppins, Roboto
3. **全局样式**：字体、行高、背景色更新
4. **Header**：胶囊按钮导航
5. **Home**：白色背景 + 大圆角卡片

### 颜色使用

- 背景：白色 #ffffff
- 文本主要色：#222222
- 文本次要色：#18181b、#45515e、#8e8e93
- 品牌主色：#1456f0（brand-600）
- 品牌次色：#3b82f6（brand-500）