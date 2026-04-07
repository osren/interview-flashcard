import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { InterviewQuestion } from '@/types/interview';
import { useInterviewStore } from '@/store/useInterviewStore';

interface ImportExportModalProps {
  interviewQuestions?: InterviewQuestion[];
  companyId?: string;
  departmentId?: string;
  sessionId?: string;
  title?: string;
}

interface ImportResult {
  success: boolean;
  count: number;
  message: string;
}

export function ImportExportModal({
  interviewQuestions = [],
  companyId,
  departmentId,
  sessionId,
  title,
}: ImportExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { addQuestion } = useInterviewStore();

  // 判断是否为面经模块
  const isInterview = !!(companyId && departmentId && sessionId);

  const handleExport = () => {
    if (!isInterview || interviewQuestions.length === 0) return;

    // 导出为 Markdown 格式
    let mdContent = `# ${title}\n\n`;
    interviewQuestions.forEach((q, index) => {
      mdContent += `## ${index + 1}. ${q.question}\n\n`;
      mdContent += `${q.answer}\n\n---\n\n`;
    });

    // 创建下载
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'interview-questions'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isInterview) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // 简单的 Markdown 解析
        const questions = parseQuestionsFromMarkdown(content);

        if (questions.length > 0) {
          questions.forEach((q) => {
            if (companyId && departmentId && sessionId) {
              addQuestion(companyId, departmentId, sessionId, q.question, q.answer);
            }
          });
          setImportResult({
            success: true,
            count: questions.length,
            message: `成功导入 ${questions.length} 道题目`,
          });
        } else {
          setImportResult({
            success: false,
            count: 0,
            message: '未解析到有效题目',
          });
        }
      } catch (error) {
        setImportResult({
          success: false,
          count: 0,
          message: '文件解析失败',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 简单的 Markdown 解析
  const parseQuestionsFromMarkdown = (content: string) => {
    const questions: { question: string; answer: string }[] = [];
    const blocks = content.split(/^##\s+\d+\.\s+/m);

    blocks.forEach((block) => {
      if (!block.trim()) return;
      const lines = block.trim().split('\n');
      if (lines.length > 0) {
        const question = lines[0].trim();
        const answer = lines.slice(1).join('\n').trim();
        if (question) {
          questions.push({ question, answer });
        }
      }
    });

    return questions;
  };

  if (!isInterview) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-40 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        title="导入导出"
      >
        <Download size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setIsOpen(false);
              setImportResult(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">导入导出</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* 导出 */}
                <button
                  onClick={handleExport}
                  disabled={interviewQuestions.length === 0}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Download size={20} className="text-primary-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">导出 Markdown</div>
                    <div className="text-sm text-gray-500">
                      {interviewQuestions.length} 道题目
                    </div>
                  </div>
                </button>

                {/* 导入 */}
                <label className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Upload size={20} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">导入 Markdown</div>
                    <div className="text-sm text-gray-500">从文件导入题目</div>
                  </div>
                  <input
                    type="file"
                    accept=".md,.markdown,.txt"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>

                {/* 导入结果提示 */}
                {importResult && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      importResult.success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {importResult.success ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span className="text-sm">{importResult.message}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}