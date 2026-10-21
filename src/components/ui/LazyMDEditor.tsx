import { lazy, Suspense, useEffect, type HTMLAttributes, type ReactNode } from 'react';

const MDEditorLazy = lazy(async () => {
  await import('@uiw/react-md-editor/markdown-editor.css');
  return import('@uiw/react-md-editor');
});

interface LazyMDEditorProps {
  value?: string;
  onChange?: (value?: string) => void;
  height?: number | string;
  preview?: 'live' | 'edit' | 'preview';
  style?: React.CSSProperties;
  visibleDragbar?: boolean;
  hideToolbar?: boolean;
  className?: string;
}

function EditorFallback({ height = 160 }: { height?: number | string }) {
  return (
    <div
      className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm text-ink-secondary flex items-center justify-center"
      style={{ minHeight: typeof height === 'number' ? height : 160 }}
    >
      编辑器加载中…
    </div>
  );
}

/** Code-split wrapper around @uiw/react-md-editor */
export function LazyMDEditor(props: LazyMDEditorProps) {
  return (
    <Suspense fallback={<EditorFallback height={props.height} />}>
      <MDEditorLazy {...props} />
    </Suspense>
  );
}

const MarkdownRendererLazy = lazy(() => import('markdown-to-jsx'));

interface LazyMDMarkdownProps {
  source?: string;
  style?: React.CSSProperties;
  className?: string;
  onRendered?: () => void;
}

function childrenToText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return childrenToText((children as { props?: { children?: ReactNode } }).props?.children);
  }
  return '';
}

function slugifyHeading(text: string): string {
  return text.toLocaleLowerCase().trim()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .replace(/[\s-]+/g, '-');
}

function createHeading(level: 1 | 2 | 3 | 4) {
  return function MarkdownHeading({ children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
    const base = slugifyHeading(childrenToText(children)) || `heading-${level}`;
    const Tag = `h${level}` as const;
    return <Tag {...props} id={base}>{children}</Tag>;
  };
}

const MarkdownHeading1 = createHeading(1);
const MarkdownHeading2 = createHeading(2);
const MarkdownHeading3 = createHeading(3);
const MarkdownHeading4 = createHeading(4);

function MarkdownPreviewContent({ onRendered, ...props }: LazyMDMarkdownProps) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => onRendered?.());
    return () => cancelAnimationFrame(frame);
  }, [props.source, onRendered]);

  return (
    <MarkdownRendererLazy
      options={{ overrides: {
        h1: { component: MarkdownHeading1 },
        h2: { component: MarkdownHeading2 },
        h3: { component: MarkdownHeading3 },
        h4: { component: MarkdownHeading4 },
      } }}
    >
      {props.source ?? ''}
    </MarkdownRendererLazy>
  );
}

export function LazyMDMarkdown(props: LazyMDMarkdownProps) {
  return (
    <Suspense fallback={<span className="text-ink-secondary text-sm">…</span>}>
      <div className={props.className} style={props.style}>
        <MarkdownPreviewContent {...props} className={undefined} style={undefined} />
      </div>
    </Suspense>
  );
}
