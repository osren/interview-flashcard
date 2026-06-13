# File to Markdown 使用指南

## 调用时机

当用户要求：
- "转换文件为 Markdown"
- "导入 xlsx 文件"
- "解析 HTML 文件"
- "将 PDF 转为 md"
- "处理这个文档"

## 转换流程

### 1. XLSX / CSV 文件

```typescript
import * as XLSX from 'xlsx';

function xlsxToMarkdown(file: File): string {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheets: string[] = [];

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        // 转换为 Markdown 表格
        const mdTable = csvToMarkdownTable(csv);
        sheets.push(`## ${sheetName}\n\n${mdTable}`);
      });

      resolve(sheets.join('\n\n---\n\n'));
    };
    reader.readAsArrayBuffer(file);
  });
}

function csvToMarkdownTable(csv: string): string {
  const rows = csv.split('\n').map(r => r.split(','));
  if (rows.length === 0) return '';

  const header = rows[0].map(h => `**${h.trim()}**`).join(' | ');
  const separator = rows[0].map(() => '---').join(' | ');
  const body = rows.slice(1).map(row =>
    row.map(cell => cell.trim()).join(' | ')
  ).join('\n');

  return `${header}\n${separator}\n${body}`;
}
```

### 2. HTML 文件

```typescript
// 使用 DOMParser 解析 HTML
function htmlToMarkdown(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 移除脚本和样式
  doc.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());

  // 转换逻辑
  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1': return `# ${el.textContent}`;
      case 'h2': return `## ${el.textContent}`;
      case 'h3': return `### ${el.textContent}`;
      case 'h4': return `#### ${el.textContent}`;
      case 'p': return `${el.textContent}\n`;
      case 'li': return `- ${el.textContent}`;
      case 'code': return `\`${el.textContent}\``;
      case 'pre': return `\`\`\`\n${el.textContent}\n\`\`\``;
      case 'table': return tableToMarkdown(el);
      case 'br': return '\n';
      default: return Array.from(el.childNodes).map(processNode).join('');
    }
  }

  return processNode(doc.body);
}
```

### 3. TXT 文件

```typescript
function txtToMarkdown(content: string): string {
  // 标准化换行符
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 如果内容符合面试格式，直接返回
  if (content.match(/##\s*\d+\./)) {
    return content;
  }

  // 按空行分割段落
  const paragraphs = content.split(/\n\s*\n/);

  return paragraphs
    .map((p, i) => {
      const trimmed = p.trim();
      if (!trimmed) return '';

      // 检测是否为问答格式
      const lines = trimmed.split('\n');
      if (lines.length >= 2) {
        // 尝试识别问答对
        return trimmed;
      }

      return `## ${trimmed}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}
```

### 4. Markdown 标准化

```typescript
function normalizeMarkdown(content: string): string {
  // 标准化换行符
  content = content.replace(/\r\n/g, '\n');

  // 清理多余的空行（超过2个连续空行改为2个）
  content = content.replace(/\n{3,}/g, '\n\n');

  // 确保问题编号格式统一
  content = content.replace(/^#\s*(\d+)[.、]\s*(.+)/gm, '## $1. $2');

  // 确保答案格式统一
  content = content.replace(/^答案[：:]\s*$/gm, '## 答案');

  return content.trim();
}
```

## 输出格式模板

```markdown
# 文档标题

## 1. 第一个问题

## 答案
问题一的答案内容...

---

## 2. 第二个问题

## 答案
问题二的答案内容...

---
```

## 错误处理

- 文件读取失败：提示用户检查文件权限或文件是否损坏
- 空文件：返回提示"文件内容为空"
- 不支持的格式：列出支持的格式列表
- 编码问题：尝试多种编码（UTF-8、GBK）
