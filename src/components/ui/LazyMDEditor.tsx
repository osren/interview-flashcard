import { lazy, Suspense, useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ distance: number; zoom: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
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

  useEffect(() => {
    if (!viewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      const orientation = screen.orientation as ScreenOrientation & { unlock?: () => void };
      orientation.unlock?.();
    };
  }, [viewerOpen]);

  const openViewer = () => {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: 'landscape') => Promise<void> };
    void orientation.lock?.('landscape').catch(() => undefined);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setViewerOpen(true);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLImageElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const active = [...pointers.current.values()];
    const distance = active.length > 1 ? Math.hypot(active[0].x - active[1].x, active[0].y - active[1].y) : 0;
    gesture.current = { distance, zoom, x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const active = [...pointers.current.values()];
    if (active.length > 1 && gesture.current.distance > 0) {
      const distance = Math.hypot(active[0].x - active[1].x, active[0].y - active[1].y);
      setZoom(Math.min(5, Math.max(1, gesture.current.zoom * distance / gesture.current.distance)));
    } else if (active.length === 1 && zoom > 1) {
      setOffset({ x: gesture.current.offsetX + event.clientX - gesture.current.x, y: gesture.current.offsetY + event.clientY - gesture.current.y });
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLImageElement>) => {
    pointers.current.delete(event.pointerId);
    gesture.current = null;
  };

  const changeZoom = (amount: number) => setZoom((current) => Math.min(5, Math.max(1, current + amount)));

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
          className={`relative my-0 h-auto max-w-full cursor-zoom-in rounded-xl transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${props.className ?? ''}`}
          onClick={openViewer}
          role="button"
          tabIndex={0}
          aria-label={`放大查看图片：${alt || '图片'}`}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openViewer(); } }}
        />
      ) : (
        <img ref={imageRef} alt={alt ?? ''} aria-hidden="true" className="absolute h-px w-px opacity-0" />
      )}
      {viewerOpen && src && createPortal(
        <div className="markdown-image-viewer" role="dialog" aria-modal="true" aria-label="图片查看器" onClick={() => setViewerOpen(false)}>
          <div className="markdown-image-viewer-toolbar" onClick={(event) => event.stopPropagation()}>
            <span className="markdown-image-viewer-hint">双指缩放 · 拖动查看</span>
            <button type="button" aria-label="缩小" onClick={() => changeZoom(-0.5)}><ZoomOut size={20} /></button>
            <span className="markdown-image-viewer-zoom">{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="放大" onClick={() => changeZoom(0.5)}><ZoomIn size={20} /></button>
            <button type="button" aria-label="重置缩放" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}><RotateCcw size={19} /></button>
            <button type="button" aria-label="关闭图片" onClick={() => setViewerOpen(false)}><X size={22} /></button>
          </div>
          <img
            src={src}
            alt={alt ?? ''}
            className="markdown-image-viewer-image"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
          />
        </div>,
        document.body,
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
