import { useCardStore } from '@/store';
import { coreCards } from '@/data/core';
import { projectChapters, projectCards } from '@/data/projects';
import { mpxCards, mpxChapters } from '@/data/mpx/mpx';
import { handbookGroups, handbookItems } from '@/data/llm-handbook';
import { isRemembered, resolveCardStatus } from '@/utils/cardStatus';
import { motion } from 'framer-motion';
import { Progress, ModuleTile } from '@/components/ui';
import { StreakCalendar } from '@/components/Streak';
import { Logo } from '@/components/Layout/Logo';
import { BookOpen, Rocket, Briefcase, Bot, Sparkles, FileJson } from 'lucide-react';

const modules = [
  {
    path: '/core',
    icon: <BookOpen size={28} strokeWidth={2.5} />,
    title: '前端基础核心考点',
    description: 'JavaScript / TypeScript / React / 浏览器等核心知识',
    cardCount: coreCards.length,
    chapters: 10,
  },
  {
    path: '/mpx',
    icon: <Rocket size={28} strokeWidth={2.5} />,
    title: 'MPX 专项',
    description: '滴滴小程序框架 MPX 语法、架构、工程化',
    cardCount: mpxCards.length,
    chapters: mpxChapters.length,
  },
  {
    path: '/projects',
    icon: <Briefcase size={28} strokeWidth={2.5} />,
    title: '项目针对性复盘',
    description: '滴滴实习 + AI 监控降噪 + GResume 项目深度复盘',
    cardCount: projectCards.length,
    chapters: projectChapters.length,
  },
  {
    path: '/llm-handbook',
    icon: <Bot size={28} strokeWidth={2.5} />,
    title: '大模型开发手册',
    description: 'RAG / Agent / LangChain 等飞书资源导航，一键复制密码',
    isHandbook: true,
    handbookCount: handbookItems.length,
    groupCount: handbookGroups.length,
  },
  {
    path: '/custom',
    icon: <Sparkles size={28} strokeWidth={2.5} />,
    title: '自定义卡片',
    description: '添加你自己的面试问题和答案',
    isCustom: true,
  },
  {
    path: '/rjsf',
    icon: <FileJson size={28} strokeWidth={2.5} />,
    title: 'RJSF 表单演示',
    description: 'JSON Schema + react-jsonschema-form + Ant Design',
    isDemo: true,
  },
];

const features = [
  { icon: '🔄', title: '卡片翻转', desc: '点击翻转，即时查看答案', color: '#58CC02' },
  { icon: '📊', title: '进度追踪', desc: '记录每张卡的记住状态', color: '#1CB0F6' },
  { icon: '🔍', title: '智能筛选', desc: '按章节 / 难度精准过滤', color: '#FFC800' },
  { icon: '⭐', title: '收藏重点', desc: '标记高频考点随时复习', color: '#CE82FF' },
];

export function Home() {
  const customCards = useCardStore((state) => state.customCards);
  const cardStatuses = useCardStore((state) => state.cardStatuses);
  const allCardIds = [
    ...coreCards,
    ...projectCards,
    ...mpxCards,
    ...customCards,
  ].map((card) => card.id);
  const totalCards = allCardIds.length;
  const totalRemembered = allCardIds.filter((id) =>
    isRemembered(resolveCardStatus(id, cardStatuses))
  ).length;
  const percentage = totalCards > 0 ? Math.round((totalRemembered / totalCards) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero - 多邻国风格 */}
      <section className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-6"
        >
          <Logo size={80} className="animate-float" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold text-[#3c3c3c] mb-4"
        >
          准备好面试了吗？
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg sm:text-xl text-[#777777] font-semibold max-w-md mx-auto mb-6"
        >
          翻转卡片，追踪进度，每天进步一点点
        </motion.p>
      </section>

      {/* 学习进度 + 打卡日历 */}
      <div className="grid md:grid-cols-2 gap-4 mb-10 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="surface-panel p-5 text-left h-full flex flex-col justify-center"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-extrabold text-[#3c3c3c]">学习进度</span>
            <span className="text-3xl font-extrabold text-[#58CC02]">{percentage}%</span>
          </div>
          <Progress value={percentage} size="md" />
          <p className="text-sm text-[#afafaf] font-bold mt-2">
            已记住 {totalRemembered} / {totalCards} 张卡片
          </p>
        </motion.div>

        <StreakCalendar />
      </div>

      {/* 学习路径 - 多邻国单元卡片 */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-5">
          学习路径
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module, index) => (
            <ModuleTile
              key={module.path}
              to={module.path}
              icon={module.icon}
              title={module.title}
              description={module.description}
              index={index}
              actionLabel={
                module.isCustom ? '管理卡片' :
                module.isDemo ? '查看演示' :
                module.isHandbook ? '查看手册' : '开始学习'
              }
              stats={
                module.isCustom ? (
                  <span>{customCards.length} 张自定义卡片</span>
                ) : module.isDemo ? (
                  <span>交互式 Demo</span>
                ) : module.isHandbook ? (
                  <span>{module.groupCount} 分类 · {module.handbookCount} 篇手册</span>
                ) : (
                  <span>{module.chapters} 章节 · {module.cardCount} 张卡片</span>
                )
              }
            />
          ))}
        </div>
      </section>

      {/* 功能介绍 */}
      <section className="pb-12">
        <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-5 text-center">
          核心功能
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="surface-card p-5 text-center"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl border-b-4"
                style={{ backgroundColor: `${feature.color}20`, borderBottomColor: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="font-extrabold text-[#3c3c3c] mb-1.5 text-base">{feature.title}</h3>
              <p className="text-sm text-[#777777] font-semibold">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
