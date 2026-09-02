import { useEffect, useMemo, useState } from 'react';
import { LazyMDEditor, LazyMDMarkdown } from '@/components/ui/LazyMDEditor';
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

interface OptimizeResult {
  optimized_markdown: string;
  changes_summary: string[];
}

export function ResumeOptimizeTab() {
  const { user } = useAuth();
  const sync = useCampusJobSyncContext();
  const { markdownResumes, primaryResumeId, updateMarkdownContent, upsertMarkdownResume, setPrimaryResumeId } =
    useResumeStore();
  const jobs = useCampusJobStore((state) => state.getAllJobs());
  const setCatalogJobs = useCampusJobStore((state) => state.setCatalogJobs);

  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(primaryResumeId);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jdText, setJdText] = useState('');
  const [preview, setPreview] = useState('');
  const [changes, setChanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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

  const current = useMemo(
    () => markdownResumes.find((item) => item.id === selectedResumeId) ?? markdownResumes[0],
    [markdownResumes, selectedResumeId]
  );

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

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
    if (!current?.content.trim() || !jdText.trim()) {
      setError('请先选择/编辑简历，并填写或选择 JD');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeEdgeFunction<OptimizeResult>('optimize-resume', {
        resume_markdown: current.content,
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
    if (!preview.trim() || !current) return;
    const company = selectedJob?.basic.company ?? '自定义JD';
    const position = selectedJob?.basic.position ?? '优化版';
    const copy = {
      id: `resume-${Date.now()}`,
      title: `${company}-${position}-优化版`,
      content: preview,
      sourceResumeId: current.id,
      targetJobId: selectedJobId || undefined,
      jdSnapshot: jdText,
      createdAt: Date.now(),
    };
    upsertMarkdownResume(copy);
    setSelectedResumeId(copy.id);
    setPrimaryResumeId(copy.id);
  };

  const handleExport = () => {
    const content = preview || current?.content || '';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${current?.title ?? 'resume'}.md`;
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
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={current?.id ?? ''}
          onChange={(event) => setSelectedResumeId(event.target.value)}
          className="rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm font-bold"
        >
          {markdownResumes.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
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
        <Button type="button" onClick={handleOptimize} disabled={loading || (Boolean(user) && !canUseAi)}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? '优化中...' : '按 JD 优化'}
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
          <h3 className="font-extrabold text-[#3c3c3c]">当前简历</h3>
          <div data-color-mode="light">
            <LazyMDEditor
              value={current?.content ?? ''}
              onChange={(value) => current && updateMarkdownContent(current.id, value || '')}
              height={420}
              preview="edit"
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
          {changes.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-[#4b4b4b] space-y-1">
              {changes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <div data-color-mode="light" className="rounded-xl border-2 border-[#e5e5e5] p-3 min-h-[420px] bg-white overflow-auto">
            <LazyMDMarkdown source={preview || '*点击「按 JD 优化」后在此展示副本*'} />
          </div>
        </div>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
