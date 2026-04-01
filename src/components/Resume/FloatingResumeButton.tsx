import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeStore, Resume } from '@/store/useResumeStore';
import { FileText, X, Download, ChevronRight } from 'lucide-react';

export function FloatingResumeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const { resumes } = useResumeStore();

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed right-6 bottom-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed right-6 bottom-24 z-40 w-80 max-h-[60vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* 标题 */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="font-medium text-gray-900">我的简历</span>
              <span className="text-xs text-gray-400">{resumes.length} 份</span>
            </div>

            {/* 简历列表 */}
            <div className="overflow-y-auto max-h-72">
              {resumes.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">暂无简历</p>
                  <p className="text-gray-400 text-xs">前往简历页面上传</p>
                </div>
              ) : (
                <div className="p-2">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setPreviewResume(resume)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{resume.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(resume.uploadTime).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
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
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setPreviewResume(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 truncate">{previewResume.name}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewResume.data}
                    download={`${previewResume.name}.pdf`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="下载"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => setPreviewResume(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* PDF 预览 */}
              <div className="flex-1 overflow-hidden">
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
