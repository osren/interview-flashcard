import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * 启发式识别简历标题行（通常短、有关键词、全大写/加粗）
 */
function isLikelyHeading(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 60) return false;
  // 常见简历章节关键词
  const keywords = [
    '教育', '实习', '项目', '技能', '荣誉', '证书', '自我评价',
    'EDUCATION', 'EXPERIENCE', 'SKILLS', 'PROJECTS', 'HONORS', 'AWARDS',
  ];
  return keywords.some((kw) => trimmed.includes(kw));
}

/**
 * Extract plain text from a PDF data URL (base64) or raw ArrayBuffer.
 * Returns basic structured Markdown with headings for likely section titles.
 */
export async function extractPdfText(
  source: string | ArrayBuffer | Uint8Array
): Promise<string> {
  const data =
    typeof source === 'string'
      ? dataUrlToUint8Array(source)
      : source instanceof ArrayBuffer
        ? new Uint8Array(source)
        : source;

  const loadingTask = getDocument({ data, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) lines.push(text);
  }

  // 简单结构化：如果某行像标题，就给它加 ## 前缀
  const structured = lines.map((line) => {
    if (isLikelyHeading(line)) {
      return `## ${line}`;
    }
    return line;
  });

  return structured.join('\n\n').trim();
}
