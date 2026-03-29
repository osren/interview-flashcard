import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { algorithmCards } from '@/data/algorithms';
import { Badge } from '@/components/ui';

export function AlgorithmsIndex() {
  const categories = [
    { id: 'coding', label: '手撕代码', icon: '💻', color: 'from-green-500 to-green-600' },
    { id: 'concept', label: '概念解释', icon: '📖', color: 'from-blue-500 to-blue-600' },
    { id: 'scenario', label: '场景设计', icon: '🎯', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💻 刷题模块
          </h1>
          <p className="text-gray-600">
            手撕代码 / 概念解释 / 场景设计
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {categories.map((cat, index) => {
            const chapterCards = algorithmCards.filter((c) => c.chapterId === cat.id);
            const mastered = chapterCards.filter((c) => c.status === 'mastered').length;
            const percentage = chapterCards.length > 0
              ? Math.round((mastered / chapterCards.length) * 100)
              : 0;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/algorithms/${cat.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className={`h-1 bg-gradient-to-r ${cat.color}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">{cat.icon}</div>
                      <Badge variant="default">{chapterCards.length} 题</Badge>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {cat.label}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {percentage}% 已掌握
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* 题目列表预览 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">题目预览</h2>
          <div className="space-y-3">
            {algorithmCards.slice(0, 5).map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {card.category === '手撕代码' && '💻'}
                    {card.category === '概念解释' && '📖'}
                    {card.category === '场景设计' && '🎯'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {card.question.split('\n')[0]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {card.tags.slice(0, 2).join(' / ')}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    card.status === 'mastered' ? 'success' :
                    card.status === 'fuzzy' ? 'warning' :
                    'default'
                  }
                >
                  {card.status === 'mastered' ? '已掌握' :
                   card.status === 'fuzzy' ? '模糊' :
                   '未开始'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
