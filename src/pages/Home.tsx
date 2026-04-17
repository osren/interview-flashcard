import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui';
import { useProgressStore, useCardStore } from '@/store';
import { coreCards } from '@/data/core';
import { projectChapters, projectCards } from '@/data/projects';
import { algorithmChapters, algorithmCards } from '@/data/algorithms';

const modules = [
  {
    path: '/core',
    icon: '📚',
    title: '前端基础核心考点',
    description: 'JavaScript/TypeScript/React/浏览器等核心知识',
    cardCount: coreCards.length,
    chapters: 10,
    color: 'from-blue-500 to-blue-600',
  },
  {
    path: '/projects',
    icon: '💼',
    title: '项目针对性复盘',
    description: '滴滴实习 + GResume 项目深度复盘',
    cardCount: projectCards.length,
    chapters: projectChapters.length,
    color: 'from-purple-500 to-purple-600',
  },
  {
    path: '/algorithms',
    icon: '💻',
    title: '刷题模块',
    description: '手撕代码/概念解释/场景设计',
    cardCount: algorithmCards.length,
    chapters: algorithmChapters.length,
    color: 'from-green-500 to-green-600',
  },
  {
    path: '/custom',
    icon: '✨',
    title: '自定义卡片',
    description: '添加你自己的面试问题和答案',
    cardCount: 0,
    chapters: 0,
    color: 'from-orange-500 to-orange-600',
    isCustom: true,
  },
];

export function Home() {
  const { totalMastered } = useProgressStore();
  const { customCards } = useCardStore();
  const totalCards = coreCards.length + projectCards.length + algorithmCards.length + customCards.length;
  const percentage = Math.round((totalMastered / totalCards) * 100) || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-medium text-text-primary mb-4"
            style={{ lineHeight: 1.1 }}
          >
            InterviewFlash
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted mb-8"
            style={{ lineHeight: 1.5 }}
          >
            前端面试备考记忆卡片系统
          </motion.p>

          {/* 总体进度 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-subtle p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-text-muted font-medium">学习进度</span>
              <span className="text-2xl font-semibold text-brand-600">{percentage}%</span>
            </div>
            <Progress value={percentage} size="lg" />
            <div className="mt-3 text-sm text-text-tertiary">
              已掌握 {totalMastered} / {totalCards} 张卡片
            </div>
          </motion.div>
        </div>
      </section>

      {/* 模块卡片 - MiniMax 大圆角卡片 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={module.path}
                  className="block bg-white rounded-xl shadow-subtle hover:shadow-elevated transition-all duration-300 overflow-hidden group"
                  style={{ borderRadius: '20px' }}
                >
                  <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                  <div className="p-6">
                    <div className="text-5xl mb-4">{module.icon}</div>
                    <h2 className="text-lg font-display font-medium text-text-primary mb-2 group-hover:text-brand-600 transition-colors">
                      {module.title}
                    </h2>
                    <p className="text-text-muted text-sm mb-4" style={{ lineHeight: 1.5 }}>
                      {module.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-text-tertiary">
                      {module.isCustom ? (
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-text-secondary">{customCards.length}</span>
                          张卡片
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-text-secondary">{module.chapters}</span>
                            个章节
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-text-secondary">{module.cardCount}</span>
                            张卡片
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-brand-600 font-medium text-sm">
                      {module.isCustom ? '管理卡片 →' : '开始学习 →'}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-semibold text-text-primary text-center mb-8">
            功能特点
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🔄', title: '卡片翻转', desc: '点击翻转查看答案' },
              { icon: '📊', title: '进度追踪', desc: '记录掌握程度' },
              { icon: '🔍', title: '智能筛选', desc: '按章节/难度筛选' },
              { icon: '⭐', title: '收藏重点', desc: '标记重点卡片' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-4 text-center shadow-subtle"
                style={{ borderRadius: '13px' }}
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="font-medium text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-tertiary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}