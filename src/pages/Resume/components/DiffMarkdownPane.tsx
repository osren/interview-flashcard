import { useMemo, useRef, useEffect, Suspense, lazy } from 'react';
import { diffWordsWithSpace, type Change } from 'diff';
import { cn } from '@/utils/cn';

const MarkdownLazy = lazy(() =>
  import('@uiw/react-md-editor').then((mod) => ({ default: mod.default.Markdown }))
);

interface DiffMarkdownPaneProps {
  /** 原始文本（Markdown） */
  oldSource: string;
  /** 优化后文本（Markdown） */
  newSource: string;
  /** 'left' = 显示原文+删除高亮，'right' = 显示优化+新增高亮 */
  side: 'left' | 'right';
  hoveredIndex: number | null;
  onPartHover: (index: number | null) => void;
  className?: string;
  placeholder?: string;
}

interface DiffPart {
  index: number;
  /** 'left' 仅原文，'right' 仅优化后，'both' 两侧都有 */
  side: 'left' | 'right' | 'both';
  changed: boolean;
  /** 渲染用的 HTML（含 <del>/<em> 高亮标签） */
  renderedHtml: string;
  /** 原始 token，用于 hover target */
  tokens: Array<{ text: string; kind: 'unchanged' | 'removed' | 'added' }>;
}

function splitParagraphs(markdown: string): string[] {
  if (!markdown) return [''];
  const raw = markdown.replace(/\r\n/g, '\n').split(/\n\s*\n+/);
  return raw.map((p) => p.trim()).filter(Boolean);
}

/**
 * 对两个 Markdown 文本按段落 diff，返回带 HTML 高亮的段落序列。
 * HTML 直接用 dangerouslySetInnerHTML 渲染，不走 Markdown 解析器，
 * 因此 token 对齐和文字内容完全一致，不会有叠加重影。
 */
function buildParts(
  oldMd: string,
  newMd: string,
  side: 'left' | 'right'
): DiffPart[] {
  const leftParas = splitParagraphs(oldMd);
  const rightParas = splitParagraphs(newMd);
  const max = Math.max(leftParas.length, rightParas.length);
  const parts: DiffPart[] = [];

  for (let i = 0; i < max; i++) {
    const oldP = leftParas[i] ?? '';
    const newP = rightParas[i] ?? '';
    const changes: Change[] = diffWordsWithSpace(oldP, newP);

    // tokens 用于 hover target（不需要渲染）
    const tokens = changes.map((c) => ({
      text: c.value,
      kind: c.added ? 'added' : c.removed ? 'removed' : 'unchanged',
    }));

    // Build HTML for the current side — keep all tokens for context, style only changed ones
    const sideTokens = changes.map((c) => {
      if (side === 'left') {
        return { text: c.value, kind: c.removed ? 'removed' : 'unchanged' as const };
      }
      return { text: c.value, kind: c.added ? 'added' : 'unchanged' as const };
    });

    let renderedHtml = '';
    for (const tok of sideTokens) {
      if (tok.kind === 'unchanged') {
        renderedHtml += escHtml(tok.text); // plain text
      } else if (tok.kind === 'removed') {
        renderedHtml += `<del>${escHtml(tok.text)}</del>`;
      } else if (tok.kind === 'added') {
        renderedHtml += `<em class="diff-added">${escHtml(tok.text)}</em>`;
      }
    }

    const partSide: DiffPart['side'] =
      oldP && !newP ? 'left' : !oldP && newP ? 'right' : 'both';
    const changed =
      changes.some((c) => c.removed) || changes.some((c) => c.added);

    parts.push({
      index: i,
      side: partSide,
      changed,
      renderedHtml,
      tokens,
    });
  }

  return parts;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function DiffMarkdownPane({
  oldSource,
  newSource,
  side,
  hoveredIndex,
  onPartHover,
  className,
  placeholder = '暂无内容',
}: DiffMarkdownPaneProps) {
  const parts = useMemo(() => buildParts(oldSource, newSource, side), [oldSource, newSource, side]);

  const visibleParts = parts.filter((p) =>
    side === 'left' ? p.side !== 'right' : p.side !== 'left'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    if (hoveredIndex === null) return;
    const el = partRefs.current.get(hoveredIndex);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredIndex]);

  const hasContent = oldSource || newSource;

  if (!hasContent) {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-dashed border-[#e5e5e5] px-4 py-6 text-sm text-ink-muted text-center flex items-center justify-center',
          className
        )}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-color-mode="light"
      className={cn(
        'rounded-xl border-2 border-[#e5e5e5] bg-white overflow-auto px-3 py-2',
        // Global highlight styles (removed / added)
        '[&_del]:bg-[#fde2e2] [&_del]:ring-1 [&_del]:ring-[#f5b5b5] [&_del]:rounded [&_del]:px-0.5 [&_del]:line-through [&_del]:decoration-[#b91c1c] [&_del]:text-[#b91c1c] ',
        '[&_em.diff-added]:bg-[#dcfce7] [&_em.diff-added]:ring-1 [&_em.diff-added]:ring-[#86efac] [&_em.diff-added]:rounded [&_em.diff-added]:px-0.5 [&_em.diff-added]:not-italic [&_em.diff-added]:font-medium [&_em.diff-added]:text-[#166534] ',
        className
      )}
    >
      {visibleParts.map((part) => {
        const isHovered = hoveredIndex === part.index;

        return (
          <div
            key={part.index}
            ref={(el) => {
              partRefs.current.set(part.index, el);
            }}
            onMouseEnter={() => onPartHover(part.index)}
            onMouseLeave={() => onPartHover(null)}
            onClick={() => onPartHover(isHovered ? null : part.index)}
            className={cn(
              'rounded px-2 py-1 mb-0.5 cursor-pointer transition-all text-sm leading-relaxed',
              part.changed
                ? side === 'left'
                  ? 'border-l-4 border-[#f5b5b5] bg-[#fff5f5]/[0.12]'
                  : 'border-l-4 border-[#86efac] bg-[#f0fdf4]/[0.12]'
                : 'bg-transparent',
              isHovered && 'outline outline-2 outline-amber-400 outline-offset-0'
            )}
            // Paragraph text: escaped HTML with <del>/<em> diff tags inline
            dangerouslySetInnerHTML={{ __html: part.renderedHtml }}
          />
        );
      })}
    </div>
  );
}
