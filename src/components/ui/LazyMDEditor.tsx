import { lazy, Suspense } from 'react';

const MDEditorLazy = lazy(() => import('@uiw/react-md-editor'));

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

const MarkdownLazy = lazy(() =>
  import('@uiw/react-md-editor').then((mod) => ({ default: mod.default.Markdown }))
);

interface LazyMDMarkdownProps {
  source?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function LazyMDMarkdown(props: LazyMDMarkdownProps) {
  return (
    <Suspense fallback={<span className="text-ink-secondary text-sm">…</span>}>
      <MarkdownLazy {...props} />
    </Suspense>
  );
}
