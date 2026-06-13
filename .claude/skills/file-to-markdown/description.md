# File to Markdown Converter

将常见文件格式转换为 Markdown 格式，适配 InterviewFlash 项目的面试文档格式。

## 支持格式

| 格式 | 状态 | 说明 |
|------|------|------|
| `.xlsx` / `.csv` | ✅ 完全支持 | 表格数据转换为 Markdown 表格 |
| `.html` / `.htm` | ✅ 完全支持 | HTML 转换为 Markdown |
| `.txt` | ✅ 完全支持 | 纯文本标准化处理 |
| `.md` | ✅ 完全支持 | 标准化 Markdown 格式 |
| `.pdf` | ⚠️ 需后端 | PDF 需专用解析服务 |

## 输出格式

转换后的 Markdown 遵循项目规范：
- 问题：`## 1. 问题内容`
- 答案：`## 答案`
- 分隔：`---`

## 使用场景

- 用户上传面试文档（Excel 表格、HTML 页面）
- 批量导入外部面试题库
- 标准化不同来源的文档格式
