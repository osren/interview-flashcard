import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCardStore } from '@/store';
import { projectChapters } from '@/data/projects';
import { PageShell, SectionHeader, Badge } from '@/components/ui';
import { useProjectStore } from '@/store/useProjectStore';
import { Plus, Edit2, Trash2, X, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';

const moduleInfo = {
  didi: {
    icon: '🚗',
    title: '滴滴企业版 - 商旅体验',
    topics: ['遗留系统重构', 'AI工程化转型', '弱网性能优化'],
  },
  gresume: {
    icon: '📝',
    title: 'GResume 智能简历平台',
    topics: ['CRDT文档冲突', 'IndexedDB离线', 'DeepSeek ATS评分'],
  },
};

interface ProjectCard {
  id: string;
  title: string;
  description: string;
  cardCount?: number;
  icon: string;
  topics: string[];
  isCustom?: boolean;
}

export function ProjectsIndex() {
  const navigate = useNavigate();
  const { lastVisitedProject } = useCardStore();
  const { customProjects, addProject, updateProject, deleteProject } = useProjectStore();

  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem('from_project_detail') === 'true';
    sessionStorage.removeItem('from_project_detail');

    if (shouldRedirect && lastVisitedProject) {
      navigate(`/projects/${lastVisitedProject}`, { replace: true });
    }
  }, [lastVisitedProject, navigate]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    icon: '📁',
    topics: '',
  });

  // 合并静态项目 + 自定义项目
  const staticProjects: ProjectCard[] = projectChapters.map((chapter) => ({
    id: chapter.id,
    title: moduleInfo[chapter.id as keyof typeof moduleInfo]?.title || chapter.title,
    description: chapter.description,
    cardCount: chapter.cardCount,
    icon: moduleInfo[chapter.id as keyof typeof moduleInfo]?.icon || '📁',
    topics: moduleInfo[chapter.id as keyof typeof moduleInfo]?.topics || [],
    isCustom: false,
  }));

  const allProjects: ProjectCard[] = [
    ...staticProjects,
    ...customProjects.map((p): ProjectCard => ({
      id: p.id,
      title: p.title,
      description: p.description,
      cardCount: 0,
      icon: p.icon,
      topics: p.topics,
      isCustom: true,
    })),
  ];

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    addProject({
      title: newProject.title,
      description: newProject.description,
      icon: newProject.icon,
      topics: newProject.topics.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setNewProject({ title: '', description: '', icon: '📁', topics: '' });
    setShowAddModal(false);
  };

  const handleStartEdit = (project: ProjectCard) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateProject(editingId, { title: editTitle });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      deleteProject(id);
    }
  };

  return (
    <PageShell>
      <SectionHeader
        icon={<Briefcase size={24} className="text-white" strokeWidth={2.5} />}
        title="项目针对性复盘"
        description="针对滴滴实习和 GResume 项目进行深度复盘"
      />

      <div className="grid gap-5">
          {allProjects.map((project, index) => {
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="surface-card overflow-hidden relative group">
                  <div className={`h-1 bg-gradient-to-r ${project.isCustom ? 'from-primary-400 to-primary-600' : 'from-orange-400 to-rose-500'}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{project.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {editingId === project.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-xl font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 outline-none focus:border-blue-400"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h2 className="text-xl font-display font-semibold text-ink">
                                {project.title}
                              </h2>
                              {project.isCustom && (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(project)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-ink-secondary text-sm mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.topics.map((topic) => (
                            <Badge key={topic} variant="primary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="default">
                            {project.cardCount ? `${project.cardCount} 张卡片` : '暂无卡片'}
                          </Badge>
                          {project.isCustom ? (
                            <span className="text-primary-600 font-medium text-sm">开始复盘 →</span>
                          ) : (
                            <span className="text-primary-600 font-medium text-sm">开始复盘 →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="absolute inset-0"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 新增项目按钮 */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 left-8 w-14 h-14 bg-primary-500 text-white rounded-full shadow-glow flex items-center justify-center hover:bg-primary-600 transition-colors z-40"
        >
          <Plus size={24} />
        </motion.button>

        {showAddModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="surface-panel w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-display font-semibold text-ink mb-4">新增项目</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">项目名称</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="input-field"
                    placeholder="输入项目名称"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">项目描述</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="input-field resize-none"
                    placeholder="输入项目描述"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">图标</label>
                  <input
                    type="text"
                    value={newProject.icon}
                    onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })}
                    className="input-field"
                    placeholder="输入 emoji 图标"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={newProject.topics}
                    onChange={(e) => setNewProject({ ...newProject, topics: e.target.value })}
                    className="input-field"
                    placeholder="React, TypeScript, 工程化"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>取消</Button>
                <Button onClick={handleAddProject} disabled={!newProject.title.trim()}>创建</Button>
              </div>
            </motion.div>
          </div>
        )}
    </PageShell>
  );
}