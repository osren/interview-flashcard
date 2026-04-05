import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { FlashCard, ModuleType } from '@/types';
import { InterviewQuestion } from '@/types/interview';
import { exportCardsToMd, exportInterviewQuestionsToMd, importCardsFromMd, downloadMd, readFileAsText } from '@/utils/md';
import { useCardStore } from '@/store';
import { useInterviewStore } from '@/store/useInterviewStore';

interface ImportExportModalProps {
  cards?: FlashCard[];
  module?: ModuleType;
  chapterId?: string;
  title?: string;
  // 面经模块专用
  interviewQuestions?: InterviewQuestion[];
  companyId?: string;
  departmentId?: string;
  sessionId?: string;
}

interface ImportResult {
  success: boolean;
  count: number;
  message: string;
}

export function ImportExportModal({
  cards = [],
  module = 'custom',
  chapterId = '',
  title,
  interviewQuestions = [],
  companyId,
  departmentId,
  sessionId,
}: ImportExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addCustomCard } = useCardStore();
  const { addQuestion } = useInterviewStore();

  // 判断是否为面经模块
  const isInterview = interviewQuestions.length > 0;
  const displayCards = isInterview ? interviewQuestions : cards;

  const handleExport = () => {
    let md: string;
    let filename: string;

    if (isInterview) {
      md = exportInterviewQuestionsToMd(interviewQuestions, title);
      filename = `${title || '面经'}-${Date.now()}.md`;
    } else {
      md = exportCardsToMd(cards);
      filename = `${title || module}-${chapterId}-${Date.now()}.md`;
    }
    downloadMd(md, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const importedCards = importCardsFromMd(content, module, chapterId);

      if (importedCards.length === 0) {
        setImportResult({
          success: false,
          count: 0,
          message: '未找到有效的问答数据，请检查文件格式',
        });
        return;
      }

      if (isInterview && companyId && departmentId && sessionId) {
        // 面经模块：添加到对应的 session
        for (const card of importedCards) {
          if (!card.question.trim()) continue;
          addQuestion(companyId, departmentId, sessionId, card.question, card.answer);
        }
        setImportResult({
          success: true,
          count: importedCards.length,
          message: `成功导入 ${importedCards.length} 个问答到当前场次`,
        });
      } else {
        // 自定义卡片：添加到自定义卡片
        for (const card of importedCards) {
          if (!card.question.trim()) continue;

          addCustomCard({
            id: '',
            module,
            chapterId: chapterId || 'custom',
            question: card.question,
            answer: card.answer,
            tags: ['导入'],
            status: 'unvisited',
            category: title || chapterId,
          });
        }
        setImportResult({
          success: true,
          count: importedCards.length,
          message: `成功导入 ${importedCards.length} 个问答`,
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        count: 0,
        message: '文件读取失败',
      });
    }

    // 清空 input 值，允许重复选择同一文件
    e.target.value = '';
  };

  return (
    <>
      {/* 切换按钮 - 固定在左侧中间 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white shadow-lg border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="导入/导出"
      >
        <FileText size={20} className="text-gray-600" />
      </button>

      {/* 侧边栏 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* 侧边栏内容 */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 flex flex-col"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">导入/导出问答</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 内容区 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* 当前模块信息 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">当前模块</p>
                  <p className="font-medium text-gray-900">{title || chapterId}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    共 {displayCards.length} 个问答
                  </p>
                </div>

                {/* 导出区域 */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Download size={18} className="text-green-600" />
                    导出问答
                  </h3>
                  <p className="text-sm text-gray-500">
                    将当前模块的所有问答导出为 Markdown 格式，包含编号、问题和建议答案。
                  </p>
                  <button
                    onClick={handleExport}
                    disabled={displayCards.length === 0}
                    className="w-full py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    导出 Markdown
                  </button>
                </div>

                {/* 分割线 */}
                <div className="border-t border-gray-200" />

                {/* 导入区域 */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Upload size={18} className="text-blue-600" />
                    导入问答
                  </h3>
                  <p className="text-sm text-gray-500">
                    导入 Markdown 格式的问答文件。必须包含问题，答案可为空。
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 font-mono">
                    <p>## 1. 问题内容</p>
                    <p>## 答案</p>
                    <p>答案内容（可选）</p>
                  </div>
                  <button
                    onClick={handleImportClick}
                    className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    选择 Markdown 文件
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* 导入结果 */}
                {importResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      importResult.success
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {importResult.success ? (
                      <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{importResult.message}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
