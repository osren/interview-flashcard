import { useEffect, useMemo, useState } from 'react';
import { LazyMDMarkdown } from '@/components/ui/LazyMDEditor';
import { Download, Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth, LoginModal } from '@/components/Auth';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { useResumeStore } from '@/store/useResumeStore';
import { invokeEdgeFunction } from '@/lib/llm/invoke';
import { useCampusJobSyncContext } from '@/hooks/useCampusJobSync';
import { ensureLocalCampusCatalog } from '@/data/campus-jobs/loadJobs';
import { LlmQuotaBadge } from '@/components/AI/LlmQuotaBadge';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { extractPdfText } from '@/utils/extractPdfText';

interface OptimizeResult {
  optimized_markdown: string;
  changes_summary: string[];
}

type OptimizeSourceKind = 'pdf' | 'markdown';

interface OptimizeSource {
  kind: OptimizeSourceKind;
  id: string;
}

function sourceKey(source: OptimizeSource): string {
  return `${source.kind}:${source.id}`;
}

function parseSourceKey(value: string): OptimizeSource | null {
  const [kind, ...rest] = value.split(':');
  const id = rest.join(':');
  if ((kind !== 'pdf' && kind !== 'markdown') || !id) return null;
  return { kind, id };
}

export function ResumeOptimizeTab() {
  const { user } = useAuth();
  const sync = useCampusJobSyncContext();
  const {
    resumes,
    markdownResumes,
    primaryResumeId,
    updateMarkdownContent,
    updateResumeExtractedText,
    upsertMarkdownResume,
    setPrimaryResumeId,
  } = useResumeStore();
  const jobs = useCampusJobStore((state) => state.getAllJobs());
  const setCatalogJobs = useCampusJobStore((state) => state.setCatalogJobs);

  const latestPdf = useMemo(() => {
    if (resumes.length === 0) return undefined;
    return [...resumes].sort((a, b) => b.uploadTime - a.uploadTime)[0];
  }, [resumes]);

  const defaultSource = useMemo<OptimizeSource>(() => {
    if (latestPdf) return { kind: 'pdf', id: latestPdf.id };
    return { kind: 'markdown', id: primaryResumeId };
  }, [latestPdf, primaryResumeId]);

  const [loginOpen, setLoginOpen] = useState(false);
  const [source, setSource] = useState<OptimizeSource>(defaultSource);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jdText, setJdText] = useState('');
  const [preview, setPreview] = useState('');
  const [changes, setChanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Prefer newest PDF whenever the default source changes (e.g. after upload)
  useEffect(() => {
    setSource(defaultSource);
  }, [defaultSource.id, defaultSource.kind]);

  // If the selected resume was deleted, fall back to the default source
  useEffect(() => {
    const exists =
      source.kind === 'pdf'
        ? resumes.some((item) => item.id === source.id)
        : markdownResumes.some((item) => item.id === source.id);
    if (!exists) setSource(defaultSource);
  }, [resumes, markdownResumes, source, defaultSource]);

  useEffect(() => {
    sync.ensureCatalogLoaded();
  }, [sync.ensureCatalogLoaded]);

  useEffect(() => {
    let cancelled = false;
    void ensureLocalCampusCatalog().then((localJobs) => {
      if (cancelled) return;
      const state = useCampusJobStore.getState();
      if (state.catalogSource === 'remote' && state.catalogJobs.length > 0) return;
      if (localJobs.length > 0) {
        setCatalogJobs(localJobs, 'local');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setCatalogJobs]);

  const selectedPdf = useMemo(
    () => (source.kind === 'pdf' ? resumes.find((item) => item.id === source.id) : undefined),
    [resumes, source]
  );

  const selectedMarkdown = useMemo(
    () =>
      source.kind === 'markdown'
        ? markdownResumes.find((item) => item.id === source.id) ?? markdownResumes[0]
        : undefined,
    [markdownResumes, source]
  );

  const resumeText =
    source.kind === 'pdf'
      ? selectedPdf?.extractedText?.trim() ?? ''
      : selectedMarkdown?.content?.trim() ?? '';

  const sourceTitle =
    source.kind === 'pdf'
      ? selectedPdf?.name ?? 'PDF 简历'
      : selectedMarkdown?.title ?? 'Markdown 简历';

  // Lazy-extract text for PDFs that were uploaded before this feature
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

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  const handleSourceChange = (value: string) => {
    const next = parseSourceKey(value);
    if (!next) return;
    setSource(next);
    setError(null);
  };

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;
    const pieces = [
      `${job.basic.company} ${job.basic.position}`,
      job.extended.jd_summary,
      job.extended.requirements_summary,
      ...job.extended.jd_responsibilities,
      ...job.extended.jd_requirements,
    ].filter(Boolean);
    setJdText(pieces.join('\n'));
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
    if (!resumeText || !jdText.trim()) {
      setError(
        source.kind === 'pdf' && extracting
          ? '正在提取 PDF 文本，请稍候'
          : '请先选择带文本的简历，并填写或选择 JD'
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeEdgeFunction<OptimizeResult>('optimize-resume', {
        resume_text: resumeText,
        resume_markdown: resumeText,
        resume_source: source.kind,
        jd_text: jdText,
        company: selectedJob?.basic.company,
        position: selectedJob?.basic.position,
      });
      setPreview(result.optimized_markdown);
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
    if (!preview.trim()) return;
    const company = selectedJob?.basic.company ?? '自定义JD';
    const position = selectedJob?.basic.position ?? '优化版';
    const copy = {
      id: `resume-${Date.now()}`,
      title: `${company}-${position}-优化版`,
      content: preview,
      sourceResumeId: source.id,
      targetJobId: selectedJobId || undefined,
      jdSnapshot: jdText,
      createdAt: Date.now(),
    };
    upsertMarkdownResume(copy);
    setSource({ kind: 'markdown', id: copy.id });
    setPrimaryResumeId(copy.id);
  };

  const handleExport = () => {
    const content = preview || resumeText || '';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sourceTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
        默认使用<strong className="text-[#1CB0F6]">最近上传的 PDF</strong>
        提取文本进行 JD 优化；也可切换到 Markdown 简历作为备用。
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={sourceKey(source)}
          onChange={(event) => handleSourceChange(event.target.value)}
          className="rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm font-bold min-w-[220px]"
        >
          {resumes.length > 0 && (
            <optgroup label="PDF 简历（默认优先）">
              {[...resumes]
                .sort((a, b) => b.uploadTime - a.uploadTime)
                .map((item, index) => (
                  <option key={item.id} value={sourceKey({ kind: 'pdf', id: item.id })}>
                    {index === 0 ? `★ ${item.name}（最近上传）` : item.name}
                  </option>
                ))}
            </optgroup>
          )}
          <optgroup label="Markdown 简历（备用）">
            {markdownResumes.map((item) => (
              <option key={item.id} value={sourceKey({ kind: 'markdown', id: item.id })}>
                {item.title}
              </option>
            ))}
          </optgroup>
        </select>
        <select
          value={selectedJobId}
          onChange={(event) => handleJobChange(event.target.value)}
          className="rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm font-bold min-w-[200px]"
        >
          <option value="">粘贴自定义 JD</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.basic.company} · {job.basic.position}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={handleOptimize}
          disabled={loading || extracting || (Boolean(user) && !canUseAi)}
        >
          {loading || extracting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {extracting ? '提取 PDF 中...' : loading ? '优化中...' : '按 JD 优化'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleSaveCopy} disabled={!preview}>
          <Save size={16} />
          保存为新副本
        </Button>
        <Button type="button" variant="outline" onClick={handleExport}>
          <Download size={16} />
          导出 MD
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-4 py-2 text-sm text-[#b42318]">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="font-extrabold text-[#3c3c3c]">
            {source.kind === 'pdf' ? '当前简历（PDF 提取文本）' : '当前简历（Markdown）'}
          </h3>
          <div
            data-color-mode="light"
            className="rounded-xl border-2 border-[#e5e5e5] p-4 bg-white"
          >
            <LazyMDMarkdown
              source={
                source.kind === 'pdf'
                  ? selectedPdf?.extractedText?.trim() || (extracting ? '*正在提取 PDF 文本…*' : '*上传 PDF 后将自动显示提取文本*')
                  : selectedMarkdown?.content?.trim() || '*简历内容为空*'
              }
            />
          </div>
          <textarea
            value={jdText}
            onChange={(event) => setJdText(event.target.value)}
            className="w-full h-36 rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1CB0F6]"
            placeholder="粘贴目标 JD，或从上方选择已有岗位自动填充"
          />
        </div>
        <div className="space-y-3">
          <h3 className="font-extrabold text-[#3c3c3c]">优化预览</h3>
          <div
            data-color-mode="light"
            className="rounded-xl border-2 border-[#e5e5e5] p-4 bg-white"
          >
            <LazyMDMarkdown
              source={preview || '*点击「按 JD 优化」后在此预览优化结果*'}
            />
          </div>
          {changes.length > 0 && (
            <div className="rounded-xl border-2 border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#4b4b4b]">
              <p className="font-bold text-[#3c3c3c] mb-1">本次改动摘要</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {changes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
