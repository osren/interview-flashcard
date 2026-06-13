import * as XLSX from 'xlsx';

/**
 * 根据文件扩展名判断类型
 */
export function getFileType(file: File): 'xlsx' | 'csv' | 'html' | 'txt' | 'md' | 'pdf' | 'unknown' {
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'xlsx':
    case 'xls':
      return 'xlsx';
    case 'csv':
      return 'csv';
    case 'html':
    case 'htm':
      return 'html';
    case 'txt':
      return 'txt';
    case 'md':
    case 'markdown':
      return 'md';
    case 'pdf':
      return 'pdf';
    default:
      return 'unknown';
  }
}

/**
 * XLSX/CSV 转换为 Markdown
 */
export async function xlsxToMarkdown(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheets: string[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          const mdTable = csvToMarkdownTable(csv);
          sheets.push(`## ${sheetName}\n\n${mdTable}`);
        });

        resolve(sheets.join('\n\n---\n\n'));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
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

/**
 * HTML 转换为 Markdown
 */
export function htmlToMarkdown(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('script, style, nav, footer, header, meta, link').forEach(el => el.remove());

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(processNode).join('');

    switch (tag) {
      case 'h1': return `# ${el.textContent}\n\n`;
      case 'h2': return `## ${el.textContent}\n\n`;
      case 'h3': return `### ${el.textContent}\n\n`;
      case 'h4': return `#### ${el.textContent}\n\n`;
      case 'p': return `${el.textContent}\n\n`;
      case 'li':
      case 'ul':
      case 'ol': return `- ${el.textContent}\n`;
      case 'code': return `\`${el.textContent}\``;
      case 'pre': return `\`\`\`\n${el.textContent}\n\`\`\`\n\n`;
      case 'br': return '\n';
      case 'strong':
      case 'b': return `**${el.textContent}**`;
      case 'em':
      case 'i': return `*${el.textContent}*`;
      case 'a': return `[${el.textContent}](${el.getAttribute('href')})`;
      case 'table': return htmlTableToMarkdown(el);
      case 'div':
      case 'section':
      case 'article':
      case 'main': return children;
      default: return children || '';
    }
  }

  return processNode(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

function htmlTableToMarkdown(table: Element): string {
  const rows = table.querySelectorAll('tr');
  if (rows.length === 0) return '';

  const processRow = (row: Element, isHeader: boolean) => {
    const cells = row.querySelectorAll('th, td');
    return Array.from(cells).map(cell => {
      const text = cell.textContent?.trim() || '';
      return isHeader ? `**${text}**` : text;
    }).join(' | ');
  };

  const headerRow = processRow(rows[0], true);
  const separator = '---'.repeat(headerRow.split('|').length - 2).split('').join('|');
  const bodyRows = Array.from(rows).slice(1).map(row => processRow(row, false)).join('\n');

  return `${headerRow}\n${separator}\n${bodyRows}\n\n`;
}

/**
 * TXT 转换为 Markdown
 */
export function txtToMarkdown(content: string): string {
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 如果已符合面试格式，直接返回
  if (content.match(/##\s*\d+\./)) {
    return normalizeMarkdown(content);
  }

  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());

  return paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      return `## ${trimmed}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}

/**
 * Markdown 标准化
 */
export function normalizeMarkdown(content: string): string {
  content = content.replace(/\r\n/g, '\n');

  // 清理多余空行
  content = content.replace(/\n{3,}/g, '\n\n');

  // 统一问题编号格式
  content = content.replace(/^#\s*(\d+)[.、]\s*(.+)/gm, '## $1. $2');

  // 统一答案格式
  content = content.replace(/^答案[：:]\s*$/gm, '## 答案');

  return content.trim();
}

/**
 * 主转换函数
 */
export async function convertToMarkdown(file: File): Promise<string> {
  const type = getFileType(file);

  if (type === 'unknown') {
    throw new Error(`不支持的文件格式。支持: xlsx, csv, html, txt, md`);
  }

  if (type === 'pdf') {
    throw new Error('PDF 格式需要后端服务处理。请将内容粘贴为文本。');
  }

  const content = await file.text();

  switch (type) {
    case 'xlsx':
      return xlsxToMarkdown(file);
    case 'csv':
      return csvToMarkdownTable(content);
    case 'html':
      return htmlToMarkdown(content);
    case 'txt':
      return txtToMarkdown(content);
    case 'md':
      return normalizeMarkdown(content);
    default:
      throw new Error('未处理的格式');
  }
}
