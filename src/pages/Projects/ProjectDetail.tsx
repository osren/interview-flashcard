import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { projectCards } from '@/data/projects';
import { Badge, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { CardStatus } from '@/types';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    cards,
    currentIndex,
    setCards,
    next,
    prev,
    updateCardStatus,
  } = useCardStore();

  useEffect(() => {
    const projectCardsList = projectCards.filter((c) => c.chapterId === projectId);
    setCards(projectCardsList);
  }, [projectId, setCards]);

  const currentCard = cards[currentIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  const handleStatusChange = (status: CardStatus) => {
    updateCardStatus(currentCard.id, status);
    if (currentIndex < cards.length - 1) {
      setTimeout(() => next(), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>返回</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600"
            >
              <Home size={18} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="primary">{currentIndex + 1} / {cards.length}</Badge>
            <Badge variant="default">{currentCard.category}</Badge>
          </div>
        </div>

        {/* 章节标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {projectId === 'didi' ? '🚗 滴滴企业版' : '📝 GResume'}
          </h1>
          <p className="text-gray-500">
            {currentCard.chapterId === 'didi' ? '实习深挖' : '技术攻坚'}
          </p>
        </div>

        {/* 卡片 */}
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
          />
        </motion.div>

        {/* 底部操作 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="secondary"
            onClick={prev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={18} className="mr-1" />
            上一题
          </Button>
          <Button
            variant="primary"
            onClick={next}
            disabled={currentIndex === cards.length - 1}
          >
            下一题
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
