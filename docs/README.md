# docs 目录说明

InterviewFlash 文档库按用途分类如下。

## 产品与开发

| 目录 | 说明 |
|------|------|
| `engineering/` | 项目工程约束、架构、基础设施与代码检查规则 |
| `knowledge/` | 项目上下文、技术参考、领域映射与经验索引 |
| `specs/` | 旧需求流程的历史记录；新变更统一放入根目录 `openspec/` |
| `hooks/` | Claude Code 写后钩子说明与代码评审自查清单 |
| `guides/` | 操作指南（Supabase 部署、OpenSpec 流程等） |
| `design/` | UI 设计系统和迁移设计 |

## 应用数据与内容

| 目录 | 说明 | 代码引用 |
|------|------|----------|
| `秋招岗位/` | 校招 JD JSON，按公司分子目录 | `src/data/campus-jobs/loadJobs.ts` |
| `Mpx/` | MPX 框架学习资料 | `src/data/mpx/mpx.ts` |
| `AI_Devlopments/` | AI 资讯静态资源 | `src/data/ai/index.ts` |
| `scrape/` | 爬取的题库 JSON | 对应 `scripts/` 导入脚本 |

## 面试与求职素材

| 目录 | 说明 |
|------|------|
| `面经/` | 各公司面试记录 |
| `interview/` | 技术复盘、知识补充和工程化笔记 |
| `秋招简历/` | 多版本简历 |
| `简历修改/` | 实习产出、项目总结和方案 |
| `华为AI机考/` | 华为 AI 机考资料 |

## 导入规范

- 面经导入格式见根目录 [`INTERVIEW_IMPORT_GUIDE.md`](../INTERVIEW_IMPORT_GUIDE.md)。
- 新面经 Markdown 建议先放入 `面经/`，导入后内容进入 `src/data/interview/`。
