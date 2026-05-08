# 技术架构文档

## 技术栈

### 核心框架

- **React**: 18.2.0
- **TypeScript**: 5.2.2 (strict 模式)
- **Vite**: 5.1.4

### UI 框架

- **Ant Design**: 6.3.7
- **Tailwind CSS**: 3.4.1
- **Framer Motion**: 11.0.0
- **Lucide React**: 0.344.0 (图标)

### 路由与状态

- **React Router DOM**: 6.22.0
- **Zustand**: 4.5.0 (状态管理 + localStorage persist)

### 数据处理

- **xlsx**: 0.18.5 (Excel 导入导出)
- **Recharts**: 3.8.1 (数据可视化)
- **@uiw/react-md-editor**: 4.1.0 (Markdown 编辑)

### 表单

- **@rjsf/core**: 6.5.2
- **@rjsf/antd**: 6.5.2
- **@rjsf/validator-ajv8**: 6.5.2

## 开发工具

- **ESLint**: 8.56.0
- **PostCSS**: 8.4.35
- **Autoprefixer**: 10.4.17

## 目录结构

```
src/
├── components/    # UI 组件
│   ├── ui/    # 基础 UI 组件
│   ├── Card/   # 卡片组件
│   └── Layout/ # 布局组件
├── data/       # 静态数据
│   ├── core/   # 前端基础
│   ├── projects/ # 项目经验
│   └── algorithms/ # 算法
├── pages/      # 路由页面
├── store/     # Zustand stores
│   ├── useCardStore.ts
│   └── useProgressStore.ts
├── types/     # TypeScript 接口
└── utils/     # 工具函数
```

## 路由结构

```
/                        → Home
/core                    → CoreIndex (章节列表)
/core/:chapterId         → CoreChapter (闪卡练习)
/projects                → ProjectsIndex (项目列表)
/projects/:projectId    → ProjectDetail (项目详情)
/algorithms              → AlgorithmsIndex (算法分类)
/algorithms/:type        → AlgorithmDetail (算法详情)
```

## 状态管理

### useCardStore

- 卡片状态管理
- 进度跟踪
- 搜索与过滤
- localStorage 持久化 (key: `card-storage`)

### useProgressStore

- 总体学习进度
- 章节完成度统计

## 构建与部署

- **构建命令**: `npm run build`
- **输出目录**: `dist/`
- **部署平台**: Vercel (vercel.json 已配置)