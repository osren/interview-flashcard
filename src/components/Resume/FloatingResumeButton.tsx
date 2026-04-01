import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeStore, Resume } from '@/store/useResumeStore';
import { FileText, X, Download, ChevronRight, Sparkles } from 'lucide-react';

export function FloatingResumeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const { resumes } = useResumeStore();

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 bottom-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <FileText size={24} className="text-white" />
        )}
      </motion.button>

      {/* 简历列表弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-6 bottom-24 z-40 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden"
          >
            {/* 标题 */}
            <div className="px-4 py-3 border-b border-gray-100/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-900">我的简历</span>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {resumes.length} 份
              </span>
            </div>

            {/* 简历列表 */}
            <div className="overflow-y-auto max-h-80">
              {resumes.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-3">
                    <FileText className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">暂无简历</p>
                  <p className="text-gray-400 text-xs mt-1">前往简历页面上传</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setPreviewResume(resume)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 text-left group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                          {resume.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(resume.uploadTime).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF 预览弹窗 */}
      <AnimatePresence>
        {previewResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewResume(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{previewResume.name}</h3>
                    <p className="text-xs text-gray-400">PDF 文档</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewResume.data}
                    download={`${previewResume.name}.pdf`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Download size={16} />
                    下载
                  </a>
                  <button
                    onClick={() => setPreviewResume(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              {/* PDF 预览 */}
              <div className="flex-1 overflow-hidden bg-gray-100">
                <iframe
                  src={previewResume.data}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}