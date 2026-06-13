import { useState, useEffect } from 'react';
import { TrendingCard } from './TrendingCard';
import { TrendingProject } from '@/data/ai/github-trending';
import { fetchReadme, extractReadmeSummary } from '@/utils/github-api';
import { saveFavorite, removeFavorite, isFavorite as checkFavorite } from '@/utils/favorites';
import { motion } from 'framer-motion';

const SUMMARY_STORAGE_KEY = 'github-trending-summaries';

interface TrendingListProps {
  projects: TrendingProject[];
  period: 'weekly' | 'monthly';
  onPeriodChange: (period: 'weekly' | 'monthly') => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated?: string | null;
  error?: string | null;
}

// 获取保存的摘要
const getSavedSummaries = (): Record<string, { note?: string }> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(SUMMARY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// 保存摘要
const saveSummary = (projectId: string, summary: { note?: string }) => {
  if (typeof window === 'undefined') return;
  const all = getSavedSummaries();
  all[projectId] = summary;
  localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(all));
};

export function TrendingList({
  projects,
  period,
  onPeriodChange,
  onRefresh,
  isLoading,
  lastUpdated,
  error,
}: TrendingListProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [readmeNotes, setReadmeNotes] = useState<Record<string, string>>({});
  const [loadingReadmes, setLoadingReadmes] = useState<Record<string, boolean>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});

  // 初始化时加载保存的笔记
  useEffect(() => {
    const saved = getSavedSummaries();
    const notesMap: Record<string, string> = {};
    for (const [id, val] of Object.entries(saved)) {
      if (val.note) notesMap[id] = val.note;
    }
    setSavedNotes(notesMap);
  }, []);

  // 处理保存笔记
  const handleSaveSummary = (projectId: string, summary: { note?: string }) => {
    if (summary.note) {
      saveSummary(projectId, summary);
      setSavedNotes(prev => ({ ...prev, [projectId]: summary.note! }));
    }
  };

  // 获取合并后的笔记（用户保存的优先）
  const getMergedNote = (projectId: string): string | undefined => {
    const saved = savedNotes[projectId];
    if (saved) return saved;
    return readmeNotes[projectId];
  };

  // 处理收藏切换
  const handleToggleFavorite = (project: TrendingProject) => {
    if (checkFavorite(project.id)) {
      removeFavorite(project.id);
    } else {
      const note = getMergedNote(project.id);
      saveFavorite(project, note || '');
    }
  };

  const handleShowReadme = async (project: TrendingProject) => {
    if (expandedProject === project.id) {
      setExpandedProject(null);
      return;
    }

    setExpandedProject(project.id);

    // 如果还没有加载过README，则加载
    if (!readmeNotes[project.id] && !loadingReadmes[project.id]) {
      setLoadingReadmes(prev => ({ ...prev, [project.id]: true }));

      try {
        const readme = await fetchReadme(project.owner, project.repo);
        const summary = extractReadmeSummary(readme);
        setReadmeNotes(prev => ({
          ...prev,
          [project.id]: summary.workflow && summary.solveProblem
            ? `<p><strong>工作流：</strong>${summary.workflow}</p><p><strong>解决的问题：</strong>${summary.solveProblem}</p>`
            : summary.workflow || summary.solveProblem || '',
        }));
      } catch (err) {
        console.error('Failed to fetch readme:', err);
        setReadmeNotes(prev => ({
          ...prev,
          [project.id]: '',
        }));
      } finally {
        setLoadingReadmes(prev => ({ ...prev, [project.id]: false }));
      }
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Tab 切换 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onPeriodChange('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            每周
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            每月
          </button>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              更新于 {formatDate(lastUpdated)}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 项目列表 - 简洁列表风格 */}
      {error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-500">{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            点击刷新
          </button>
        </div>
      ) : isLoading && projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">暂无Trending数据</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            点击刷新
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TrendingCard
                project={project}
                onShowReadme={handleShowReadme}
                isExpanded={expandedProject === project.id}
                readmeSummary={getMergedNote(project.id) ? { note: getMergedNote(project.id) } : undefined}
                onSaveSummary={handleSaveSummary}
                isFavorite={checkFavorite(project.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
