import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectChapters } from '@/data/projects';
import { Badge } from '@/components/ui';
import { useCardStore } from '@/store';

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

export function ProjectsIndex() {
  const navigate = useNavigate();
  const { lastVisitedProject } = useCardStore();

  // 只有从其他模块主动点击"项目复盘"时才跳转，后退不跳转
  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem('from_project_detail') === 'true';
    sessionStorage.removeItem('from_project_detail');

    if (shouldRedirect && lastVisitedProject) {
      navigate(`/projects/${lastVisitedProject}`, { replace: true });
    }
  }, [lastVisitedProject, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💼 项目针对性复盘
          </h1>
          <p className="text-gray-600">
            针对滴滴实习和 GResume 项目进行深度复盘
          </p>
        </div>

        <div className="grid gap-6">
          {projectChapters.map((chapter, index) => {
            const info = moduleInfo[chapter.id as keyof typeof moduleInfo] || {
              icon: '📁',
              title: chapter.title,
              topics: [],
            };

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/projects/${chapter.id}`}
                  className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{info.icon}</div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {info.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4">
                          {chapter.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {info.topics.map((topic) => (
                            <Badge key={topic} variant="primary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="default">
                            {chapter.cardCount} 张卡片
                          </Badge>
                          <span className="text-purple-600 font-medium text-sm">
                            开始复盘 →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
