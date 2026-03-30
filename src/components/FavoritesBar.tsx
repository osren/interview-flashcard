import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronDown, BookOpen, Briefcase, Code } from 'lucide-react';
import { useCardStore } from '@/store';
import { FlashCard, ModuleType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { coreCards } from '@/data/core';
import { projectCards } from '@/data/projects';
import { algorithmCards } from '@/data/algorithms';

// 获取卡片在原始数据中的索引
const getCardIndex = (card: FlashCard): number => {
  let cards: FlashCard[];
  if (card.module === 'core') {
    cards = coreCards.filter((c) => c.chapterId === card.chapterId);
  } else if (card.module === 'projects') {
    cards = projectCards.filter((c) => c.chapterId === card.chapterId);
  } else {
    cards = algorithmCards.filter((c) => c.chapterId === card.chapterId);
  }
  return cards.findIndex((c) => c.id === card.id);
};

const moduleConfig: Record<ModuleType, { label: string; icon: typeof BookOpen; color: string }> = {
  core: { label: '核心考点', icon: BookOpen, color: 'bg-blue-500' },
  projects: { label: '项目复盘', icon: Briefcase, color: 'bg-purple-500' },
  algorithms: { label: '刷题', icon: Code, color: 'bg-green-500' },
};

export function FavoritesBar() {
  const { favorites, toggleFavorite } = useCardStore();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<ModuleType>>(new Set(['core', 'projects', 'algorithms']));

  // 按模块分组
  const groupedFavorites: Record<ModuleType, FlashCard[]> = {
    core: [],
    projects: [],
    algorithms: [],
  };

  favorites.forEach((card) => {
    if (groupedFavorites[card.module]) {
      groupedFavorites[card.module].push(card);
    }
  });

  const toggleModule = (module: ModuleType) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const handleCardClick = (card: FlashCard) => {
    const cardIndex = getCardIndex(card);
    // 跳转到对应模块的章节，携带卡片索引
    if (card.module === 'core') {
      navigate(`/core/${card.chapterId}?cardIndex=${cardIndex}`);
    } else if (card.module === 'projects') {
      navigate(`/projects/${card.chapterId}?cardIndex=${cardIndex}`);
    } else if (card.module === 'algorithms') {
      navigate(`/algorithms/${card.chapterId}?cardIndex=${cardIndex}`);
    }
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-500 fill-red-500" />
            <span className="text-sm font-medium text-gray-700">我的收藏</span>
            <span className="text-xs text-gray-400">({favorites.length})</span>
          </div>
        </div>

        {/* 分类展示 */}
        <div className="space-y-2">
          {(Object.keys(moduleConfig) as ModuleType[]).map((module) => {
            const cards = groupedFavorites[module];
            if (cards.length === 0) return null;

            const config = moduleConfig[module];
            const Icon = config.icon;
            const isExpanded = expandedModules.has(module);

            return (
              <div key={module} className="border border-gray-100 rounded-lg overflow-hidden">
                {/* 模块标题栏 */}
                <button
                  onClick={() => toggleModule(module)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full', config.color)} />
                    <Icon size={14} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    <span className="text-xs text-gray-400">({cards.length})</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-gray-400 transition-transform',
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {/* 卡片列表 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 flex flex-wrap gap-1.5">
                        {cards.map((card) => (
                          <div
                            key={card.id}
                            className="group relative flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full hover:border-red-300 hover:bg-red-50 transition-colors"
                          >
                            <button
                              onClick={() => handleCardClick(card)}
                              className="text-xs text-gray-600 hover:text-red-600 max-w-24 truncate"
                            >
                              {card.chapterId}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(card);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
