import { useNavigate } from 'react-router-dom';
import { aiProjects } from '@/data/ai';
import { ArrowRight, FileText, BarChart3, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIIndex() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 资讯</h1>
          <p className="text-gray-500">AI 行业动态、技术进展与知识卡片</p>
        </div>

        {/* 项目列表 */}
        <div className="grid gap-4">
          {aiProjects.map((project, index) => {
            const hasHtml = !!project.files.html;
            const hasXlsx = !!project.files.xlsx;
            const hasPdf = !!project.files.pdf;
            const cardCount = project.cards?.length || 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/ai/${project.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      {hasHtml && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                          <FileCode size={12} />
                          HTML
                        </span>
                      )}
                      {hasXlsx && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">
                          <BarChart3 size={12} />
                          图表
                        </span>
                      )}
                      {hasPdf && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">
                          <FileText size={12} />
                          PDF
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{cardCount} 个知识卡片</span>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 空状态 */}
        {aiProjects.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">暂无 AI 资讯</p>
            <p className="text-gray-400 text-sm mt-1">请在 docs/AI_Devlopments 目录添加内容</p>
          </div>
        )}
      </div>
    </div>
  );
}