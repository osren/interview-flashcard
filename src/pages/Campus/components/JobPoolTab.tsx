import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, Table2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type JobPoolSource = 'feishu' | 'tencent';

const JOB_POOL_SOURCES: {
  id: JobPoolSource;
  label: string;
  description: string;
  url: string;
}[] = [
  {
    id: 'feishu',
    label: '飞书岗位表',
    description: '飞书多维表格 · 秋招岗位汇总',
    url: 'https://my.feishu.cn/sheets/Ja0YsDMuKhy7Sxt0E9HcuRIinTf?sheet=2d5134',
  },
  {
    id: 'tencent',
    label: '腾讯文档岗位表',
    description: '27届提前批秋招信息汇总（持续更新）',
    url: 'https://docs.qq.com/smartsheet/DZkdPVGtGb1ZvaG5R?tab=t00i2h&viewId=v2JKhc',
  },
];

const EMBED_LOAD_TIMEOUT_MS = 15000;

const BLOCKED_HINTS = [
  'refused to connect',
  'refused to display',
  'x-frame-options',
  'frame ancestors',
  '无法嵌入',
  '禁止嵌入',
  '不允许被嵌入',
  '此页面不支持',
];

type SourceEmbedState = {
  mounted: boolean;
  loading: boolean;
  failed: boolean;
};

const INITIAL_EMBED_STATE: Record<JobPoolSource, SourceEmbedState> = {
  feishu: { mounted: true, loading: true, failed: false },
  tencent: { mounted: false, loading: false, failed: false },
};

function isIframeBlocked(iframe: HTMLIFrameElement): boolean {
  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      return false;
    }

    const text = doc.body?.innerText?.toLowerCase() ?? '';
    if (BLOCKED_HINTS.some((hint) => text.includes(hint))) {
      return true;
    }

    return !doc.body || doc.body.childElementCount === 0;
  } catch {
    return false;
  }
}

export function JobPoolTab() {
  const [activeSource, setActiveSource] = useState<JobPoolSource>('feishu');
  const [embedState, setEmbedState] = useState(INITIAL_EMBED_STATE);
  const timersRef = useRef<Partial<Record<JobPoolSource, number>>>({});
  const current = JOB_POOL_SOURCES.find((s) => s.id === activeSource)!;
  const currentState = embedState[activeSource];

  const clearTimer = useCallback((sourceId: JobPoolSource) => {
    const timer = timersRef.current[sourceId];
    if (timer !== undefined) {
      window.clearTimeout(timer);
      delete timersRef.current[sourceId];
    }
  }, []);

  const startTimeout = useCallback(
    (sourceId: JobPoolSource) => {
      clearTimer(sourceId);
      timersRef.current[sourceId] = window.setTimeout(() => {
        setEmbedState((prev) => {
          const current = prev[sourceId];
          if (!current.loading || current.failed) {
            return prev;
          }
          return {
            ...prev,
            [sourceId]: { ...current, loading: false, failed: true },
          };
        });
        delete timersRef.current[sourceId];
      }, EMBED_LOAD_TIMEOUT_MS);
    },
    [clearTimer]
  );

  useEffect(() => {
    if (embedState.feishu.mounted && embedState.feishu.loading && !embedState.feishu.failed) {
      startTimeout('feishu');
    }
    return () => {
      Object.keys(timersRef.current).forEach((key) => {
        clearTimer(key as JobPoolSource);
      });
    };
    // Only on mount for default source; other sources start timeout in selectSource
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSource = useCallback(
    (sourceId: JobPoolSource) => {
      setActiveSource(sourceId);
      setEmbedState((prev) => {
        const next = prev[sourceId];
        if (next.mounted) {
          return prev;
        }
        startTimeout(sourceId);
        return {
          ...prev,
          [sourceId]: { mounted: true, loading: true, failed: false },
        };
      });
    },
    [startTimeout]
  );

  const handleIframeLoad = useCallback(
    (sourceId: JobPoolSource) => (event: React.SyntheticEvent<HTMLIFrameElement>) => {
      clearTimer(sourceId);
      const blocked = isIframeBlocked(event.currentTarget);
      setEmbedState((prev) => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          loading: false,
          failed: blocked,
        },
      }));
    },
    [clearTimer]
  );

  const handleIframeError = useCallback(
    (sourceId: JobPoolSource) => () => {
      clearTimer(sourceId);
      setEmbedState((prev) => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          loading: false,
          failed: true,
        },
      }));
    },
    [clearTimer]
  );

  return (
    <div className="surface-panel overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[600px]">
      <div className="p-3 sm:p-4 border-b border-[#e5e5e5] space-y-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#eefbf0] to-[#eef6ff] flex items-center justify-center flex-shrink-0">
              <Table2 size={18} className="text-[#58CC02]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-ink-primary text-sm">秋招岗位池</h3>
              <p className="text-xs text-ink-secondary truncate">{current.description}</p>
            </div>
          </div>
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold text-[#1CB0F6] bg-[#eef6ff] rounded-xl hover:bg-[#dbeafe] transition-colors flex-shrink-0"
          >
            <ExternalLink size={15} />
            新窗口打开
          </a>
        </div>

        <div className="flex gap-1 p-1 bg-[#f7f7f7] rounded-xl">
          {JOB_POOL_SOURCES.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => selectSource(source.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all',
                activeSource === source.id
                  ? 'bg-white text-ink-primary shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary'
              )}
            >
              <Globe size={14} className="flex-shrink-0" />
              {source.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        {currentState.loading && !currentState.failed && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa] text-sm font-bold text-ink-secondary z-10">
            加载中…
          </div>
        )}

        {currentState.failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#fafafa] p-6 text-center z-10">
            <p className="text-sm font-bold text-ink-secondary leading-relaxed max-w-md">
              无法在此页面内预览，可能是飞书/腾讯文档限制了嵌入，请点击下方按钮直接访问。
            </p>
            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[#1CB0F6] rounded-xl hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={15} />
              新窗口打开
            </a>
          </div>
        )}

        {JOB_POOL_SOURCES.map((source) => {
          const state = embedState[source.id];
          if (!state.mounted || state.failed) {
            return null;
          }

          const isActive = activeSource === source.id;
          return (
            <iframe
              key={source.id}
              src={source.url}
              className={cn(
                'absolute inset-0 w-full h-full border-0 bg-white',
                isActive ? 'z-0' : 'z-[-1] invisible pointer-events-none'
              )}
              title={source.label}
              allow="clipboard-read; clipboard-write"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleIframeLoad(source.id)}
              onError={handleIframeError(source.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
