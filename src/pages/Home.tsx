import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui';
import { useProgressStore } from '@/store';
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
];

export function Home() {
  const { totalMastered } = useProgressStore();
  const totalCards = coreCards.length + projectCards.length + algorithmCards.length;
  const percentage = Math.round((totalMastered / totalCards) * 100) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20 md:pb-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4"
          >
            InterviewFlash
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8"
          >
            前端面试备考记忆卡片系统
          </motion.p>

          {/* 总体进度 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-6"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">学习进度</span>
              <span className="text-2xl font-bold text-primary-600">{percentage}%</span>
            </div>
            <Progress value={percentage} size="lg" />
            <div className="mt-3 text-sm text-gray-500">
              已掌握 {totalMastered} / {totalCards} 张卡片
            </div>
          </motion.div>
        </div>
      </section>

      {/* 模块卡片 */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={module.path}
                  className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  <div className={`h-1.5 md:h-2 bg-gradient-to-r ${module.color}`} />
                  <div className="p-5 md:p-6">
                    <div className="text-4xl md:text-5xl mb-3 md:mb-4">{module.icon}</div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {module.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">{module.chapters}</span>
                        个章节
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">{module.cardCount}</span>
                        张卡片
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-primary-600 font-medium text-sm">
                      开始学习 →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6 md:mb-8">
            功能特点
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: '🔄', title: '卡片翻转', desc: '点击翻转查看答案' },
              { icon: '📊', title: '进度追踪', desc: '记录掌握程度' },
              { icon: '🔍', title: '智能筛选', desc: '按章节/难度筛选' },
              { icon: '⭐', title: '收藏重点', desc: '标记重点卡片' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-3 md:p-4 text-center shadow-sm"
              >
                <div className="text-2xl md:text-3xl mb-1 md:mb-2">{feature.icon}</div>
                <h3 className="font-medium text-gray-900 text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
