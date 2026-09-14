import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth, LoginModal } from '@/components/Auth';
import { useResumeStore, Resume } from '@/store/useResumeStore';
import { invokeEdgeFunction } from '@/lib/llm/invoke';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { LlmQuotaBadge } from '@/components/AI/LlmQuotaBadge';
import { cn } from '@/utils/cn';
import { extractPdfText } from '@/utils/extractPdfText';
import { LazyMDMarkdown } from '@/components/ui/LazyMDEditor';

interface OptimizeResult {
  optimized_markdown: string;
  changes_summary: string[];
}

type SourceKind = 'pdf' | 'markdown';

interface OptimizeSource {
  kind: SourceKind;
  id: string;
}

const INSTRUCTION_PRESETS = [
  '使用 STAR 法则重写每个项目经历',
  '按时间倒序排列经历',
  '所有成果加上可量化数字（若原文没有，可标注"待补"）',
  '中文项目名后括注英文/拼音',
  '合并同类项目，去除冗余段落',
  '语气更专业、克制，避免堆砌形容词',
];

function sourceKey(source: OptimizeSource): string {
  return `${source.kind}:${source.id}`;
}

function parseSourceKey(value: string): OptimizeSource | null {
  const [kind, ...rest] = value.split(':');
  const id = rest.join(':');
  if ((kind !== 'pdf' && kind !== 'markdown') || !id) return null;
  return { kind, id };
}

export function ResumePolishTab() {
  const { user } = useAuth();
  const {
    resumes,
    markdownResumes,
    primaryResumeId,
    addResume,
    updateMarkdownContent,
    updateResumeExtractedText,
    upsertMarkdownResume,
    setPrimaryResumeId,
  } = useResumeStore();

  const latestPdf = useMemo<Resume | undefined>(() => {
    if (resumes.length === 0) return undefined;
    return [...resumes].sort((a, b) => b.uploadTime - a.uploadTime)[0];
  }, [resumes]);

  const defaultSource = useMemo<OptimizeSource>(() => {
    if (latestPdf) return { kind: 'pdf', id: latestPdf.id };
    return { kind: 'markdown', id: primaryResumeId };
  }, [latestPdf, primaryResumeId]);

  const [source, setSource] = useState<OptimizeSource>(defaultSource);
  const [instruction, setInstruction] = useState<string>('');
  const [optimized, setOptimized] = useState<string>('');
  const [changes, setChanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    quota,
    loading: quotaLoading,
    error: quotaError,
    refresh: refreshQuota,
    isQuotaExhausted,
    canUseAi,
  } = useLlmQuota({
    enabled: Boolean(user),
  });

  // 简历列表变化时回退到默认（处理被删除的场景）
  useEffect(() => {
    const exists =
      source.kind === 'pdf'
        ? resumes.some((r) => r.id === source.id)
        : markdownResumes.some((m) => m.id === source.id);
    if (!exists) setSource(defaultSource);
  }, [resumes, markdownResumes, source, defaultSource]);

  // PDF 上传完成后，让它自动成为当前 source（最近一份）
  useEffect(() => {
    if (!latestPdf) return;
    if (source.kind === 'markdown' && source.id === primaryResumeId) {
      setSource({ kind: 'pdf', id: latestPdf.id });
    }
  }, [latestPdf?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPdf = useMemo(
    () => (source.kind === 'pdf' ? resumes.find((r) => r.id === source.id) : undefined),
    [resumes, source]
  );
  const selectedMarkdown = useMemo(
    () =>
      source.kind === 'markdown'
        ? markdownResumes.find((m) => m.id === source.id) ?? markdownResumes[0]
        : undefined,
    [markdownResumes, source]
  );

  const sourceText =
    source.kind === 'pdf'
      ? selectedPdf?.extractedText?.trim() ?? ''
      : selectedMarkdown?.content?.trim() ?? '';

  const sourceTitle =
    source.kind === 'pdf'
      ? selectedPdf?.name ?? 'PDF 简历'
      : selectedMarkdown?.title ?? 'Markdown 简历';

  // 懒提取：选中 PDF 但还没文本时自动跑一次
  useEffect(() => {
    if (source.kind !== 'pdf' || !selectedPdf) return;
    if (selectedPdf.extractedText?.trim()) return;

    let cancelled = false;
    setExtracting(true);
    setError(null);

    void extractPdfText(selectedPdf.data)
      .then((text) => {
        if (cancelled) return;
        if (!text.trim()) {
          setError('未能从该 PDF 提取到文字，可改用 Markdown 简历作为备用');
          return;
        }
        updateResumeExtractedText(selectedPdf.id, text);
      })
      .catch(() => {
        if (!cancelled) {
          setError('PDF 文本提取失败，可改用 Markdown 简历作为备用');
        }
      })
      .finally(() => {
        if (!cancelled) setExtracting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [source, selectedPdf, updateResumeExtractedText]);

  const handleSourceChange = (value: string) => {
    const next = parseSourceKey(value);
    if (!next) return;
    setSource(next);
    setError(null);
  };

  const handleOptimize = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (isQuotaExhausted) {
      setError('今日 AI 额度已用完，请明日再试');
      return;
    }
    if (!sourceText) {
      setError(
        source.kind === 'pdf' && extracting
          ? '正在提取 PDF 文本，请稍候'
          : '请先选择带文本的简历，并填写或选择说明'
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeEdgeFunction<OptimizeResult>('optimize-resume', {
        resume_text: sourceText,
        resume_markdown: sourceText,
        resume_source: source.kind,
        instruction: instruction.trim(),
      });
      setOptimized(result.optimized_markdown ?? '');
      setChanges(result.changes_summary ?? []);
      await refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : '优化失败');
      await refreshQuota();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCopy = () => {
    if (!optimized.trim()) return;
    const id = `resume-polish-${Date.now()}`;
    const copy = {
      id,
      title: `${sourceTitle}-优化版-${new Date().toLocaleDateString('zh-CN')}`,
      content: optimized,
      sourceResumeId: selectedMarkdown?.id ?? selectedPdf?.id,
      createdAt: Date.now(),
    };
    upsertMarkdownResume(copy);
    setSavedToast(`已保存为新副本：${copy.title}`);
    setSource({ kind: 'markdown', id });
    setPrimaryResumeId(id);
    window.setTimeout(() => setSavedToast(null), 2500);
  };

  const handleExport = () => {
    const content = optimized || sourceText || '';
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sourceTitle}-优化版.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setOptimized('');
    setChanges([]);
    setError(null);
  };

  const handleApplyPreset = () => {
    const next = INSTRUCTION_PRESETS.join('\n');
    setInstruction((curr) => (curr.trim() ? `${curr}\n${next}` : next));
  };

  const handleUploadPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') {
          setError(`"${file.name}" 不是 PDF 文件`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`"${file.name}" 超过 10MB 限制`);
          continue;
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'));
          reader.readAsDataURL(file);
        });

        let extractedText: string | undefined;
        try {
          const text = await extractPdfText(dataUrl);
          if (text.trim()) extractedText = text;
        } catch {
          // 提取失败仍允许保存 PDF，后续会自动重试
        }

        addResume({
          name: file.name.replace(/\.pdf$/i, ''),
          data: dataUrl,
          ...(extractedText ? { extractedText } : {}),
        });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadButton = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="gap-2"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? '上传中…' : '上传 PDF 简历'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleUploadPdf}
        className="hidden"
      />
    </>
  );

  return (
    <div className="space-y-4">
      {user && (
        <LlmQuotaBadge
          quota={quota}
          loading={quotaLoading}
          error={quotaError}
          onRefresh={refreshQuota}
        />
      )}

      <div className="rounded-xl border-2 border-[#e5e5e5] bg-[#f7fbff] px-4 py-3 text-sm text-[#4b4b4b]">
        <strong className="text-[#1CB0F6]">简历优化</strong>关注格式与措辞，可不填 JD。
        选择一份 Markdown 或 PDF 简历，输入「优化说明」（留空 = 仅做基础措辞/顺序优化），
        左右双列展示修改前后的 Markdown 预览。
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={sourceKey(source)}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm font-bold min-w-[260px]"
        >
          {resumes.length > 0 && (
            <optgroup label="PDF 简历（默认优先）">
              {[...resumes]
                .sort((a, b) => b.uploadTime - a.uploadTime)
                .map((r, idx) => (
                  <option key={r.id} value={sourceKey({ kind: 'pdf', id: r.id })}>
                    {idx === 0 ? `★ ${r.name}（最近上传）` : r.name}
                  </option>
                ))}
            </optgroup>
          )}
          <optgroup label="Markdown 简历（备用）">
            {markdownResumes.length === 0 ? (
              <option value="" disabled>
                暂无 Markdown 简历
              </option>
            ) : (
              markdownResumes.map((m) => (
                <option key={m.id} value={sourceKey({ kind: 'markdown', id: m.id })}>
                  {m.id === primaryResumeId ? `★ ${m.title}` : m.title}
                </option>
              ))
            )}
          </optgroup>
        </select>

        {uploadButton}

        <Button
          type="button"
          onClick={handleOptimize}
          disabled={loading || extracting || (Boolean(user) && !canUseAi)}
          className="gap-2"
        >
          {loading || extracting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {extracting
            ? '提取 PDF 中...'
            : loading
              ? '优化中...'
              : '按说明优化'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleSaveCopy}
          disabled={!optimized}
          className="gap-2"
        >
          <Save size={16} />
          保存为新副本
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={!optimized && !sourceText}
          className="gap-2"
        >
          <Download size={16} />
          导出 MD
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleClear}
          disabled={!optimized && !error}
          className="gap-2"
        >
          <Trash2 size={16} />
          清空预览
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[#3c3c3c]">
            优化说明（可选）
          </label>
          <button
            type="button"
            onClick={handleApplyPreset}
            className="text-xs text-[#1CB0F6] hover:underline"
          >
            一键填入常用预设
          </button>
        </div>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="w-full h-28 rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1CB0F6] resize-y font-medium leading-relaxed"
          placeholder="例如：使用 STAR 法则重写项目经历；按时间倒序；中文项目名括注英文；只改排版不重写内容；语气更专业克制…（每行一条说明，留空则只做基础措辞/顺序优化）"
        />
      </div>

      {error && (
        <div
          className="rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-4 py-2 text-sm text-[#b42318]"
          role="alert"
        >
          {error}
        </div>
      )}

      {savedToast && (
        <div className="rounded-xl border-2 border-[#58CC02] bg-[#f0fdf4] px-4 py-2 text-sm text-[#166534]">
          {savedToast}
        </div>
      )}

      {changes.length > 0 && (
        <div className="rounded-xl border-2 border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#4b4b4b]">
          <p className="font-bold text-[#3c3c3c] mb-1">本次改动摘要</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {changes.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-extrabold text-[#3c3c3c]">
            修改前（{source.kind === 'pdf' ? 'PDF 提取文本' : 'Markdown'} · {sourceTitle}
            {extracting ? '（提取中…）' : ''}）
          </h3>
          <div
            data-color-mode="light"
            className="rounded-xl border-2 border-[#e5e5e5] p-4 bg-white"
          >
            <LazyMDMarkdown
              source={
                source.kind === 'pdf'
                  ? selectedPdf?.extractedText?.trim() || (extracting ? '*正在提取 PDF 文本…*' : '*该 PDF 暂无提取文本*')
                  : selectedMarkdown?.content?.trim() || '*简历内容为空*'
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-[#3c3c3c]">修改后（优化预览）</h3>
          <div
            data-color-mode="light"
            className="rounded-xl border-2 border-[#e5e5e5] p-4 bg-white"
          >
            <LazyMDMarkdown
              source={optimized || '*点击「按说明优化」后在此预览优化结果*'}
            />
          </div>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
