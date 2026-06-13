import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCardStore } from '@/store';
import { algorithmCards } from '@/data/algorithms';
import { PageShell, SectionHeader, Badge } from '@/components/ui';
import { Code2 } from 'lucide-react';

const categories = [
  { id: 'coding', label: '手撕代码', icon: '💻', color: 'from-emerald-400 to-teal-600' },
  { id: 'concept', label: '概念解释', icon: '📖', color: 'from-primary-400 to-primary-600' },
  { id: 'scenario', label: '场景设计', icon: '🎯', color: 'from-orange-400 to-rose-500' },
];

export function AlgorithmsIndex() {
  const navigate = useNavigate();
  const { lastVisitedAlgorithm } = useCardStore();

  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem('from_algorithm_detail') === 'true';
    sessionStorage.removeItem('from_algorithm_detail');

    if (shouldRedirect && lastVisitedAlgorithm) {
      navigate(`/algorithms/${lastVisitedAlgorithm}`, { replace: true });
    }
  }, [lastVisitedAlgorithm, navigate]);

  return (
    <PageShell maxWidth="lg">
      <SectionHeader
        icon={<Code2 size={24} className="text-white" strokeWidth={2.5} />}
        title="刷题模块"
        description="手撕代码 / 概念解释 / 场景设计"
      />

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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link to={`/algorithms/${cat.id}`} className="block group">
                <div className="surface-card overflow-hidden h-full">
                  <div className={`h-1 bg-gradient-to-r ${cat.color}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                      <Badge variant="outline">{chapterCards.length} 题</Badge>
                    </div>
                    <h2 className="text-lg font-display font-semibold text-ink group-hover:text-primary-600 transition-colors mb-1">
                      {cat.label}
                    </h2>
                    <p className="text-sm text-ink-muted mb-3">{percentage}% 已掌握</p>
                    <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="surface-panel p-6">
        <h2 className="text-lg font-display font-semibold text-ink mb-4">题目预览</h2>
        <div className="space-y-2">
          {algorithmCards.slice(0, 5).map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-3 bg-surface-muted rounded-xl hover:bg-surface-border/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl flex-shrink-0">
                  {card.category === '手撕代码' && '💻'}
                  {card.category === '概念解释' && '📖'}
                  {card.category === '场景设计' && '🎯'}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">
                    {card.question.split('\n')[0]}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {card.tags.slice(0, 2).join(' / ')}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  card.status === 'mastered' ? 'success' :
                  card.status === 'fuzzy' ? 'warning' : 'default'
                }
              >
                {card.status === 'mastered' ? '已掌握' :
                 card.status === 'fuzzy' ? '模糊' : '未开始'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
