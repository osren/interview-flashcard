import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { coreChapters } from '@/data/core';
import { Badge, Progress } from '@/components/ui';
import { useCardStore } from '@/store';

export function CoreIndex() {
  const navigate = useNavigate();
  const { lastVisitedCoreChapter } = useCardStore();

  // 只有从其他模块主动点击"核心考点"时才跳转，后退不跳转
  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem('from_core_detail') === 'true';
    sessionStorage.removeItem('from_core_detail');

    if (shouldRedirect && lastVisitedCoreChapter) {
      navigate(`/core/${lastVisitedCoreChapter}`, { replace: true });
    }
  }, [lastVisitedCoreChapter, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 前端基础核心考点
          </h1>
          <p className="text-gray-600">
            涵盖 JavaScript、TypeScript、React、浏览器等核心知识
          </p>
        </div>

        <div className="grid gap-4">
          {coreChapters.map((chapter, index) => {
            // 模拟进度（实际应从 store 读取）
            const mastered = Math.floor(Math.random() * chapter.cardCount);
            const percentage = Math.round((mastered / chapter.cardCount) * 100);

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/core/${chapter.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{chapter.icon}</div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                          {chapter.title}
                        </h2>
                        <p className="text-sm text-gray-500 mb-3">
                          {chapter.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge variant="primary">{chapter.cardCount} 张卡片</Badge>
                          <Badge
                            variant={percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'default'}
                          >
                            已掌握 {mastered} 张
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-primary-600 font-medium text-sm">
                      开始 →
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={percentage} size="sm" />
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
