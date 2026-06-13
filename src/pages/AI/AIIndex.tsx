import { useNavigate } from 'react-router-dom';
import { aiProjects } from '@/data/ai';
import { ArrowRight, FileText, BarChart3, FileCode, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFavorites } from '@/utils/favorites';
import { PageShell, SectionHeader, Badge } from '@/components/ui';

export function AIIndex() {
  const navigate = useNavigate();
  const favoritesCount = Object.keys(getFavorites()).length;

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-4 mb-2">
        <SectionHeader
          icon={<Sparkles size={24} className="text-white" strokeWidth={2.5} />}
          title="AI 资讯"
          description="AI 行业动态、技术进展与知识卡片"
          className="mb-0 flex-1"
        />
        {favoritesCount > 0 && (
          <button
            onClick={() => navigate('/favorites')}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors flex-shrink-0 mt-2"
          >
            <Heart size={16} className="text-red-500 fill-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">收藏 ({favoritesCount})</span>
          </button>
        )}
      </div>

      <div className="grid gap-4 mt-6">
        {aiProjects.map((project, index) => {
          const hasHtml = !!project.files.html;
          const hasXlsx = !!project.files.xlsx;
          const hasPdf = !!project.files.pdf;
          const cardCount = project.cards?.length || 0;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => navigate(`/ai/${project.id}`)}
              className="surface-card p-6 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-display font-semibold text-ink group-hover:text-primary-600 transition-colors">
                      {project.name}
                    </h3>
                    {hasHtml && <Badge variant="primary"><FileCode size={10} className="mr-1" />HTML</Badge>}
                    {hasXlsx && <Badge variant="success"><BarChart3 size={10} className="mr-1" />图表</Badge>}
                    {hasPdf && <Badge variant="danger"><FileText size={10} className="mr-1" />PDF</Badge>}
                  </div>
                  <p className="text-ink-muted text-sm mb-3">{project.description}</p>
                  <span className="text-xs text-ink-muted">{cardCount} 个知识卡片</span>
                </div>
                <ArrowRight className="text-ink-muted group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" size={20} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {aiProjects.length === 0 && (
        <div className="text-center py-16 surface-panel mt-6">
          <p className="text-ink-secondary font-medium">暂无 AI 资讯</p>
          <p className="text-ink-muted text-sm mt-1">请在 docs/AI_Devlopments 目录添加内容</p>
        </div>
      )}
    </PageShell>
  );
}
