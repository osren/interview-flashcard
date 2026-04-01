import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeStore, Resume } from '@/store/useResumeStore';
import { FileText, X, Upload, ChevronRight, Eye, Trash2, Plus } from 'lucide-react';

export function FloatingResumeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resumes, addResume, removeResume } = useResumeStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('请上传 PDF 文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      addResume({
        name: file.name.replace('.pdf', ''),
        data: base64,
        size: file.size,
      });
      setShowUpload(false);
    };
    reader.readAsDataURL(file);

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      {/* 悬浮按钮 - 固定在底部右侧 */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-20 z-40 w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <FileText size={22} className="text-white" />
        )}
      </motion.button>

      {/* 简历列表弹窗 - 移动端适配 */}
      <AnimatePresence>
        {isOpen && !previewResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-4 bottom-36 z-40 w-[calc(100vw-2rem)] max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden"
          >
            {/* 标题 */}
            <div className="px-4 py-3 border-b border-gray-100/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-900 text-sm">我的简历</span>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {resumes.length} 份
              </span>
            </div>

            {/* 简历列表 */}
            <div className="overflow-y-auto max-h-64">
              {resumes.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-3">
                    <FileText className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">暂无简历</p>
                  <p className="text-gray-400 text-xs mt-1">点击下方按钮上传</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => setPreviewResume(resume)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {resume.name}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            {resume.size && formatSize(resume.size)}
                            {resume.size && <span>·</span>}
                            {new Date(resume.uploadTime).toLocaleDateString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setPreviewResume(resume)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        title="预览"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => removeResume(resume.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 上传按钮 */}
            <div className="p-3 border-t border-gray-100">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload-mobile"
              />
              <label
                htmlFor="resume-upload-mobile"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <Plus size={18} />
                <span>上传 PDF 简历</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF 预览弹窗 - 全屏移动端 */}
      <AnimatePresence>
        {previewResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
          >
            {/* 顶部标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
              <button
                onClick={() => setPreviewResume(null)}
                className="flex items-center gap-2 text-white"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="text-sm font-medium">返回</span>
              </button>
              <h3 className="text-sm font-medium text-white truncate max-w-[200px]">
                {previewResume.name}
              </h3>
              <div className="w-12" /> {/* 占位保持居中 */}
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
        )}
      </AnimatePresence>
    </>
  );
}
