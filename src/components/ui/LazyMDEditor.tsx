import { lazy, Suspense, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { markdownHeadingId } from '@/utils/studyMarkdown';

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

function createHeading(level: 1 | 2 | 3 | 4) {
  return function MarkdownHeading({ children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
    const base = markdownHeadingId(childrenToText(children)) || `heading-${level}`;
    const Tag = `h${level}` as const;
    return <Tag {...props} id={base} className={`scroll-mt-24 ${props.className ?? ''}`}>{children}</Tag>;
  };
}

function MarkdownImage({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = props.src;

  useEffect(() => {
    setNearViewport(false);
    setLoaded(false);
    setFailed(false);
    if (!src) return;

    const image = imageRef.current;
    if (!image || !('IntersectionObserver' in window)) {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: '900px 0px' });
    observer.observe(image);
    return () => observer.disconnect();
  }, [src]);

  return (
    <span className="relative my-5 block min-h-24 overflow-hidden rounded-xl bg-stone-100">
      {!loaded && !failed && <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100" aria-hidden="true" />}
      {failed ? (
        <span className="relative flex min-h-24 items-center justify-center px-4 text-sm text-stone-500">图片加载失败</span>
      ) : nearViewport ? (
        <img
          {...props}
          ref={imageRef}
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`relative my-0 h-auto max-w-full rounded-xl transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${props.className ?? ''}`}
        />
      ) : (
        <img ref={imageRef} alt={alt ?? ''} aria-hidden="true" className="absolute h-px w-px opacity-0" />
      )}
    </span>
  );
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
          img: { component: MarkdownImage },
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
