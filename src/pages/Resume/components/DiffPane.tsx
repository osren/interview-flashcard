import { useMemo, useRef, useEffect } from 'react';
import { diffWordsWithSpace, type Change } from 'diff';
import { cn } from '@/utils/cn';

interface DiffPaneProps {
  oldSource: string;
  newSource: string;
  side: 'left' | 'right';
  hoveredIndex: number | null;
  onPartHover: (index: number | null) => void;
  className?: string;
}

interface DiffPart {
  index: number;
  side: 'left' | 'right' | 'both';
  /** 该段是否整体被改动（用于联动颜色） */
  changed: boolean;
  /** 左侧渲染的片段序列 */
  leftTokens: Array<{ text: string; kind: 'unchanged' | 'removed' }>;
  /** 右侧渲染的片段序列 */
  rightTokens: Array<{ text: string; kind: 'unchanged' | 'added' }>;
}

function splitParagraphs(markdown: string): string[] {
  if (!markdown) return [''];
  // 按空行（双换行）拆段，保留原顺序；段内换行合并为单个空格便于 diff
  const raw = markdown.replace(/\r\n/g, '\n').split(/\n\s*\n+/);
  return raw.map((p) => p.trim()).filter(Boolean);
}

function buildParts(oldMd: string, newMd: string): DiffPart[] {
  // 始终基于"优化后"的段落数做对齐：优化后即用户最关心的目标
  const leftParas = splitParagraphs(oldMd);
  const rightParas = splitParagraphs(newMd);

  const max = Math.max(leftParas.length, rightParas.length);
  const parts: DiffPart[] = [];

  for (let i = 0; i < max; i++) {
    const oldP = leftParas[i] ?? '';
    const newP = rightParas[i] ?? '';
    const changes: Change[] = diffWordsWithSpace(oldP, newP);

    let leftTokens: DiffPart['leftTokens'] = [];
    let rightTokens: DiffPart['rightTokens'] = [];

    for (const change of changes) {
      if (change.added) {
        // 仅出现在优化后
        rightTokens.push({ text: change.value, kind: 'added' });
      } else if (change.removed) {
        // 仅出现在原文
        leftTokens.push({ text: change.value, kind: 'removed' });
      } else {
        leftTokens.push({ text: change.value, kind: 'unchanged' });
        rightTokens.push({ text: change.value, kind: 'unchanged' });
      }
    }

    let leftSide: DiffPart['side'];
    if (oldP && !newP) leftSide = 'left';
    else if (!oldP && newP) leftSide = 'right';
    else leftSide = 'both';

    const changed =
      leftTokens.some((t) => t.kind === 'removed') ||
      rightTokens.some((t) => t.kind === 'added');

    parts.push({
      index: i,
      side: leftSide,
      changed,
      leftTokens: leftTokens.length > 0 ? leftTokens : [{ text: oldP, kind: 'unchanged' }],
      rightTokens: rightTokens.length > 0 ? rightTokens : [{ text: newP, kind: 'unchanged' }],
    });
  }

  return parts;
}

export function DiffPane({
  oldSource,
  newSource,
  side,
  hoveredIndex,
  onPartHover,
  className,
}: DiffPaneProps) {
  const parts = useMemo(() => buildParts(oldSource, newSource), [oldSource, newSource]);

  const containerRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // 当外部 hover 某段，将容器滚到该段；并高亮所在段
  useEffect(() => {
    if (hoveredIndex === null) return;
    const el = partRefs.current.get(hoveredIndex);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredIndex]);

  const visibleParts = parts.filter((p) =>
    side === 'left' ? p.side !== 'right' : p.side !== 'left'
  );

  if (!oldSource && !newSource) {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-dashed border-[#e5e5e5] px-4 py-6 text-sm text-ink-muted text-center',
          className
        )}
      >
        暂无内容
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-color-mode="light"
      className={cn(
        'rounded-xl border-2 border-[#e5e5e5] bg-white overflow-auto p-3 space-y-2',
        className
      )}
    >
      {visibleParts.length === 0 && (
        <p className="text-sm text-ink-muted text-center py-6">无内容</p>
      )}
      {visibleParts.map((part) => {
        const tokens = side === 'left' ? part.leftTokens : part.rightTokens;
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
              'rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words',
              part.changed
                ? side === 'left'
                  ? 'bg-[#fff5f5]'
                  : 'bg-[#f0fdf4]'
                : 'bg-transparent',
              isHovered && 'outline outline-2 outline-amber-400 outline-offset-1'
            )}
          >
            {tokens.map((token, ti) => {
              if (token.kind === 'unchanged') {
                return (
                  <span key={ti} className="text-ink">
                    {token.text}
                  </span>
                );
              }
              if (token.kind === 'removed' && side === 'left') {
                return (
                  <span
                    key={ti}
                    className="bg-[#fde2e2] ring-1 ring-[#f5b5b5] rounded px-0.5 line-through decoration-[#b91c1c]"
                  >
                    {token.text}
                  </span>
                );
              }
              if (token.kind === 'added' && side === 'right') {
                return (
                  <span
                    key={ti}
                    className="bg-[#dcfce7] ring-1 ring-[#86efac] rounded px-0.5 font-medium text-[#166534]"
                  >
                    {token.text}
                  </span>
                );
              }
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
}
