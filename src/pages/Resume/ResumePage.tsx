import { useState, useRef } from 'react';
import { useResumeStore, Resume } from '@/store/useResumeStore';
import { Upload, FileText, Trash2, X, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ResumePage() {
  const { resumes, addResume, removeResume } = useResumeStore();
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type !== 'application/pdf') {
        alert(`"${file.name}" 不是 PDF 文件`);
        return;
      }

      // 限制文件大小为 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" 超过 10MB 限制`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        addResume({
          name: file.name.replace('.pdf', ''),
          data: base64,
        });
      };
      reader.readAsDataURL(file);
    });

    // 清空 input 以便重复上传同名文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这份简历吗？')) {
      removeResume(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 pt-20 pb-8">
      {/* 顶部导航 */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">我的简历</h1>
        <p className="text-gray-500">上传和管理您的简历 PDF</p>
      </div>

      {/* 上传区域 */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Upload className="w-12 h-12 mx-auto text-blue-400 mb-3" />
          <p className="text-gray-600 font-medium">点击上传 PDF 简历</p>
          <p className="text-gray-400 text-sm mt-1">支持多选，单个文件最大 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 简历列表 */}
      <div className="max-w-4xl mx-auto px-4">
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无简历</p>
            <p className="text-gray-400 text-sm">上传您的第一份简历吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setPreviewResume(resume)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(resume.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 mb-1 truncate">{resume.name}</h3>
                <p className="text-xs text-gray-400">{formatDate(resume.uploadTime)}</p>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewResume(resume);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={14} />
                    查看
                  </button>
                  <a
                    href={resume.data}
                    download={`${resume.name}.pdf`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download size={14} />
                    下载
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
