# docs 目录说明

InterviewFlash 文档库，按用途分类如下。

## 产品与开发（OpenHarness）

| 目录 | 说明 |
|------|------|
| `harness/` | 架构约束、不变量、Linter 规则 |
| `knowledge/` | 项目知识库、PRD、架构上下文 |
| `specs/` | 需求提案、设计、任务与验收 |
| `hooks/` | Agent / CR 检查清单 |
| `guides/` | 操作指南（Supabase 部署、OpenSpec 流程等） |
| `design/` | UI 设计系统、迁移设计 |

## 应用数据与内容

| 目录 | 说明 | 代码引用 |
|------|------|----------|
| `秋招岗位/` | 校招 JD JSON，按公司分子目录 | `src/data/campus-jobs/loadJobs.ts` |
| `Mpx/` | MPX 框架学习资料 | `src/data/mpx/mpx.ts` |
| `AI_Devlopments/` | AI 资讯 HTML/PDF 静态资源 | `src/data/ai/index.ts` |
| `scrape/` | 爬取的题库 JSON（如播面） | `scripts/generate-bomian-core.mjs` |

## 面试与求职素材

| 目录 | 说明 |
|------|------|
| `面经/` | 各公司面试记录（md / pdf），待导入或归档 |
| `interview/` | 技术复盘、八股补充、工程化笔记 |
| `秋招简历/` | 多版本简历 Markdown / HTML / PDF |
| `简历修改/` | 实习产出描述、项目总结、黑客松方案等 |
| `华为AI机考/` | 华为 AI 机考攻略 |

## 导入规范

- 面经导入格式见根目录 [`INTERVIEW_IMPORT_GUIDE.md`](../INTERVIEW_IMPORT_GUIDE.md)
- 新面经 md 建议先放入 `面经/`，导入后内容进入 `src/data/interview/`

## 已清理项（2026-09）

- 删除 `Transfer/`（与 `Mpx/` 重复，唯一文件已并入 `interview/`）
- 删除 `格式规范/`（与 `华为AI机考/` 重复）
- 合并 `resume_project/`、`hackathon/` 到 `简历修改/`
- docs 根目录散落文件已归入上述子目录
