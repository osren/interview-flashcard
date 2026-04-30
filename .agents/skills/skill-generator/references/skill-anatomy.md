# Skill 结构详解

## 目录组织

```
skill-name/
├── SKILL.md              # 主规范文件（必需）
└── references/           # 参考文档目录（可选）
    ├── topic-a.md        # 详细主题文档
    └── topic-b.md
```

## 三级加载系统

Skill 使用三级加载机制，理解这个机制有助于设计更好的 skill：

### 第一级：Metadata

- **内容**：name + description（Frontmatter）
- **加载时机**：始终在上下文中
- **大小限制**：约 100 词
- **作用**：决定 skill 是否被触发

### 第二级：SKILL.md body

- **内容**：Markdown 正文
- **加载时机**：skill 触发后加载
- **大小限制**：理想情况下 < 500 行
- **作用**：提供详细的工作流程和指令

### 第三级：Bundled resources

- **内容**：references/ 目录下的文件
- **加载时机**：按需加载
- **大小限制**：无限制
- **作用**：提供详细的参考文档、示例、模板等

## 何时拆分到 references

1. **SKILL.md 超过 500 行**：考虑拆分
2. **包含独立主题**：如 AWS/GCP/Azure 不同平台的部署指南
3. **详细的参考文档**：如 API 文档、配置选项列表
4. **大型示例集合**：如代码模板、配置模板

## 拆分原则

### 按领域/变体组织

```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md       # AWS 部署详情
    ├── gcp.md       # GCP 部署详情
    └── azure.md     # Azure 部署详情
```

### 在 SKILL.md 中明确指引

```markdown
根据你的云平台选择对应的参考文档：
- AWS 部署：请读取 `references/aws.md`
- GCP 部署：请读取 `references/gcp.md`
- Azure 部署：请读取 `references/azure.md`
```

## 大型 reference 文件规范

如果 reference 文件超过 300 行，应在文件开头添加目录：

```markdown
# AWS 部署指南

## 目录

1. [前置条件](#前置条件)
2. [配置步骤](#配置步骤)
3. [常见问题](#常见问题)
4. [故障排查](#故障排查)

...
```

## 示例：完整的 skill 结构

```
intrip-case-solver/
├── SKILL.md                      # 主规范，包含工作流程和引用
└── references/
    ├── button_entry.md           # 入口态排查流程
    ├── estimate_flow.md          # 执行态排查流程
    ├── confirm_flow.md           # 确认态排查流程
    ├── route_flow.md             # 修改路线排查流程
    ├── get_trace.md              # Trace 获取方法
    └── change_dest_reason.md     # 原因对照表
```

SKILL.md 中引用：

```markdown
根据 case 类型和症状分型选择对应的 reference 文件：

| Case 类型 | 症状阶段 | Reference 文件 |
|-----------|----------|----------------|
| 修改目的地 | 入口态 | `references/button_entry.md` |
| 修改目的地 | 执行态 | `references/estimate_flow.md` |
| 修改目的地 | 确认态 | `references/confirm_flow.md` |
```