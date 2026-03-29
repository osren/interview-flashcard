# InterviewFlash - 技术文档

## 1. 技术架构

### 1.1 技术栈

```
┌─────────────────────────────────────────┐
│               React 18                   │
│         (Concurrent Mode Ready)          │
├─────────────────────────────────────────┤
│           TypeScript 5.x                 │
│         (Strict Mode Enabled)            │
├─────────────────────────────────────────┤
│              Vite 5.x                   │
│         (Fast HMR + ESM)               │
├─────────────────────────────────────────┤
│          Tailwind CSS 3.x               │
│         (Utility-First CSS)             │
├─────────────────────────────────────────┤
│            Zustand 4.x                  │
│         (Lightweight State)             │
├─────────────────────────────────────────┤
│         Framer Motion 10.x              │
│         (Animation Library)             │
└─────────────────────────────────────────┘
```

### 1.2 目录结构详解

```
interview-flash/
├── public/                          # 静态资源（不经过构建处理）
│   └── favicon.svg                  # 网站图标
│
├── src/                            # 源代码
│   │
│   ├── assets/                     # 资源文件
│   │   └── react.svg               # React Logo（示例）
│   │
│   ├── components/                 # 可复用组件
│   │   │
│   │   ├── ui/                     # 基础UI组件（原子组件）
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── Input.tsx
│   │   │
│   │   ├── Card/                    # 记忆卡片组件
│   │   │   ├── FlashCard.tsx       # 主卡片组件
│   │   │   ├── CardFront.tsx       # 卡片正面
│   │   │   ├── CardBack.tsx        # 卡片背面
│   │   │   └── Card.module.css
│   │   │
│   │   ├── Layout/                  # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── Navigation/              # 导航组件
│   │       ├── Navbar.tsx
│   │       └── Breadcrumb.tsx
│   │
│   ├── data/                       # 静态数据
│   │   │
│   │   ├── core/                   # 核心考点数据（10章节）
│   │   │   ├── index.ts
│   │   │   ├── javascript.ts
│   │   │   ├── typescript.ts
│   │   │   ├── html-css.ts
│   │   │   ├── browser.ts
│   │   │   ├── react-core.ts
│   │   │   ├── react-hooks.ts
│   │   │   ├── engineering.ts
│   │   │   ├── performance.ts
│   │   │   ├── ai-engineering.ts
│   │   │   └── system-design.ts
│   │   │
│   │   ├── projects/               # 项目复盘数据
│   │   │   ├── index.ts
│   │   │   ├── didi.ts             # 滴滴实习
│   │   │   └── gresume.ts          # GResume项目
│   │   │
│   │   └── algorithms/             # 刷题数据
│   │       ├── index.ts
│   │       ├── coding.ts           # 手撕代码
│   │       ├── concept.ts          # 概念解释
│   │       └── scenario.ts         # 场景设计
│   │
│   ├── hooks/                      # 自定义Hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useCards.ts
│   │   └── useProgress.ts
│   │
│   ├── pages/                      # 页面组件
│   │   ├── Home.tsx               # 首页
│   │   ├── Core/
│   │   │   ├── CoreIndex.tsx      # 核心考点列表
│   │   │   └── CoreChapter.tsx    # 章节详情+卡片
│   │   ├── Projects/
│   │   │   ├── ProjectsIndex.tsx
│   │   │   └── ProjectDetail.tsx
│   │   └── Algorithms/
│   │       ├── AlgorithmsIndex.tsx
│   │       └── AlgorithmDetail.tsx
│   │
│   ├── store/                      # Zustand状态管理
│   │   ├── index.ts
│   │   ├── useCardStore.ts
│   │   └── useProgressStore.ts
│   │
│   ├── types/                      # TypeScript类型定义
│   │   ├── card.ts
│   │   ├── chapter.ts
│   │   └── progress.ts
│   │
│   ├── utils/                      # 工具函数
│   │   ├── cn.ts                  # className合并
│   │   └── format.ts              # 格式化函数
│   │
│   ├── App.tsx                    # 根组件
│   ├── main.tsx                   # 入口文件
│   └── index.css                   # 全局样式
│
├── index.html                      # HTML入口
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── SPEC.md
```

---

## 2. 组件设计规范

### 2.1 组件分类

| 分类 | 组件 | 说明 |
|------|------|------|
| **原子组件** | Button, Card, Badge, Input | 最基础组件 |
| **分子组件** | FlashCard, Navbar | 由原子组件组合 |
| **有机组件** | Layout, Page | 完整的页面区块 |

### 2.2 组件接口规范

```typescript
// ✅ 好的组件接口
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ❌ 避免的：prop drilling
interface BadProps {
  theme: 'dark' | 'light';
  user: User;
  onUpdate: () => void;
  // ... 太多props，应该用 Context 或 Store
}
```

---

## 3. 状态管理设计

### 3.1 Store 划分

| Store | 职责 | 数据 |
|-------|------|------|
| `useCardStore` | 卡片状态 | 当前卡片、翻转状态、筛选条件 |
| `useProgressStore` | 学习进度 | 掌握程度、已复习数量 |
| `useUIStore` | UI状态 | 侧边栏展开、加载状态 |

### 3.2 Store 实现

```typescript
// store/useCardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CardState {
  // State
  isFlipped: boolean;
  currentIndex: number;
  filter: string;
  searchQuery: string;

  // Actions
  flip: () => void;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      isFlipped: false,
      currentIndex: 0,
      filter: 'all',
      searchQuery: '',

      flip: () => set({ isFlipped: !get().isFlipped }),
      setCurrentIndex: (index) => set({ currentIndex: index, isFlipped: false }),
      next: () => set((state) => ({
        currentIndex: Math.min(state.currentIndex + 1, totalCards - 1),
        isFlipped: false
      })),
      prev: () => set((state) => ({
        currentIndex: Math.max(state.currentIndex - 1, 0),
        isFlipped: false
      })),
      setFilter: (filter) => set({ filter }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    { name: 'card-storage' }
  )
);
```

---

## 4. 样式规范

### 4.1 Tailwind CSS 配置

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ...
        },
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
};
```

### 4.2 样式编写规范

```tsx
// ✅ 推荐：使用 Tailwind + cn 工具函数
import { cn } from '@/utils/cn';

<div className={cn(
  'p-4 rounded-lg border',
  isActive && 'bg-primary-100 border-primary-300',
  'hover:bg-gray-50 transition-colors'
)} />

// ❌ 避免：内联样式 + style 属性混用
<div style={{ padding: '16px' }} className="rounded-lg" />
```

---

## 5. 数据层设计

### 5.1 数据加载流程

```
页面加载
    │
    ▼
读取 src/data/ 下的静态数据文件
    │
    ▼
zustand store 管理卡片状态
    │
    ▼
组件通过 hooks 访问 store
    │
    ▼
用户操作 → 更新 store → 自动重渲染
```

### 5.2 数据文件示例

```typescript
// data/core/javascript.ts
import { Chapter } from '@/types/chapter';
import { FlashCard } from '@/types/card';

export const javascriptCards: FlashCard[] = [
  {
    id: 'js-closure-001',
    module: 'core',
    chapterId: 'javascript',
    category: '作用域与闭包',
    question: '什么是闭包？',
    answer: `闭包是指函数能够记住并访问其词法作用域，即使该函数在其词法作用域之外执行。

核心要点：
1. 函数 + 词法环境的组合
2. 内部函数可以访问外部函数的变量
3. 外部函数的变量被内部函数"记住"`,
    tags: ['javascript', '闭包', '作用域'],
    status: 'unvisited',
    difficulty: 'medium',
    extendQuestion: '闭包在 React Hooks 中有什么陷阱？',
  },
  // ... more cards
];

export const javascriptChapter: Chapter = {
  id: 'javascript',
  module: 'core',
  title: 'JavaScript 核心基础',
  description: '执行上下文、作用域链、闭包、原型链、事件循环等',
  cardCount: javascriptCards.length,
  cards: javascriptCards,
};
```

---

## 6. 路由设计

### 6.1 路由表

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/core` | CoreIndex | 核心考点列表 |
| `/core/:chapterId` | CoreChapter | 章节详情+卡片练习 |
| `/projects` | ProjectsIndex | 项目复盘列表 |
| `/projects/:projectId` | ProjectDetail | 项目详情 |
| `/algorithms` | AlgorithmsIndex | 刷题列表 |
| `/algorithms/:type` | AlgorithmDetail | 题型详情 |

### 6.2 路由实现

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/core" element={<CoreIndex />} />
        <Route path="/core/:chapterId" element={<CoreChapter />} />
        <Route path="/projects" element={<ProjectsIndex />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/algorithms" element={<AlgorithmsIndex />} />
        <Route path="/algorithms/:type" element={<AlgorithmDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 7. 开发规范

### 7.1 Git 提交规范

```
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具
```

### 7.2 代码规范

- 使用 ESLint + Prettier
- 组件使用 `PascalCase`
- 工具函数使用 `camelCase`
- CSS 类名使用 `kebab-case`
- 常量使用 `UPPER_SNAKE_CASE`

---

## 8. 性能优化

### 8.1 React 优化

- 使用 `React.memo` 包裹静态组件
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 稳定回调引用
- 避免不必要的重渲染

### 8.2 Vite 优化

- 依赖预构建
- 动态 import 路由
- 图片压缩

---

## 9. 验收检查清单

### 9.1 功能验收

- [ ] 首页正常加载，展示三大模块入口
- [ ] 核心考点章节列表正常
- [ ] 卡片翻转动画流畅
- [ ] 进度追踪数据正确
- [ ] 搜索功能正常
- [ ] 分类筛选正常
- [ ] 路由跳转正常

### 9.2 视觉验收

- [ ] 响应式布局（移动端/桌面端）
- [ ] 暗色/亮色模式（如实现）
- [ ] 动画流畅无卡顿
- [ ] 字体层级清晰
- [ ] 色彩对比度符合 WCAG

### 9.3 代码质量

- [ ] TypeScript 编译无错误
- [ ] ESLint 检查无警告
- [ ] 组件职责单一
- [ ] 无硬编码数据
