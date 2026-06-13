# 需求执行工作区

本目录包含 OpenHarness 需求执行的所有工作文件。

## 目录结构

```
specs/
├── index.md       # 本文件 - 工作区总入口
├── active/        # 进行中的需求
│   └── index.md   # 进行中需求索引
└── completed/     # 已完成的需求归档
    └── index.md   # 已完成需求索引
```

## 使用说明

### 创建新需求

```bash
/oh:propose <feature-name>
```

### 执行需求

```bash
/oh:apply <feature>
```

### 验收需求

```bash
/oh:verify
```

### 归档需求

```bash
/oh:archive
```

## 状态流转

```
propose → active → apply → verify → archive → completed
```

每个需求在 `active/` 下创建独立目录，包含：
- `proposal.md` - 需求提案
- `spec.md` - 需求规格
- `design.md` - 技术设计
- `tasks.md` - 任务拆解
- `verification.md` - 验收证据