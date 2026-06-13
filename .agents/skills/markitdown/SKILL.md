---
name: markitdown
description: "将文件和办公文档转换为 Markdown。支持 PDF、DOCX、PPTX、XLSX、图片（含 OCR）、音频（含文字转录）、HTML、CSV、JSON、XML、ZIP、YouTube 链接、EPub 等多种格式。"
allowed-tools: [Read, Write, Edit, Bash]
license: MIT
source: https://github.com/microsoft/markitdown
---

# MarkItDown - 文件转 Markdown 转换工具

## 概述

MarkItDown 是微软开发的 Python 工具，用于将各种文件格式转换为 Markdown。它特别适合将文档转换为 LLM 友好的文本格式，因为 Markdown 具有高效的 token 利用率，能被现代语言模型很好地理解。

**主要优势**：
- 将文档转换为干净、结构化的 Markdown
- 为 LLM 处理优化的 token 数量
- 支持 15+ 种文件格式
- 可选的 AI 增强图像描述
- 图片和扫描文档的 OCR 支持
- 音频文件的语音转文字功能

## 科学示意图视觉增强

**使用此技能创建文档时，始终应考虑添加科学图表和示意图来增强视觉沟通。**

如果文档中还没有示意图或图表：
- 使用 **scientific-schematics** 技能生成 AI 驱动的出版级图表
- 用自然语言简单描述您所需的图表
- Nano Banana Pro 将自动生成、审查和改进示意图

**对于新文档：** 应默认生成科学示意图，以视觉方式表现文本中描述的关键概念、工作流、架构或关系。

**如何生成示意图：**
```bash
python scripts/generate_schematic.py "您的图表描述" -o figures/output.png
```

AI 将自动：
- 按正确格式创建出版级图片
- 通过多次迭代审查和改进
- 确保可访问性（色盲友好、高对比度）
- 将输出保存在 figures/ 目录中

**何时添加示意图：**
- 文档转换工作流图表
- 文件格式架构插图
- OCR 处理管道图表
- 集成工作流可视化
- 系统架构图
- 数据流图
- 任何需要可视化受益的复杂概念

有关创建示意图的详细指导，请参考 scientific-schematics 技能文档。

---

## 支持的格式

| 格式 | 描述 | 说明 |
|--------|-------------|-------|
| **PDF** | 便携式文档格式 | 完整文本提取 |
| **DOCX** | Microsoft Word | 表格、格式保留 |
| **PPTX** | PowerPoint | 幻灯片及备注 |
| **XLSX** | Excel 电子表格 | 表格和数据 |
| **图片** | JPEG、PNG、GIF、WebP | EXIF 元数据 + OCR |
| **音频** | WAV、MP3 | 元数据 + 文字转录 |
| **HTML** | 网页 | 清晰转换 |
| **CSV** | 逗号分隔值 | 表格格式 |
| **JSON** | JSON 数据 | 结构化表示 |
| **XML** | XML 文档 | 结构化格式 |
| **ZIP** | 存档文件 | 遍历内容 |
| **EPUB** | 电子书 | 完整文本提取 |
| **YouTube** | 视频链接 | 获取文字转录 |

## 快速开始

### 安装

```bash
# 安装所有功能
pip install 'markitdown[all]'

# 或从源代码安装
git clone https://github.com/microsoft/markitdown.git
cd markitdown
pip install -e 'packages/markitdown[all]'
```

### 命令行使用

```bash
# 基本转换
markitdown document.pdf > output.md

# 指定输出文件
markitdown document.pdf -o output.md

# 管道内容
cat document.pdf | markitdown > output.md

# 启用插件
markitdown --list-plugins  # 列出可用插件
markitdown --use-plugins document.pdf -o output.md
```

### Python API

```python
from markitdown import MarkItDown

# 基本用法
md = MarkItDown()
result = md.convert("document.pdf")
print(result.text_content)

# 从流转换
with open("document.pdf", "rb") as f:
    result = md.convert_stream(f, file_extension=".pdf")
    print(result.text_content)
```

## 高级功能

### 1. AI 增强图像描述

通过 OpenRouter 使用 LLM 生成详细的图像描述（适用于 PPTX 和图片文件）：

```python
from markitdown import MarkItDown
from openai import OpenAI

# 初始化 OpenRouter 客户端（OpenAI 兼容 API）
client = OpenAI(
    api_key="your-openrouter-api-key",
    base_url="https://openrouter.ai/api/v1"
)

md = MarkItDown(
    llm_client=client,
    llm_model="anthropic/claude-sonnet-4.5",  # 推荐用于科学视觉
    llm_prompt="详细描述此图像以供科学文档使用"
)

result = md.convert("presentation.pptx")
print(result.text_content)
```

### 2. Azure 文档智能

使用微软文档智能进行增强的 PDF 转换：

```bash
# 命令行
markitdown document.pdf -o output.md -d -e "<document_intelligence_endpoint>"
```

```python
# Python API
from markitdown import MarkItDown

md = MarkItDown(docintel_endpoint="<document_intelligence_endpoint>")
result = md.convert("complex_document.pdf")
print(result.text_content)
```

### 3. 插件系统

MarkItDown 支持第三方插件以扩展功能：

```bash
# 列出已安装的插件
markitdown --list-plugins

# 启用插件
markitdown --use-plugins file.pdf -o output.md
```

在 GitHub 上通过标签查找插件：`#markitdown-plugin`

## 可选依赖

控制支持的文件格式：

```bash
# 安装特定格式
pip install 'markitdown[pdf, docx, pptx]'

# 所有可用选项：
# [all]                  - 所有可选依赖
# [pptx]                 - PowerPoint 文件
# [docx]                 - Word 文档
# [xlsx]                 - Excel 电子表格
# [xls]                  - 旧版 Excel 文件
# [pdf]                  - PDF 文档
# [outlook]              - Outlook 邮件
# [az-doc-intel]         - Azure 文档智能
# [audio-transcription]  - WAV 和 MP3 转文字
# [youtube-transcription] - YouTube 视频转录
```

## 常见用例

### 1. 将科学论文转换为 Markdown

```python
from markitdown import MarkItDown

md = MarkItDown()

# 转换 PDF 论文
result = md.convert("research_paper.pdf")
with open("paper.md", "w") as f:
    f.write(result.text_content)
```

### 2. 从 Excel 提取数据进行分析

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("data.xlsx")

# 结果将为 Markdown 表格格式
print(result.text_content)
```

### 3. 处理多个文档

```python
from markitdown import MarkItDown
import os
from pathlib import Path

md = MarkItDown()

# 处理目录中的所有 PDF
pdf_dir = Path("papers/")
output_dir = Path("markdown_output/")
output_dir.mkdir(exist_ok=True)

for pdf_file in pdf_dir.glob("*.pdf"):
    result = md.convert(str(pdf_file))
    output_file = output_dir / f"{pdf_file.stem}.md"
    output_file.write_text(result.text_content)
    print(f"已转换：{pdf_file.name}")
```

### 4. 带 AI 描述转换 PowerPoint

```python
from markitdown import MarkItDown
from openai import OpenAI

# 使用 OpenRouter 访问多个 AI 模型
client = OpenAI(
    api_key="your-openrouter-api-key",
    base_url="https://openrouter.ai/api/v1"
)

md = MarkItDown(
    llm_client=client,
    llm_model="anthropic/claude-sonnet-4.5",  # 推荐用于演示文稿
    llm_prompt="详细描述此幻灯片图像，重点关注关键视觉元素和数据"
)

result = md.convert("presentation.pptx")
with open("presentation.md", "w") as f:
    f.write(result.text_content)
```

### 5. 批量转换不同格式

```python
from markitdown import MarkItDown
from pathlib import Path

md = MarkItDown()

# 要转换的文件
files = [
    "document.pdf",
    "spreadsheet.xlsx",
    "presentation.pptx",
    "notes.docx"
]

for file in files:
    try:
        result = md.convert(file)
        output = Path(file).stem + ".md"
        with open(output, "w") as f:
            f.write(result.text_content)
        print(f"✓ 已转换 {file}")
    except Exception as e:
        print(f"✗ 转换 {file} 时出错：{e}")
```

### 6. 提取 YouTube 视频转录

```python
from markitdown import MarkItDown

md = MarkItDown()

# 将 YouTube 视频转换为转录
result = md.convert("https://www.youtube.com/watch?v=VIDEO_ID")
print(result.text_content)
```

## Docker 使用

```bash
# 构建镜像
docker build -t markitdown:latest .

# 运行转换
docker run --rm -i markitdown:latest < ~/document.pdf > output.md
```

## 最佳实践

### 1. 选择正确的转换方法

- **简单文档**：使用基本的 `MarkItDown()`
- **复杂 PDF**：使用 Azure 文档智能
- **视觉内容**：启用 AI 图像描述
- **扫描文档**：确保已安装 OCR 依赖

### 2. 优雅处理错误

```python
from markitdown import MarkItDown

md = MarkItDown()

try:
    result = md.convert("document.pdf")
    print(result.text_content)
except FileNotFoundError:
    print("文件未找到")
except Exception as e:
    print(f"转换错误：{e}")
```

### 3. 高效处理大文件

```python
from markitdown import MarkItDown

md = MarkItDown()

# 对于大文件，使用流式处理
with open("large_file.pdf", "rb") as f:
    result = md.convert_stream(f, file_extension=".pdf")
    
    # 分块处理或直接保存
    with open("output.md", "w") as out:
        out.write(result.text_content)
```

### 4. 优化 Token 效率

Markdown 输出已经很高效，但你可以：
- 移除过多空白
- 合并相似段落
- 删除不需要的元数据

```python
from markitdown import MarkItDown
import re

md = MarkItDown()
result = md.convert("document.pdf")

# 清理多余空白
clean_text = re.sub(r'\n{3,}', '\n\n', result.text_content)
clean_text = clean_text.strip()

print(clean_text)
```

## 与科学工作流的集成

### 转换文献进行审查

```python
from markitdown import MarkItDown
from pathlib import Path

md = MarkItDown()

# 转换文献文件夹中的所有论文
papers_dir = Path("literature/pdfs")
output_dir = Path("literature/markdown")
output_dir.mkdir(exist_ok=True)

for paper in papers_dir.glob("*.pdf"):
    result = md.convert(str(paper))
    
    # 保存包含元数据
    output_file = output_dir / f"{paper.stem}.md"
    content = f"# {paper.stem}\n\n"
    content += f"**来源**：{paper.name}\n\n"
    content += "---\n\n"
    content += result.text_content
    
    output_file.write_text(content)

# 带图表的 AI 增强转换
from openai import OpenAI

client = OpenAI(
    api_key="your-openrouter-api-key",
    base_url="https://openrouter.ai/api/v1"
)

md_ai = MarkItDown(
    llm_client=client,
    llm_model="anthropic/claude-sonnet-4.5",
    llm_prompt="用技术精准性描述科学图表"
)
```

### 提取表格进行分析

```python
from markitdown import MarkItDown
import re

md = MarkItDown()
result = md.convert("data_tables.xlsx")

# Markdown 表格可以被解析或直接使用
print(result.text_content)
```

## 故障排除

### 常见问题

1. **缺少依赖**：安装特定功能的包
   ```bash
   pip install 'markitdown[pdf]'  # 用于 PDF 支持
   ```

2. **二进制文件错误**：确保以二进制模式打开文件
   ```python
   with open("file.pdf", "rb") as f:  # 注意 "rb"
       result = md.convert_stream(f, file_extension=".pdf")
   ```

3. **OCR 不工作**：安装 tesseract
   ```bash
   # macOS
   brew install tesseract
   
   # Ubuntu
   sudo apt-get install tesseract-ocr
   ```

## 性能考虑

- **PDF 文件**：大型 PDF 可能需要时间；如果支持，考虑页码范围
- **图像 OCR**：OCR 处理需要大量 CPU
- **音频转录**：需要额外的计算资源
- **AI 图像描述**：需要 API 调用（可能产生成本）

## 后续步骤

- 查看 `references/api_reference.md` 获取完整 API 文档
- 检查 `references/file_formats.md` 获取格式特定细节
- 查阅 `scripts/batch_convert.py` 了解自动化示例
- 探索 `scripts/convert_with_ai.py` 了解 AI 增强转换

## 资源

- **MarkItDown GitHub**：https://github.com/microsoft/markitdown
- **PyPI**：https://pypi.org/project/markitdown/
- **OpenRouter**：https://openrouter.ai（用于 AI 增强转换）
- **OpenRouter API 密钥**：https://openrouter.ai/keys
- **OpenRouter 模型**：https://openrouter.ai/models
- **MCP 服务器**：markitdown-mcp（用于 Claude Desktop 集成）
- **插件开发**：参考 `packages/markitdown-sample-plugin`

