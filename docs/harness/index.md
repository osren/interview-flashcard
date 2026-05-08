# Open Harness 约束概览

本目录包含项目的所有约束规则，作为 AI Agent 工作的行为准则。

## 目录结构

```
harness/
├── index.md              # 本文件 - 约束总入口
├── invariants/          # 业务不变量
│   ├── index.md        # 不变量入口
│   └── biz.md         # 业务规则
├── architecture/       # 架构约束
│   └── index.md       # 架构模式约束
├── infrastructure/     # 基础设施规范
│   └── index.md       # 规范入口
└── linters/          # 代码检查工具
    ├── index.md      # 检查工具入口
    └── invariant-check.sh  # 运行时检查脚本
```

## 约束分类

### 不变量 (invariants)

项目必须遵守的业务和工程规则，包括：
- 业务规则
- 工程规范

### 架构约束

项目的架构风格和技术选型约束：
- 前端 SPA 架构
- React + TypeScript 严格模式

### 基础设施规范

运行时依赖的外部服务配置：
- 本项目为纯前端项目，无后端服务依赖
- 所有数据存储在 localStorage

### Linters

代码检查和一致性验证工具：
- TypeScript 类型检查
- ESLint 检查

## 使用说明

AI Agent 在执行任何任务前必须：
1. 读取本 index.md 建立完整约束地图
2. 进入相关子目录读取具体规则
3. 确保代码符合所有约束