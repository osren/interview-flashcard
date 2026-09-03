# InterviewFlash UI 设计系统

> 落档日期：2026-06-13  
> 设计风格：仿 [多邻国 Duolingo](https://www.duolingo.cn/learn) 亮色 UI  
> 主题策略：**固定单一主题**，不支持运行时配色切换（已移除 ThemeSwitcher）

---

## 1. 设计目标

- 白底、高对比、活泼友好的学习产品气质
- 3D 按压按钮、圆角卡片、粗体 Nunito 字体
- 全站配色与组件样式统一，避免各页面各自为政

---

## 2. 配色方案

### 2.1 主色板

| 名称 | Token | 色值 | 用途 |
|------|-------|------|------|
| 多邻国绿 | `--duo-green` | `#58CC02` | 主 CTA、进度条、激活导航、吉祥物 |
| 绿-底边 | `--duo-green-dark` | `#46A302` | 按钮/卡片 3D 底边阴影 |
| 绿-浅 | `--duo-green-light` | `#89E219` | 选中高亮、吉祥物肚子 |
| 多邻国蓝 | `--duo-blue` | `#1CB0F6` | 次要按钮、链接、答案面 |
| 蓝-底边 | `--duo-blue-dark` | `#1899D6` | 蓝色按钮底边 |
| 多邻国黄 | `--duo-yellow` | `#FFC800` | 警告、模糊状态 |
| 黄-底边 | `--duo-yellow-dark` | `#E5B800` | 黄色按钮底边 |
| 多邻国红 | `--duo-red` | `#FF4B4B` | 错误、忘记状态 |
| 红-底边 | `--duo-red-dark` | `#EA2B2B` | 红色按钮底边 |

### 2.2 中性色

| 名称 | Token | 色值 | 用途 |
|------|-------|------|------|
| 页面背景 | `--bg-base` | `#FFFFFF` | 全局背景 |
| 浅灰背景 | `--bg-muted` / `--duo-bg-muted` | `#F7F7F7` | 输入框、次级区域 |
| 标题文字 | `--text-heading` | `#3C3C3C` | h1–h6 |
| 正文 | `--text-primary` | `#4B4B4B` | 段落 |
| 次要文字 | `--text-secondary` | `#777777` | 描述、导航未激活 |
| 弱化文字 | `--text-muted` / `--duo-gray` | `#AFAFAF` | 辅助信息 |
| 边框 | `--border-default` | `#E5E5E5` | 卡片、分割线 |
| 深边框 | `--border-strong` | `#D0D0D0` | 卡片底边 3D 效果 |

### 2.3 模块点缀色（学习路径卡片）

首页 `ModuleTile` 按索引轮换以下颜色，用于图标底色与 CTA：

```
#58CC02 / #1CB0F6 / #FFC800 / #CE82FF / #FF9600 / #FF4B4B
```

### 2.4 Tailwind 扩展

`tailwind.config.js` 中注册了 `duo.*` 语义色，例如 `text-duo-green`、`bg-duo-bg`。

---

## 3. 字体

| 角色 | 字体 | 来源 |
|------|------|------|
| 正文 / 标题 | **Nunito** 400–900 | Google Fonts，`index.html` |
| 代码 | JetBrains Mono | Google Fonts |

- 根字号：`html { font-size: 18px; }`
- 标题字重：`800`（extrabold）
- 导航栏高度 `h-20`（80px），大屏导航字号 `text-lg`，字重 `extrabold`

---

## 4. 核心组件样式

### 4.1 3D 按钮（`Button` / `.duo-btn-*`）

```
背景色 + border-bottom: 4px 深色底边
:active → border-bottom: 2px + translateY(2px)
```

| variant | 背景 | 底边 |
|---------|------|------|
| `primary` | `#58CC02` | `#46A302` |
| `blue` | `#1CB0F6` | `#1899D6` |
| `outline` | 白底 + 灰边 | `#D0D0D0` |
| `danger` | `#FF4B4B` | `#EA2B2B` |

实现文件：`src/components/ui/Button.tsx`

### 4.2 卡片（`.surface-card` / `.surface-panel`）

- 白底、`border: 2px`、`border-bottom-width: 4px`
- 圆角 `16px`
- hover：边框变绿 `#58CC02`，轻微上移

实现文件：`src/index.css` `@layer components`

### 4.3 进度条（`Progress`）

- 轨道：`#E5E5E5`
- 填充：`#58CC02`

实现文件：`src/components/ui/Progress.tsx`

### 4.4 徽章（`Badge`）

- `primary`：黑底绿字 → 绿底白字 `#58CC02`
- `blue`：`#1CB0F6`
- `warning`：黄底 `#FFC800` 系

实现文件：`src/components/ui/Badge.tsx`

---

## 5. 布局与页面结构

### 5.1 导航栏（`Header`）

- 左侧：`Logo` 吉祥物 SVG + 绿色 `InterviewFlash` 字标
- 中间：大写灰色导航，激活项绿色文字 + 底部 3px 绿线（`layoutId` 动画）
- 右侧：番茄钟 `Pomodoro`、移动端汉堡菜单
- ~~主题配色按钮~~：**已移除**

实现文件：`src/components/Layout/Header.tsx`

### 5.2 Logo 吉祥物

- 绿色圆角身体 + 大眼 + 手持闪卡
- SVG 内联组件，无外部图片依赖

实现文件：`src/components/Layout/Logo.tsx`

### 5.3 页面容器

| 组件 | 职责 |
|------|------|
| `PageShell` | 列表页统一外边距与最大宽度 |
| `SectionHeader` | 章节标题 + 绿色图标块 |
| `ModuleTile` | 首页学习模块卡片 |
| `ChapterCard` | 章节列表行卡片 |
| `ChapterLayout` | 刷题页：返回栏 + 序号选择 + 左右翻页 |

目录：`src/components/ui/`、`src/components/Layout/`

### 5.4 闪卡（`FlashCard`）

- 正面：绿顶条 + 绿色圆形问号区
- 背面：蓝顶条 + 浅蓝背景答案区
- 状态按钮：红（忘记）/ 黄（模糊）/ 绿（掌握），均为 3D 样式

实现文件：`src/components/Card/FlashCard.tsx`

---

## 6. 技术实现

### 6.1 CSS 变量入口

所有主题 token 定义在：

```
src/index.css  →  :root, [data-theme="duo"] { ... }
```

`ThemeProvider` 在应用启动时固定设置：

```tsx
document.documentElement.setAttribute('data-theme', 'duo');
```

实现文件：`src/components/ThemeProvider.tsx`

### 6.2 已移除的功能

| 移除项 | 原路径 | 说明 |
|--------|--------|------|
| 主题切换器 UI | `src/components/ThemeSwitcher.tsx` | 已删除 |
| 主题状态 Store | `src/store/useThemeStore.ts` | 已删除 |
| 多主题 CSS 变量块 | `index.css` 中 `[data-theme="honey"]` 等 | 已删除 |
| 暗色模式 `.dark` | `index.css` | 已删除（随主题切换一并移除） |
| localStorage `theme-storage` | — | 不再写入，旧数据可手动清除 |

### 6.3 关键文件索引

```
index.html                          # Nunito 字体加载
src/index.css                       # 设计 token + 工具类
tailwind.config.js                  # duo 色板、字体扩展
src/components/ThemeProvider.tsx    # 固定 duo 主题
src/components/Layout/Header.tsx    # 顶栏
src/components/Layout/Logo.tsx      # 吉祥物
src/components/Layout/Footer.tsx
src/components/Layout/ChapterLayout.tsx
src/components/ui/Button.tsx
src/components/ui/Badge.tsx
src/components/ui/Progress.tsx
src/components/ui/PageShell.tsx
src/components/ui/SectionHeader.tsx
src/components/ui/ModuleTile.tsx
src/components/ui/ChapterCard.tsx
src/pages/Home.tsx                  # 首页学习路径
src/components/Card/FlashCard.tsx   # 闪卡
```

---

## 7. 使用约定（开发时）

1. **优先使用 CSS 变量或 `duo-*` Tailwind 类**，避免硬编码新颜色
2. **交互按钮**统一走 `Button` 组件或 `.duo-btn-green` 工具类，保持 3D 底边
3. **新页面列表**套用 `PageShell` + `SectionHeader`
4. **新模块入口**套用 `ModuleTile` 或 `ChapterCard`
5. **不要重新引入主题切换**；若需大改版，应更新本文档并改 `index.css` 单点 token

---

## 8. 参考

- 视觉参考：[Duolingo 学习页](https://www.duolingo.cn/learn)
- 项目内历史变更：导航栏与 UI 曾在 2026-06 经历「Neural Ink → 黑黄 → 多邻国绿」迭代，当前以本文档为准
