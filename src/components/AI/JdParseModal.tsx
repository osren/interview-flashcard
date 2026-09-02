import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth, LoginModal } from '@/components/Auth';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { fetchJdFromUrl, parseJdText, parsedJobToInput, type ParsedJobPayload } from '@/lib/llm/jd';
import { JOB_CATEGORY_LABELS } from '@/data/campus-jobs';
import type { JobCategory } from '@/types/campus-job';
import { LlmQuotaBadge } from './LlmQuotaBadge';
import { useLlmQuota } from '@/hooks/useLlmQuota';

interface JdParseModalProps {
  open: boolean;
  onClose: () => void;
  defaultCompany?: string;
  onAdded?: (jobId: string) => void;
}

type Step = 'input' | 'preview';

export function JdParseModal({ open, onClose, defaultCompany = '', onAdded }: JdParseModalProps) {
  const { user } = useAuth();
  const addCustomJob = useCampusJobStore((state) => state.addCustomJob);
  const addCustomCompany = useCampusJobStore((state) => state.addCustomCompany);
  const customCompanies = useCampusJobStore((state) => state.customCompanies);

  const [loginOpen, setLoginOpen] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [company, setCompany] = useState(defaultCompany);
  const [jobUrl, setJobUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [fetchHint, setFetchHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedJobPayload | null>(null);
  const { quota, loading: quotaLoading, error: quotaError, refresh: refreshQuota, hasQuota } = useLlmQuota({
    enabled: open && Boolean(user),
  });

  useEffect(() => {
    if (!open) return;
    setStep('input');
    setCompany(defaultCompany);
    setJobUrl('');
    setJdText('');
    setFetchHint(null);
    setError(null);
    setParsed(null);
  }, [open, defaultCompany]);

  const ensureLogin = (): boolean => {
    if (user) return true;
    setLoginOpen(true);
    return false;
  };

  const handleFetchUrl = async () => {
    if (!ensureLogin()) return;
    const url = jobUrl.trim();
    if (!url) {
      setFetchHint('请先填写岗位 URL');
      return;
    }
    setLoading(true);
    setError(null);
    setFetchHint(null);
    try {
      const result = await fetchJdFromUrl(url);
      if (result.ok && result.text) {
        setJdText(result.text);
        setFetchHint('已从 URL 提取 JD 文本，可继续解析');
      } else {
        setFetchHint(result.error ? `${result.error}。请粘贴 JD 文本兜底。` : '抓取失败，请粘贴 JD 文本。');
      }
    } catch (err) {
      setFetchHint(err instanceof Error ? `${err.message}。请粘贴 JD 文本兜底。` : '抓取失败，请粘贴 JD 文本。');
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async (event: FormEvent) => {
    event.preventDefault();
    if (!ensureLogin()) return;
    if (!hasQuota) {
      setError('今日 AI 额度已用完，请明日再试');
      return;
    }
    if (!jdText.trim()) {
      setError('请先抓取 URL 或粘贴 JD 文本');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const job = await parseJdText({
        company: company.trim() || undefined,
        jd_text: jdText.trim(),
        job_url: jobUrl.trim() || undefined,
      });
      setParsed(job);
      setStep('preview');
      await refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
      await refreshQuota();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsed) return;
    const input = parsedJobToInput(parsed, {
      company: company.trim() || undefined,
      job_url: jobUrl.trim() || undefined,
    });
    if (!customCompanies.some((item) => item.name === input.company)) {
      addCustomCompany(input.company, 'blue');
    }
    const id = addCustomJob(input);
    onAdded?.(id);
    onClose();
  };

  if (!open) return null;

  const category = (parsed?.match?.category || parsed?.extended?.job_category || 'other') as JobCategory;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#e5e5e5] bg-[#f7f7f7]">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#1CB0F6]" />
                <div>
                  <h2 className="font-extrabold text-[#3c3c3c]">智能添加岗位</h2>
                  <p className="text-xs text-[#777777]">优先抓取 URL，失败则粘贴 JD 文本解析</p>
                  {user && (
                    <LlmQuotaBadge
                      quota={quota}
                      loading={quotaLoading}
                      error={quotaError}
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-[#777777] hover:bg-white" aria-label="关闭">
                <X size={18} />
              </button>
            </div>

            {step === 'input' ? (
              <form onSubmit={handleParse} className="p-5 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-bold text-[#4b4b4b]">公司名称</span>
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-2.5 outline-none focus:border-[#1CB0F6]"
                    placeholder="例如：腾讯"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-bold text-[#4b4b4b]">岗位 URL（可选）</span>
                  <div className="flex gap-2">
                    <input
                      value={jobUrl}
                      onChange={(event) => setJobUrl(event.target.value)}
                      className="flex-1 rounded-xl border-2 border-[#e5e5e5] px-4 py-2.5 outline-none focus:border-[#1CB0F6]"
                      placeholder="https://..."
                    />
                    <Button type="button" variant="blue" size="sm" onClick={handleFetchUrl} disabled={loading}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : '抓取'}
                    </Button>
                  </div>
                </label>
                {fetchHint && (
                  <div className="rounded-xl border-2 border-[#FFC800] bg-[#fff8dc] px-4 py-2 text-sm text-[#7a5c00]">
                    {fetchHint}
                  </div>
                )}
                <label className="block space-y-1.5">
                  <span className="text-sm font-bold text-[#4b4b4b]">JD 文本</span>
                  <textarea
                    value={jdText}
                    onChange={(event) => setJdText(event.target.value)}
                    className="w-full h-48 rounded-xl border-2 border-[#e5e5e5] px-4 py-3 outline-none focus:border-[#1CB0F6] resize-none"
                    placeholder="粘贴岗位职责、任职要求全文"
                  />
                </label>
                {error && (
                  <div className="rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-4 py-2 text-sm text-[#b42318]">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading || (Boolean(user) && !hasQuota)}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {loading ? '解析中...' : '解析为标准岗位'}
                </Button>
              </form>
            ) : (
              <div className="p-5 space-y-4">
                <div className="rounded-xl bg-[#f7f7f7] p-4 space-y-1">
                  <div className="font-extrabold text-lg text-[#3c3c3c]">
                    {parsed?.basic?.company} · {parsed?.basic?.position}
                  </div>
                  <div className="text-sm text-[#777777]">{parsed?.basic?.location || '地点未识别'}</div>
                  <div className="text-xs font-bold text-[#1CB0F6]">
                    {JOB_CATEGORY_LABELS[category] ?? category} · conf {(parsed?.match?.confidence ?? 0).toFixed(2)}
                  </div>
                </div>
                {parsed?.match?.reason && (
                  <p className="text-sm text-[#4b4b4b]">{parsed.match.reason}</p>
                )}
                {parsed?.extended?.jd_summary && (
                  <p className="text-sm text-[#777777] leading-relaxed">{parsed.extended.jd_summary}</p>
                )}
                {parsed?.extended?.tech_stack && parsed.extended.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.extended.tech_stack.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-[#eef6ff] text-xs font-bold text-[#1CB0F6]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep('input')}>
                    返回修改
                  </Button>
                  <Button type="button" className="flex-1" onClick={handleConfirm}>
                    确认添加
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
