import { useState, useMemo } from 'react';
import { Heart, ChevronLeft, ChevronRight, X, BookOpen, Briefcase, Code, Wand, Sparkles, MessageSquare } from 'lucide-react';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { ImportExportModal } from '@/components/ImportExportModal';
import { useCardStore } from '@/store';
import { useInterviewStore } from '@/store/useInterviewStore';
import { FlashCard, ModuleType } from '@/types';
import { Badge } from '@/components/ui';
import type { LucideIcon } from 'lucide-react';

const moduleConfig: Record<ModuleType, { label: string; icon: LucideIcon; color: string }> = {
  core: { label: '核心考点', icon: BookOpen, color: 'bg-blue-500' },
  projects: { label: '项目复盘', icon: Briefcase, color: 'bg-purple-500' },
  algorithms: { label: '刷题', icon: Code, color: 'bg-green-500' },
  custom: { label: '自定义', icon: Wand, color: 'bg-orange-500' },
  ai: { label: 'AI资讯', icon: Sparkles, color: 'bg-pink-500' },
  interview: { label: '面经', icon: MessageSquare, color: 'bg-cyan-500' },
};

interface ChapterGroup {
  chapterId: string;
  module: ModuleType;
  cards: FlashCard[];
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Favorites() {
  const { favorites } = useCardStore();
  const { favoriteQuestions, toggleFavorite: toggleInterviewFavorite } = useInterviewStore();
  const [selectedGroup, setSelectedGroup] = useState<ChapterGroup | null>(null);
  const [selectedInterviewIndex, setSelectedInterviewIndex] = useState<number | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // 将面经收藏转换为 FlashCard 格式
  const interviewFavorites: FlashCard[] = useMemo(() => {
    return favoriteQuestions.map((q) => ({
      id: q.id,
      module: 'interview' as ModuleType,
      chapterId: '面经收藏',
      question: q.question,
      answer: q.answer,
      tags: [],
      status: 'unvisited' as const,
    }));
  }, [favoriteQuestions]);

  // 合并所有收藏
  const allFavorites = useMemo(() => {
    return [...favorites, ...interviewFavorites];
  }, [favorites, interviewFavorites]);

  // 按模块和章节分组（排除面经）
  const groupedFavorites = useMemo(() => {
    const groups: Record<string, ChapterGroup> = {};

    favorites.forEach((card) => {
      const key = `${card.module}-${card.chapterId}`;
      if (!groups[key]) {
        groups[key] = {
          chapterId: card.chapterId,
          module: card.module,
          cards: [],
        };
      }
      groups[key].cards.push(card);
    });

    return Object.values(groups);
  }, [favorites]);

  // 桌面端按模块分组
  const groupedByModule = useMemo(() => {
    const groups: Record<ModuleType, ChapterGroup[]> = {
      core: [],
      projects: [],
      algorithms: [],
      custom: [],
      ai: [],
      interview: [],
    };

    groupedFavorites.forEach((group) => {
      if (groups[group.module]) {
        groups[group.module].push(group);
      }
    });

    return groups;
  }, [groupedFavorites]);

  const handleGroupClick = (group: ChapterGroup) => {
    setSelectedGroup(group);
    setCurrentCardIndex(0);
  };

  const handleBack = () => {
    setSelectedGroup(null);
    setCurrentCardIndex(0);
  };

  const handleCardChange = (newIndex: number) => {
    if (selectedGroup) {
      const clampedIndex = Math.max(0, Math.min(newIndex, selectedGroup.cards.length - 1));
      setCurrentCardIndex(clampedIndex);
    }
  };

  const handleStatusChange = (status: 'unvisited' | 'forgotten' | 'fuzzy' | 'mastered') => {
    if (selectedGroup) {
      const card = selectedGroup.cards[currentCardIndex];
      const { updateCardStatus } = useCardStore.getState();
      updateCardStatus(card.id, status);

      if (currentCardIndex < selectedGroup.cards.length - 1) {
        setTimeout(() => {
          handleCardChange(currentCardIndex + 1);
        }, 300);
      }
    }
  };

  const handleRemoveFavorite = () => {
    if (selectedGroup) {
      const card = selectedGroup.cards[currentCardIndex];
      const { toggleFavorite } = useCardStore.getState();
      toggleFavorite(card);

      if (selectedGroup.cards.length <= 1) {
        handleBack();
      } else {
        if (currentCardIndex >= selectedGroup.cards.length - 1) {
          setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
        }
      }
    }
  };

  // 计算导入导出用的卡片
  const modalCards = selectedGroup ? selectedGroup.cards : allFavorites;
  const modalModule = selectedGroup?.module || 'custom';
  const modalChapterId = selectedGroup?.chapterId || 'favorites';

  // 空状态判断
  if (allFavorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-20">
        <Heart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-600 mb-2">暂无收藏</h2>
        <p className="text-gray-400 text-sm">点击卡片上的红心即可收藏</p>
      </div>
    );
  }

  // 显示面经卡片详情
  if (selectedInterviewIndex !== null) {
    const currentCard = interviewFavorites[selectedInterviewIndex];
    const handleInterviewStatusChange = (_status: 'unvisited' | 'forgotten' | 'fuzzy' | 'mastered') => {
      if (selectedInterviewIndex < interviewFavorites.length - 1) {
        setTimeout(() => {
          setSelectedInterviewIndex((prev) => Math.min(interviewFavorites.length - 1, (prev ?? 0) + 1));
        }, 300);
      }
    };

    const handleInterviewRemove = () => {
      const question = favoriteQuestions[selectedInterviewIndex];
      toggleInterviewFavorite(question);
      if (interviewFavorites.length <= 1) {
        setSelectedInterviewIndex(null);
        setCurrentCardIndex(0);
      } else {
        if (selectedInterviewIndex >= interviewFavorites.length - 1) {
          setSelectedInterviewIndex(Math.max(0, selectedInterviewIndex - 1));
        }
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 safe-area-top">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedInterviewIndex(null)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft size={20} />
                <span className="text-sm">返回</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-sm font-medium text-gray-700">面经收藏</span>
                <span className="text-xs text-gray-400">
                  {selectedInterviewIndex + 1}/{interviewFavorites.length}
                </span>
              </div>
              <button
                onClick={handleInterviewRemove}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <X size={18} />
                <span className="text-sm">取消</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center px-4 pt-4">
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleInterviewStatusChange}
            currentIndex={selectedInterviewIndex}
            totalCards={interviewFavorites.length}
          />
        </div>
        <div className="flex items-center justify-center gap-8 mt-4">
          <button
            onClick={() => setSelectedInterviewIndex(Math.max(0, selectedInterviewIndex - 1))}
            disabled={selectedInterviewIndex === 0}
            className={cn(
              'p-3 rounded-full transition-colors',
              selectedInterviewIndex === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setSelectedInterviewIndex(Math.min(interviewFavorites.length - 1, selectedInterviewIndex + 1))}
            disabled={selectedInterviewIndex === interviewFavorites.length - 1}
            className={cn(
              'p-3 rounded-full transition-colors',
              selectedInterviewIndex === interviewFavorites.length - 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  // 显示卡片详情
  if (selectedGroup) {
    const currentCard = selectedGroup.cards[currentCardIndex];
    const moduleInfo = moduleConfig[selectedGroup.module];

    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 safe-area-top">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft size={20} />
                <span className="text-sm">返回</span>
              </button>
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', moduleInfo.color)} />
                <span className="text-sm font-medium text-gray-700">{selectedGroup.chapterId}</span>
                <span className="text-xs text-gray-400">
                  {currentCardIndex + 1}/{selectedGroup.cards.length}
                </span>
              </div>
              <button
                onClick={handleRemoveFavorite}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <X size={18} />
                <span className="text-sm">取消</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center px-4 pt-4">
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
            currentIndex={currentCardIndex}
            totalCards={selectedGroup.cards.length}
          />
        </div>

        <div className="flex items-center justify-center gap-8 mt-4">
          <button
            onClick={() => handleCardChange(currentCardIndex - 1)}
            disabled={currentCardIndex === 0}
            className={cn(
              'p-3 rounded-full transition-colors',
              currentCardIndex === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => handleCardChange(currentCardIndex + 1)}
            disabled={currentCardIndex === selectedGroup.cards.length - 1}
            className={cn(
              'p-3 rounded-full transition-colors',
              currentCardIndex === selectedGroup.cards.length - 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  // 显示分组列表
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart size={24} className="text-red-500 fill-red-500" />
          <h1 className="text-xl font-bold text-gray-900">我的收藏</h1>
          <Badge variant="secondary">{allFavorites.length}</Badge>
        </div>

        {/* 面经收藏（如果有） */}
        {interviewFavorites.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700">面经收藏</h2>
              <span className="text-sm text-gray-400">({interviewFavorites.length}道)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedInterviewIndex(0)}
                className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="font-medium text-gray-800">面经收藏</span>
                </div>
                <span className="text-sm text-gray-400">{interviewFavorites.length}道</span>
              </button>
            </div>
          </div>
        )}

        {/* 移动端：按章节分组 */}
        <div className="md:hidden space-y-4">
          {groupedFavorites.map((group) => {
            const moduleInfo = moduleConfig[group.module];
            const Icon = moduleInfo.icon;

            return (
              <div
                key={`${group.module}-${group.chapterId}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => handleGroupClick(group)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-2 rounded-full', moduleInfo.color)} />
                    <Icon size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-800">{group.chapterId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{group.cards.length}张</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* 桌面端：按模块分组 */}
        <div className="hidden md:block space-y-6">
          {(Object.keys(moduleConfig) as ModuleType[]).map((module) => {
            if (module === 'interview') return null; // 面经已单独展示
            const groups = groupedByModule[module];
            if (groups.length === 0) return null;

            const moduleInfo = moduleConfig[module];
            const Icon = moduleInfo.icon;

            return (
              <div key={module}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-700">{moduleInfo.label}</h2>
                  <span className="text-sm text-gray-400">
                    ({groups.reduce((acc, g) => acc + g.cards.length, 0)}张)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {groups.map((group) => (
                    <button
                      key={`${group.module}-${group.chapterId}`}
                      onClick={() => handleGroupClick(group)}
                      className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', moduleInfo.color)} />
                        <span className="font-medium text-gray-800">{group.chapterId}</span>
                      </div>
                      <span className="text-sm text-gray-400">{group.cards.length}张</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ImportExportModal
        cards={modalCards}
        module={modalModule}
        chapterId={modalChapterId}
        title="我的收藏"
      />
    </div>
  );
}