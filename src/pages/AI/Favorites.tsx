import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingCard } from '@/components/AI/TrendingCard';
import { TrendingProject } from '@/data/ai/github-trending';
import { getFavorites, removeFavorite, saveFavorite, FavoriteItem } from '@/utils/favorites';
import { ArrowLeft, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 加载收藏
  useEffect(() => {
    setFavorites(Object.values(getFavorites()));
  }, []);

  // 处理收藏切换（移除）
  const handleToggleFavorite = (project: TrendingProject) => {
    removeFavorite(project.id);
    setFavorites(Object.values(getFavorites()));
  };

  // 处理保存笔记
  const handleSaveSummary = (projectId: string, summary: { note?: string }) => {
    if (summary.note) {
      const current = favorites.find(f => f.id === projectId);
      if (current) {
        saveFavorite(current, summary.note);
      }
    }
    setFavorites(Object.values(getFavorites()));
  };

  // 处理展开/折叠
  const handleShowReadme = (project: TrendingProject) => {
    setExpandedId(expandedId === project.id ? null : project.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/ai')}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <Heart size={24} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">收藏夹</h1>
              <p className="text-sm text-gray-500">已收藏的项目和笔记</p>
            </div>
          </div>
        </div>

        {/* 收藏列表 */}
        {favorites.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="divide-y divide-gray-100"
          >
            {favorites.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TrendingCard
                  project={project}
                  onShowReadme={handleShowReadme}
                  isExpanded={expandedId === project.id}
                  readmeSummary={project.note ? { note: project.note } : undefined}
                  onSaveSummary={handleSaveSummary}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  showNote={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无收藏</p>
            <p className="text-sm text-gray-400 mt-1">
              在 Trending 页面点击心形图标添加收藏
            </p>
          </div>
        )}
      </div>
    </div>
  );
}