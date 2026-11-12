import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookMarked, FileText, Loader2, Sparkles, Wand2, X } from 'lucide-react';
import { useInterviewStore } from '@/store/useInterviewStore';
import { useResumeStore } from '@/store/useResumeStore';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { LlmQuotaBadge } from '@/components/AI/LlmQuotaBadge';
import { StreamMarkdown } from '@/components/AI/StreamMarkdown';
import { streamLlm } from '@/lib/llm/call';
import { buildInterviewGuideMessages, parseInterviewGuideMarkdown } from '@/lib/llm/prompts/interview-guide';
import { CANDIDATE_CONTEXT } from '@/lib/llm/prompts/candidate-context';
import { extractPdfText } from '@/utils/extractPdfText';
import type { Company } from '@/types/interview';

interface InterviewGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  companies: Company[];
}

interface ResumeOption {
  key: string;
  kind: 'pdf' | 'markdown';
  id: string;
  label: string;
  meta: string;
  text: string;
  /** PDF 没提取到文本时不可注入 */
  disabled: boolean;
}

const inputClass =
  'w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100';

const labelClass = 'mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500';

function formatUploadDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

export function InterviewGenerateDialog({ open, onClose, companies }: InterviewGenerateDialogProps) {
  const navigate = useNavigate();
  const createGeneratedSession = useInterviewStore((state) => state.createGeneratedSession);
  const aiResumeSource = useInterviewStore((state) => state.aiResumeSource);
  const setAiResumeSource = useInterviewStore((state) => state.setAiResumeSource);
  const resumes = useResumeStore((state) => state.resumes);
  const markdownResumes = useResumeStore((state) => state.markdownResumes);
  const primaryResumeId = useResumeStore((state) => state.primaryResumeId);
  const updateResumeExtractedText = useResumeStore((state) => state.updateResumeExtractedText);
  const { quota, loading: quotaLoading, error: quotaError, refresh, canUseAi } = useLlmQuota();

  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [date, setDate] = useState('');
  const [questions, setQuestions] = useState('');
  const [resumeKey, setResumeKey] = useState('');
  const [extractingResume, setExtractingResume] = useState(false);
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const generationRef = useRef(0);

  useEffect(() => () => { generationRef.current += 1; }, []);

  const companyOptions = useMemo(() => companies.map((item) => item.name), [companies]);
  const departmentOptions = useMemo(
    () => (companies.find((item) => item.name === company)?.departments ?? []).map((item) => item.name),
    [companies, company]
  );

  // 与简历模块的 defaultSource 口径保持一致：先按上传时间倒序列出 PDF，再列 Markdown 简历
  const pdfOptions = useMemo<ResumeOption[]>(
    () =>
      [...resumes]
        .sort((a, b) => b.uploadTime - a.uploadTime)
        .map((item) => ({
          key: `pdf:${item.id}`,
          kind: 'pdf' as const,
          id: item.id,
          label: `${item.name}.pdf`,
          meta: `${formatUploadDate(item.uploadTime)} · PDF`,
          text: item.extractedText ?? '',
          disabled: !(item.extractedText ?? '').trim(),
        })),
    [resumes]
  );

  const markdownOptions = useMemo<ResumeOption[]>(
    () =>
      markdownResumes.map((item) => ({
        key: `markdown:${item.id}`,
        kind: 'markdown' as const,
        id: item.id,
        label: item.id === primaryResumeId ? `${item.title}（主简历）` : item.title,
        meta: 'Markdown',
        text: item.content ?? '',
        disabled: !(item.content ?? '').trim(),
      })),
    [markdownResumes, primaryResumeId]
  );

  const resumeOptions = useMemo(() => [...pdfOptions, ...markdownOptions], [pdfOptions, markdownOptions]);

  const defaultResumeKey = useMemo(() => {
    if (aiResumeSource) {
      const key = `${aiResumeSource.kind}:${aiResumeSource.id}`;
      if (resumeOptions.some((option) => option.key === key && !option.disabled)) return key;
    }
    const pdf = pdfOptions[0];
    if (pdf) return pdf.key;
    const markdown = markdownOptions.find((option) => !option.disabled);
    return markdown?.key ?? resumeOptions[0]?.key ?? '';
  }, [aiResumeSource, resumeOptions, pdfOptions, markdownOptions]);

  useEffect(() => {
    if (open) setResumeKey(defaultResumeKey);
  }, [open, defaultResumeKey]);

  const selectedResume = resumeOptions.find((option) => option.key === resumeKey);
  const selectedPdf = useMemo(
    () => (selectedResume?.kind === 'pdf' ? resumes.find((item) => item.id === selectedResume.id) : undefined),
    [selectedResume, resumes]
  );
  const missingTextPdfCount = pdfOptions.filter((option) => option.disabled).length;

  // 上传时可能没提取成功，选中后按需补一次，和简历模块的懒提取口径一致
  useEffect(() => {
    if (!open || !selectedPdf) return;
    if (selectedPdf.extractedText?.trim()) return;

    let cancelled = false;
    setExtractingResume(true);
    void extractPdfText(selectedPdf.data)
      .then((text) => {
        if (!cancelled && text.trim()) updateResumeExtractedText(selectedPdf.id, text);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setExtractingResume(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, selectedPdf, updateResumeExtractedText]);

  // 流式过程中每来一个 chunk 都重新解析整篇文档代价太高，等生成结束再解析
  const parsedQuestions = useMemo(
    () => (isStreaming ? [] : parseInterviewGuideMarkdown(output)),
    [output, isStreaming]
  );

  const handleClose = () => {
    generationRef.current += 1;
    setIsStreaming(false);
    setError('');
    onClose();
  };

  const handleResumeChange = (key: string) => {
    setResumeKey(key);
    const option = resumeOptions.find((item) => item.key === key);
    if (option) setAiResumeSource({ kind: option.kind, id: option.id });
  };

  const handleGenerate = async () => {
    if (isStreaming || !canUseAi) return;
    const trimmedCompany = company.trim();
    const trimmedDepartment = department.trim();
    const trimmedSession = sessionName.trim();
    if (!trimmedCompany || !trimmedDepartment || !trimmedSession) {
      setError('请先填写公司、岗位和面试场次');
      return;
    }
    if (!questions.trim()) {
      setError('请先粘贴整理好的面试问题');
      return;
    }
    if (!selectedResume || !selectedResume.text.trim()) {
      setError('当前选中的简历没有可注入的文本，请换一份');
      return;
    }

    const generation = ++generationRef.current;
    setOutput('');
    setError('');
    setIsStreaming(true);

    try {
      const messages = buildInterviewGuideMessages({
        company: trimmedCompany,
        position: trimmedDepartment,
        sessionName: trimmedSession,
        sessionDate: date,
        questions,
        resumeText: selectedResume.text,
        candidateContext: CANDIDATE_CONTEXT,
      });

      let text = '';
      for await (const chunk of streamLlm({ messages, temperature: 0.4, max_tokens: 4000 })) {
        if (generationRef.current !== generation) return;
        text += chunk;
        setOutput(text);
      }
      if (generationRef.current !== generation) return;
      if (!text.trim()) setError('AI 没有返回内容，请重试');
    } catch (cause) {
      if (generationRef.current !== generation) return;
      setError(cause instanceof Error ? cause.message : 'AI 生成失败，请稍后重试');
    } finally {
      if (generationRef.current === generation) setIsStreaming(false);
      void refresh();
    }
  };

  const handleSave = () => {
    if (!output.trim()) return;
    const result = createGeneratedSession({
      companyName: company,
      departmentName: department,
      sessionName,
      date,
      markdownContent: output,
      questions: parsedQuestions,
    });
    handleClose();
    navigate(`/interview/${result.companyId}/${result.departmentId}/${result.sessionId}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="AI 生成面经" className="my-6 w-full max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Sparkles size={18} /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-stone-800">AI 生成面经</h2>
            <p className="text-[11px] text-stone-400">贴进整理好的问题，按所选简历与候选人背景生成可复习的分点答案</p>
          </div>
          <LlmQuotaBadge quota={quota} loading={quotaLoading} error={quotaError} onRefresh={refresh} className="max-w-[120px] text-right" />
          <button type="button" onClick={handleClose} aria-label="关闭" className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"><X size={18} /></button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div>
              <label htmlFor="gen-company" className={labelClass}>公司</label>
              <input id="gen-company" list="gen-company-options" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="如：字节跳动" className={inputClass} />
              <datalist id="gen-company-options">{companyOptions.map((name) => <option key={name} value={name} />)}</datalist>
            </div>

            <div>
              <label htmlFor="gen-department" className={labelClass}>岗位</label>
              <input id="gen-department" list="gen-department-options" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="如：前端开发工程师 - APM" className={inputClass} />
              <datalist id="gen-department-options">{departmentOptions.map((name) => <option key={name} value={name} />)}</datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gen-session" className={labelClass}>面试场次</label>
                <input id="gen-session" value={sessionName} onChange={(event) => setSessionName(event.target.value)} placeholder="如：技术一面" className={inputClass} />
              </div>
              <div>
                <label htmlFor="gen-date" className={labelClass}>面试日期</label>
                <input id="gen-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="gen-resume" className={labelClass}>
                <BookMarked size={12} />
                注入的简历
              </label>
              <select id="gen-resume" value={resumeKey} onChange={(event) => handleResumeChange(event.target.value)} className={inputClass}>
                {pdfOptions.length > 0 && (
                  <optgroup label="上传的 PDF">
                    {pdfOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label} · {option.meta}{option.disabled ? ' · 待提取' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {markdownOptions.length > 0 && (
                  <optgroup label="Markdown 简历">
                    {markdownOptions.map((option) => (
                      <option key={option.key} value={option.key} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="mt-1 flex items-start gap-1 text-[10px] leading-4 text-stone-400">
                <FileText size={11} className="mt-0.5 shrink-0" />
                {extractingResume
                  ? '正在从 PDF 提取文字…'
                  : selectedResume
                    ? selectedResume.text.trim()
                      ? `将注入 ${selectedResume.text.replace(/\s/g, '').length.toLocaleString('zh-CN')} 字，来源：${selectedResume.meta}`
                      : '该简历没有可注入的文字，请换一份'
                    : '没有可用的简历来源'}
              </p>
              {missingTextPdfCount > 0 && (
                <p className="mt-1 flex items-start gap-1 text-[10px] leading-4 text-amber-600">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                  {missingTextPdfCount} 份 PDF 尚未提取文字，选中后会自动提取
                </p>
              )}
            </div>

            <div>
              <label htmlFor="gen-questions" className={labelClass}>
                面试问题（每行一条，或用序号）
              </label>
              <textarea
                id="gen-questions"
                value={questions}
                onChange={(event) => setQuestions(event.target.value)}
                rows={9}
                maxLength={6000}
                placeholder={'1. 自我介绍\n2. 你们项目的性能监控是怎么做的？\n3. LCP 从 3.4s 降到 2.1s 具体做了什么\n4. React 的 Fiber 了解吗'}
                className={`${inputClass} resize-y font-mono text-xs leading-6`}
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                <span>公司 / 岗位 / 场次会写入面经目录</span>
                <span>{questions.length}/6000</span>
              </div>
            </div>

            {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-600">{error}</p>}

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isStreaming || !canUseAi || !selectedResume || selectedResume.disabled}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:bg-stone-300"
            >
              {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isStreaming ? '正在生成…' : '一键生成面经'}
            </button>
            {!canUseAi && !quotaLoading && <p className="text-[11px] leading-5 text-stone-400">登录并确认 AI 额度后即可生成。</p>}
          </div>

          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">Markdown 预览</span>
              <span>{parsedQuestions.length ? `已解析 ${parsedQuestions.length} 道题` : '等待生成'}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {output ? (
                <StreamMarkdown content={output} streaming={isStreaming} />
              ) : (
                <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center text-xs text-stone-400">
                  <Sparkles size={22} className="text-stone-300" />
                  <p>填写左侧信息后点击「一键生成面经」</p>
                  <p>生成结果可直接保存为一场面经，题目会自动进入收藏与掌握度追踪</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-100 bg-white px-4 py-3">
              <p className="text-[11px] leading-5 text-stone-400">答案分点、每点带加粗概括，可直接在详情页继续编辑。</p>
              <button
                type="button"
                onClick={handleSave}
                disabled={!output.trim() || isStreaming}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[#b87935] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a26a2c] disabled:bg-stone-300"
              >
                <BookMarked size={15} />
                保存到面经
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
