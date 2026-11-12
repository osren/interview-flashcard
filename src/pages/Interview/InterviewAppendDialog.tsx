import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookMarked, FileText, Loader2, PlusCircle, Sparkles, X } from 'lucide-react';
import { useInterviewResumeSource } from '@/hooks/useInterviewResumeSource';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { LlmQuotaBadge } from '@/components/AI/LlmQuotaBadge';
import { StreamMarkdown } from '@/components/AI/StreamMarkdown';
import { generateInterviewGuideBatches } from '@/lib/llm/interviewGuideRun';
import {
  appendQuestionsToMarkdown,
  parseInterviewGuideMarkdown,
} from '@/lib/llm/prompts/interview-guide';

interface InterviewAppendDialogProps {
  open: boolean;
  onClose: () => void;
  companyName: string;
  departmentName: string;
  sessionName: string;
  /** 当前文档内容（可能含未保存的手动修改），追加时以它为底 */
  markdown: string;
  onApply: (nextMarkdown: string, addedQuestions: number) => void;
}

const inputClass =
  'w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100';

export function InterviewAppendDialog({
  open,
  onClose,
  companyName,
  departmentName,
  sessionName,
  markdown,
  onApply,
}: InterviewAppendDialogProps) {
  const { quota, loading: quotaLoading, error: quotaError, refresh, canUseAi } = useLlmQuota();
  const {
    pdfOptions,
    markdownOptions,
    resumeKey,
    choose,
    selectedResume,
    selectedStatus,
    fallbackMarkdown,
  } = useInterviewResumeSource({ active: open });

  const [questions, setQuestions] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const generationRef = useRef(0);

  const existingQuestions = useMemo(
    () => parseInterviewGuideMarkdown(markdown).map((item) => item.question),
    [markdown]
  );

  const addedCount = useMemo(() => {
    const source = result || output;
    if (!source.trim()) return 0;
    return Math.max(parseInterviewGuideMarkdown(source).length - (result ? existingQuestions.length : 0), 0);
  }, [output, result, existingQuestions]);

  useEffect(() => {
    if (!open) {
      generationRef.current += 1;
      setIsStreaming(false);
      setQuestions('');
      setOutput('');
      setResult('');
      setProgress('');
      setError('');
    }
  }, [open]);

  useEffect(() => () => { generationRef.current += 1; }, []);

  const handleGenerate = async () => {
    if (isStreaming || !canUseAi) return;
    if (!questions.trim()) {
      setError('请输入要追加的面试问题');
      return;
    }
    if (!selectedResume || !selectedResume.text.trim()) {
      setError('当前选中的简历没有可注入的文本，请换一份');
      return;
    }

    const generation = ++generationRef.current;
    setOutput('');
    setResult('');
    setError('');
    setProgress('');
    setIsStreaming(true);

    try {
      const full = await generateInterviewGuideBatches({
        company: companyName,
        position: departmentName,
        sessionName,
        questions,
        resumeText: selectedResume.text,
        baseDocument: markdown,
        onProgress: ({ batchText, done, total }) => {
          if (generationRef.current !== generation) return;
          setOutput(batchText);
          setProgress(total > 1 ? `第 ${Math.min(done + 1, total)}/${total} 批` : '');
        },
        isAborted: () => generationRef.current !== generation,
      });
      if (generationRef.current !== generation) return;
      setResult(full);
      setProgress('');
    } catch (cause) {
      if (generationRef.current !== generation) return;
      setError(cause instanceof Error ? cause.message : 'AI 生成失败，请稍后重试');
    } finally {
      if (generationRef.current === generation) {
        setIsStreaming(false);
        setProgress('');
      }
      void refresh();
    }
  };

  const handleApply = () => {
    if (!result.trim() && !output.trim()) return;
    const next = result || appendQuestionsToMarkdown(markdown, output);
    if (next === markdown) {
      setError('没有识别到新增题目，请调整问题后重新生成');
      return;
    }
    onApply(next, addedCount);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="追加面试问题"
        className="my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <PlusCircle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-stone-800">追加面试问题</h2>
            <p className="text-[11px] text-stone-400">
              已有 {existingQuestions.length} 道题，新题会写入同一篇文档并接续编号，不覆盖原文
            </p>
          </div>
          <LlmQuotaBadge quota={quota} loading={quotaLoading} error={quotaError} onRefresh={refresh} className="max-w-[120px] text-right" />
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <label htmlFor="append-resume" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
              <BookMarked size={12} />
              注入的简历
            </label>
            <select id="append-resume" value={resumeKey} onChange={(event) => choose(event.target.value)} className={inputClass}>
              {pdfOptions.length > 0 && (
                <optgroup label="上传的 PDF">
                  {pdfOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label} · {option.meta}{option.disabled ? ' · 无文字层' : ''}
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
            <div className="mt-1.5 space-y-1.5">
              <p className="flex items-start gap-1 text-[10px] leading-4 text-stone-400">
                <FileText size={11} className="mt-0.5 shrink-0" />
                {selectedStatus === 'ready' && selectedResume
                  ? `将注入 ${selectedResume.text.replace(/\s/g, '').length.toLocaleString('zh-CN')} 字，来源：${selectedResume.meta}`
                  : selectedStatus === 'extracting'
                    ? '正在从 PDF 提取文字…'
                    : selectedStatus === 'pending'
                      ? '该 PDF 尚未提取文字，正在准备'
                      : '当前没有可注入的简历正文'}
              </p>
              {selectedStatus === 'empty' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                  <p className="flex items-start gap-1 text-[10px] leading-4 text-amber-700">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                    这份 PDF{selectedResume?.kind === 'pdf' ? '没有文字层，提取结果是空的（设计稿导出时文字常被转成轮廓）' : '没有正文'}，无法注入。
                  </p>
                  {fallbackMarkdown && (
                    <button
                      type="button"
                      onClick={() => choose(fallbackMarkdown.key)}
                      className="mt-1.5 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
                    >
                      改用「{fallbackMarkdown.label}」
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="append-questions" className="mb-1.5 text-xs font-semibold text-stone-500">
              新增的问题（每行一条，或用序号）
            </label>
            <textarea
              id="append-questions"
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
              rows={5}
              maxLength={4000}
              placeholder={'1. 为什么告警要做分层判定\n2. 你们怎么评估降噪效果'}
              className={`${inputClass} resize-y font-mono text-xs leading-6`}
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
              <span>已在文档里的题目不会重复生成</span>
              <span>{questions.length}/4000</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isStreaming || !canUseAi || selectedStatus !== 'ready'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:bg-stone-300"
          >
            {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isStreaming ? (progress ? `生成中 ${progress}…` : '正在生成…') : '生成新增答案'}
          </button>

          {(output || isStreaming) && (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/60">
              <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">新增片段预览</span>
                <span>{addedCount > 0 ? `将追加 ${addedCount} 道题` : '等待生成'}</span>
              </div>
              <div className="max-h-72 overflow-y-auto p-4">
                {output ? (
                  <StreamMarkdown content={output} streaming={isStreaming} />
                ) : (
                  <p className="text-xs text-stone-400">正在准备内容…</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <p className="text-[11px] leading-5 text-stone-400">
              写入时按题目顺序重排编号，题干和已有答案保持不变；新题同步进入收藏与掌握度追踪。
            </p>
            <button
              type="button"
              onClick={handleApply}
              disabled={!output.trim() || isStreaming}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#b87935] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a26a2c] disabled:bg-stone-300"
            >
              <PlusCircle size={15} />
              追加到文档
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
