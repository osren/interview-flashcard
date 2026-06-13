# 架构约束

## 前端架构

### 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router DOM 6
- **状态管理**: Zustand (with localStorage persistence)
- **样式**: Tailwind CSS 3
- **动画**: Framer Motion 11
- **图标**: Lucide React

### 目录结构

```
src/
├── components/    # UI 组件
├── data/          # 静态数据
├── pages/         # 路由页面
├── store/         # Zustand stores
├── types/         # TypeScript 接口
└── utils/         # 工具函数
```

### 路由约定

```
/                        → Home
/core                    → CoreIndex
/core/:chapterId         → CoreChapter
/projects                → ProjectsIndex
/projects/:projectId     → ProjectDetail
/algorithms              → AlgorithmsIndex
/algorithms/:type        → AlgorithmDetail
```

### 状态管理

- **useCardStore**: 卡片状态、进度、搜索、过滤
- **useProgressStore**: 学习进度

使用 Zustand `persist` 中间件，数据存储在 localStorage。

### 严格模式

- TypeScript strict 模式开启
- 禁止使用 `any`
- 所有组件必须定义 Props 类型