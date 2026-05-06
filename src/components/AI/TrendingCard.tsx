import { useState, useRef } from 'react';
import { Star, GitFork, ExternalLink, FileText, Edit2, Save, X, Bold, Italic, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingProject } from '@/data/ai/github-trending';

interface TrendingCardProps {
  project: TrendingProject;
  onShowReadme: (project: TrendingProject) => void;
  isExpanded: boolean;
  readmeSummary?: { note?: string };
  onSaveSummary?: (projectId: string, summary: { note?: string }) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (project: TrendingProject) => void;
  showNote?: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
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

export function TrendingCard({
  project,
  onShowReadme,
  isExpanded,
  readmeSummary,
  onSaveSummary,
  isFavorite: initialIsFavorite,
  onToggleFavorite,
  showNote,
}: TrendingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [isNoteExpanded, setIsNoteExpanded] = useState(showNote || false);
  const editorRef = useRef<HTMLDivElement>(null);

  // 当 showNote 为 true 时使用独立状态控制
  const shouldShowNote = showNote ? isNoteExpanded : isExpanded;

  // showNote 模式下切换折叠状态
  const handleToggleNote = () => {
    if (showNote) {
      setIsNoteExpanded(!isNoteExpanded);
    } else {
      onShowReadme(project);
    }
  };

  const handleEdit = () => {
    setEditNote(readmeSummary?.note || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSaveSummary && editorRef.current) {
      const note = editorRef.current.innerHTML || undefined;
      onSaveSummary(project.id, { note });
      // 自动收藏
      if (note && onToggleFavorite && !isFavorite) {
        onToggleFavorite(project);
        setIsFavorite(true);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleFavoriteToggle = () => {
    if (onToggleFavorite) {
      onToggleFavorite(project);
      setIsFavorite(!isFavorite);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      {/* 主卡片 - 简洁列表风格 */}
      <div className="relative flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        {/* 项目信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-gray-900 hover:text-blue-600 truncate"
            >
              {project.name}
            </a>
            <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
          </div>

          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{project.description}</p>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {project.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: LANGUAGE_COLORS[project.language] || '#6b7280' }}
                />
                <span>{project.language}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={14} />
              <span>{project.stars.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={14} />
              <span>{project.forks.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 收藏按钮 */}
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title={isFavorite ? '取消收藏' : '添加收藏'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {/* README 按钮 */}
          <button
            type="button"
            onClick={handleToggleNote}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={showNote ? (isNoteExpanded ? '折叠笔记' : '展开笔记') : '查看README摘要'}
          >
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* README 摘要展开区域 */}
      <AnimatePresence>
        {shouldShowNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pb-3 overflow-hidden"
          >
            <div className="pl-3 pr-3 pt-2 border-l-2 border-gray-200 ml-4">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => execCommand('bold')}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="粗体"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand('italic')}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="斜体"
                    >
                      <Italic size={14} />
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[80px] p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 overflow-auto bg-white"
                    dangerouslySetInnerHTML={{ __html: editNote }}
                    onBlur={(e) => setEditNote(e.currentTarget.innerHTML)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      <Save size={14} />
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      <X size={14} />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">笔记</span>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                    >
                      <Edit2 size={12} />
                      编辑
                    </button>
                  </div>
                  {readmeSummary?.note ? (
                    <div
                      className="text-sm text-gray-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: readmeSummary.note }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 italic">暂无笔记</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
