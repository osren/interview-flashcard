import { useState, useRef } from 'react';
import { useResumeStore, Resume } from '@/store/useResumeStore';
import { Upload, FileText, Trash2, X, Eye, Download, Clock, Sparkles } from 'lucide-react';
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
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* 顶部标题区域 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/60 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">简历管理</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的简历</h1>
          <p className="text-gray-500">上传、管理和预览您的 PDF 简历</p>
        </div>

        {/* 统计信息 */}
        {resumes.length > 0 && (
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{resumes.length}</div>
              <div className="text-sm text-gray-500">简历数量</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {(resumes.reduce((total, r) => {
                  // base64 编码: 3字节 -> 4字符, 去掉 padding = 号
                  const base64Length = r.data.length - r.data.split('=').length + 1;
                  const byteSize = base64Length * 0.75;
                  return total + byteSize;
                }, 0) / 1024 / 1024).toFixed(2)}MB
              </div>
              <div className="text-sm text-gray-500">总大小</div>
            </div>
          </div>
        )}

        {/* 上传区域 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative mb-10 group"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-10 text-center cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-blue-300"
          >
            {/* 渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-9 h-9 text-blue-600" />
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-1">点击上传 PDF 简历</p>
              <p className="text-gray-400 text-sm">拖拽文件到此处，或点击选择文件</p>
              <p className="text-gray-300 text-xs mt-2">支持 PDF 格式，单个文件最大 10MB，可多选</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </motion.div>

        {/* 简历列表 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            已上传简历
            <span className="text-sm font-normal text-gray-400">({resumes.length})</span>
          </h2>
        </div>

        {resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">暂无简历</p>
            <p className="text-gray-400 text-sm mt-1">上传您的第一份简历开始面试准备</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
                onClick={() => setPreviewResume(resume)}
              >
                {/* 顶部图标 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(resume.id, e)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* 简历信息 */}
                <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                  {resume.name}
                </h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Clock size={14} />
                  {formatDate(resume.uploadTime)}
                </div>

                {/* 底部操作按钮 */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewResume(resume);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={16} />
                    预览
                  </button>
                  <a
                    href={resume.data}
                    download={`${resume.name}.pdf`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Download size={16} />
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
    </div>
  );
}