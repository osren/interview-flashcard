# Design: 项目管理功能实现方案

## 核心思路

使用 Zustand store 管理用户新增的项目，持久化到 localStorage。

## 实现方案

### 1. 创建 Project Store

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  topics: string[];
}

interface ProjectStore {
  customProjects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}
```

### 2. 修改 ProjectsIndex

- 渲染静态项目 + 用户自定义项目
- 添加"新增项目"按钮（右下角或顶部）
- 项目卡片支持编辑名称（点击标题进入编辑模式）
- 点击项目名称编辑图标进入编辑模式

### 3. 数据结构

```typescript
// localStorage 存储
interface UserProjects {
  customProjects: Project[];
}
```

### 4. 文件变更

- 新增 `src/store/useProjectStore.ts`
- 修改 `src/pages/Projects/ProjectsIndex.tsx`
- 可选：修改 `src/pages/Projects/ProjectDetail.tsx` 支持自定义项目标题