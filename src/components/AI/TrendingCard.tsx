import { useState } from 'react';
import { Star, GitFork, ExternalLink, FileText, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingProject } from '@/data/ai/github-trending';

interface TrendingCardProps {
  project: TrendingProject;
  onShowReadme: (project: TrendingProject) => void;
  isExpanded: boolean;
  readmeSummary?: { workflow?: string; solveProblem?: string };
  onSaveSummary?: (projectId: string, summary: { workflow?: string; solveProblem?: string }) => void;
}

export function TrendingCard({ project, onShowReadme, isExpanded, readmeSummary, onSaveSummary }: TrendingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState(readmeSummary?.workflow || '');
  const [editSolveProblem, setEditSolveProblem] = useState(readmeSummary?.solveProblem || '');

  const languageColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    Ruby: '#701516',
    PHP: '#4F5D95',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* 项目名 */}
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-2"
          >
            <span className="truncate">{project.name}</span>
            <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
          </a>

          {/* 描述 */}
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{project.description}</p>

          {/* 元信息 */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {project.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: languageColors[project.language] || '#6b7280' }}
                />
                {project.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={14} />
              {project.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={14} />
              {project.forks.toLocaleString()}
            </span>
          </div>
        </div>

        {/* README按钮 */}
        <button
          onClick={() => onShowReadme(project)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
          title="查看README摘要"
        >
          <FileText size={18} />
        </button>
      </div>

      {/* README摘要展开 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-100 overflow-hidden"
          >
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    工作流
                  </span>
                  <textarea
                    value={editWorkflow}
                    onChange={(e) => setEditWorkflow(e.target.value)}
                    placeholder="输入工作流描述..."
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    解决的问题
                  </span>
                  <textarea
                    value={editSolveProblem}
                    onChange={(e) => setEditSolveProblem(e.target.value)}
                    placeholder="输入解决的问题描述..."
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onSaveSummary) {
                        onSaveSummary(project.id, {
                          workflow: editWorkflow || undefined,
                          solveProblem: editSolveProblem || undefined,
                        });
                      }
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <Save size={14} />
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditWorkflow(readmeSummary?.workflow || '');
                      setEditSolveProblem(readmeSummary?.solveProblem || '');
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <X size={14} />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">README 摘要</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 size={12} />
                    编辑
                  </button>
                </div>
                {readmeSummary?.workflow && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      工作流
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{readmeSummary.workflow}</p>
                  </div>
                )}
                {readmeSummary?.solveProblem && (
                  <div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      解决的问题
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{readmeSummary.solveProblem}</p>
                  </div>
                )}
                {!readmeSummary?.workflow && !readmeSummary?.solveProblem && (
                  <p className="text-sm text-gray-500 italic">暂无README摘要信息，点击编辑添加</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}