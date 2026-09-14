import { useState, useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { MessageSquare, Edit3, Save, Sparkles, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useAuth, LoginModal } from '@/components/Auth';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { LlmQuotaBadge } from '@/components/AI/LlmQuotaBadge';
import { invokeEdgeFunction } from '@/lib/llm/invoke';
import { extractPdfText } from '@/utils/extractPdfText';

type SourceType = { kind: 'pdf'; id: string } | { kind: 'markdown'; id: string };

export function ResumeIntroTab() {
  const { resumes, introScript, setIntroScript, markdownResumes } = useResumeStore();
  const { user } = useAuth();
  const { quota, loading: quotaLoading, error: quotaError, refresh: refreshQuota } = useLlmQuota();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(introScript);
  const [source, setSource] = useState<SourceType>({ kind: 'pdf', id: '' });
  const [generating, setGenerating] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const selectedPdf = useMemo(
    () => (source.kind === 'pdf' && source.id ? resumes.find((r) => r.id === source.id) : undefined),
    [source, resumes]
  );

  const selectedMarkdown = useMemo(
    () =>
      source.kind === 'markdown' && source.id
        ? markdownResumes.find((m) => m.id === source.id)
        : undefined,
    [source, markdownResumes]
  );

  const handleSaveIntro = () => {
    setIntroScript(editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(introScript);
    setIsEditing(false);
  };

  const handleGenerate = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    let resumeText = '';

    if (source.kind === 'pdf' && selectedPdf) {
      if (!selectedPdf.extractedText?.trim()) {
        setExtracting(true);
        try {
          const text = await extractPdfText(selectedPdf.data);
          if (text.trim()) {
            resumeText = text;
          } else {
            alert('PDF 文本提取失败或内容为空');
            return;
          }
        } catch {
          alert('PDF 文本提取失败');
          return;
        } finally {
          setExtracting(false);
        }
      } else {
        resumeText = selectedPdf.extractedText;
      }
    } else if (source.kind === 'markdown' && selectedMarkdown) {
      resumeText = selectedMarkdown.content || '';
      if (!resumeText.trim()) {
        alert('Markdown 简历内容为空');
        return;
      }
    } else {
      alert('请先选择一份简历');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `你是一名资深面试教练。请根据以下简历内容，生成一份5分钟左右的面试自我介绍口述稿。

要求：
1. 自然流畅，符合口语表达习惯
2. 突出个人亮点和项目经验
3. 体现技术能力和成长潜力
4. 控制在5分钟左右（约800-1000字）
5. 不要过度夸张，保持真实可信

简历内容：
${resumeText}

请直接输出面试自我介绍稿，不要有其他说明。`;

      const result = await invokeEdgeFunction('generate-intro', { prompt });

      if (result.content) {
        setIntroScript(result.content);
        setEditContent(result.content);
        setIsEditing(false);
        await refreshQuota();
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-4"
    >
      {user && (
        <LlmQuotaBadge
          quota={quota}
          loading={quotaLoading}
          error={quotaError}
          onRefresh={refreshQuota}
        />
      )}

      {/* 简历选择区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-[#3c3c3c] mb-3">选择简历</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {/* PDF 简历选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4b4b4b]">PDF 简历</label>
            <select
              value={source.kind === 'pdf' ? source.id : ''}
              onChange={(e) => setSource({ kind: 'pdf', id: e.target.value })}
              className="w-full rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1CB0F6]"
            >
              <option value="">选择 PDF 简历</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Markdown 简历选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4b4b4b]">Markdown 简历</label>
            <select
              value={source.kind === 'markdown' ? source.id : ''}
              onChange={(e) => setSource({ kind: 'markdown', id: e.target.value })}
              className="w-full rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1CB0F6]"
            >
              <option value="">选择 Markdown 简历</option>
              {markdownResumes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleGenerate}
            disabled={generating || extracting || (!source.id)}
            className="w-full gap-2"
          >
            {generating || extracting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {extracting ? '提取文本中…' : '生成中…'}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                根据简历生成自我介绍
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 口述稿展示区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 口述稿头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">面试自我介绍</h3>
              <p className="text-xs text-gray-400">约 5 分钟</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveIntro}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save size={16} />
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditContent(introScript);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit3 size={16} />
                编辑
              </button>
            )}
          </div>
        </div>

        {/* 口述稿内容 */}
        <div className="p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-96 p-4 text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none font-medium leading-relaxed"
              placeholder="在这里编辑您的面试自我介绍稿..."
            />
          ) : (
            <div
              className="prose prose-green max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-loose"
              onClick={() => setIsEditing(true)}
            >
              {introScript}
            </div>
          )}
        </div>

        {/* 提示 */}
        {!isEditing && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-sm text-gray-400 text-center">
              点击内容区域可编辑口述稿
            </p>
          </div>
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </motion.div>
  );
}
