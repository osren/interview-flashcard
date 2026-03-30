import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { Badge } from '@/components/ui';
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { CardStatus, FlashCard, ModuleType } from '@/types';
import MDEditor from '@uiw/react-md-editor';

interface EditingCard {
  id?: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  module: ModuleType;
  chapterId: string;
}

const defaultCard: EditingCard = {
  question: '',
  answer: '',
  category: '自定义',
  difficulty: 'medium',
  module: 'core',
  chapterId: 'react',
};

// 可选的模块和章节
const moduleOptions: { module: ModuleType; label: string; chapters: { id: string; label: string }[] }[] = [
  {
    module: 'core',
    label: '前端基础核心考点',
    chapters: [
      { id: 'javascript', label: 'JavaScript 核心' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'react', label: 'React 核心原理' },
      { id: 'browser', label: '浏览器原理' },
      { id: 'network', label: '计算机网络' },
      { id: 'css', label: 'CSS 布局' },
    ],
  },
  {
    module: 'projects',
    label: '项目复盘',
    chapters: [
      { id: 'didi', label: '滴滴企业版' },
      { id: 'gresume', label: 'GResume 智能简历' },
    ],
  },
  {
    module: 'algorithms',
    label: '刷题模块',
    chapters: [
      { id: 'coding', label: '手撕代码' },
      { id: 'concept', label: '概念解释' },
      { id: 'scenario', label: '场景设计' },
    ],
  },
];

export function CustomCardsPage() {
  const navigate = useNavigate();
  const { customCards, addCustomCard, updateCustomCard, deleteCustomCard } = useCardStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<EditingCard>(defaultCard);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);

  // 练习模式状态
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, CardStatus>>({});

  useEffect(() => {
    // 合并自定义卡片
    const mergedCards = customCards.map((card) => ({
      ...card,
      status: cardStates[card.id] || card.status,
    }));
    setCards(mergedCards);
  }, [customCards, cardStates]);

  const handleSave = () => {
    if (!editingCard.question.trim() || !editingCard.answer.trim()) {
      alert('请填写问题和答案');
      return;
    }

    const card: FlashCard = {
      id: editingCard.id || '',
      module: editingCard.module,
      chapterId: editingCard.chapterId,
      question: editingCard.question,
      answer: editingCard.answer,
      category: editingCard.category,
      tags: ['自定义'],
      status: 'unvisited',
      difficulty: editingCard.difficulty,
    };

    if (editingCard.id) {
      updateCustomCard(editingCard.id, card);
    } else {
      addCustomCard(card);
    }

    setEditingCard(defaultCard);
    setIsEditing(false);
  };

  const handleEdit = (card: FlashCard) => {
    setEditingCard({
      id: card.id,
      question: card.question,
      answer: card.answer,
      category: card.category || '自定义',
      difficulty: (card.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
      module: card.module as ModuleType,
      chapterId: card.chapterId,
    });
    setIsEditing(true);
    setPracticeMode(false);
  };

  const handleDelete = (cardId: string) => {
    if (confirm('确定要删除这张卡片吗？')) {
      deleteCustomCard(cardId);
    }
  };

  const handleStatusChange = (status: CardStatus) => {
    const currentCard = cards[currentIndex];
    if (currentCard) {
      setCardStates((prev) => ({ ...prev, [currentCard.id]: status }));
      useCardStore.getState().updateCardStatus(currentCard.id, status);
      if (currentIndex < cards.length - 1) {
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentCard = cards[currentIndex];

  // 获取当前选中模块的章节选项
  const currentModuleOption = moduleOptions.find(m => m.module === editingCard.module);

  // 练习模式
  if (practiceMode && cards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-100 pb-20 md:pb-0">
        {/* 顶部导航 */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 safe-area-top">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPracticeMode(false)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>返回</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="text-xs">{currentIndex + 1} / {cards.length}</Badge>
              <Badge variant="default" className="text-xs">自定义卡片</Badge>
            </div>
          </div>
        </div>

        {/* 章节标题 */}
        <div className="pt-16 pb-2 text-center">
          <h1 className="text-lg font-bold text-gray-900">自定义卡片练习</h1>
        </div>

        {/* 桌面端 */}
        <div className="hidden md:flex items-center justify-center min-h-[calc(100vh-180px)] px-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex-shrink-0 w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 hover:scale-105 active:scale-95'}`}
          >
            <ChevronLeft size={28} className="text-gray-600" />
          </button>

          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-6 flex-shrink-0"
          >
            <FlashCardComponent
              card={currentCard}
              onStatusChange={handleStatusChange}
              currentIndex={currentIndex}
              totalCards={cards.length}
              showEdit={true}
            />
          </motion.div>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`flex-shrink-0 w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${currentIndex === cards.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 hover:scale-105 active:scale-95'}`}
          >
            <ChevronRight size={28} className="text-gray-600" />
          </button>
        </div>

        {/* 移动端 */}
        <div className="md:hidden flex flex-col items-center px-4 pt-2">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <FlashCardComponent
              card={currentCard}
              onStatusChange={handleStatusChange}
              currentIndex={currentIndex}
              totalCards={cards.length}
              showEdit={true}
            />
          </motion.div>

          <div className="flex items-center justify-center gap-8 mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-200 ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'bg-white shadow-md border border-gray-200 text-gray-700 active:scale-95'}`}
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">上一题</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-200 ${currentIndex === cards.length - 1 ? 'opacity-40 cursor-not-allowed' : 'bg-orange-500 shadow-md text-white active:scale-95'}`}
            >
              <span className="text-sm font-medium">下一题</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 移动端底部 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-t border-gray-200 safe-area-bottom">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white shadow-md border border-gray-200 text-gray-700 active:scale-95'}`}
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">上一题</span>
            </button>

            <span className="text-sm text-gray-500 font-medium">
              {currentIndex + 1} / {cards.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 ${currentIndex === cards.length - 1 ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-orange-500 shadow-md text-white active:scale-95'}`}
            >
              <span className="text-sm font-medium">下一题</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">自定义卡片</Badge>
            <Badge variant="default">{customCards.length} 张</Badge>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="pt-16 pb-20 px-4 max-w-4xl mx-auto">
        {/* 开始练习按钮 */}
        {!isEditing && customCards.length > 0 && (
          <button
            onClick={() => setPracticeMode(true)}
            className="w-full mt-4 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span className="text-lg font-medium">开始练习</span>
          </button>
        )}

        {/* 添加按钮 */}
        {!isEditing && (
          <button
            onClick={() => {
              setEditingCard(defaultCard);
              setIsEditing(true);
            }}
            className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>添加自定义卡片</span>
          </button>
        )}

        {/* 编辑表单 */}
        {isEditing && (
          <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">
                {editingCard.id ? '编辑卡片' : '添加新卡片'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCard(defaultCard);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* 问题输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                问题
              </label>
              <textarea
                value={editingCard.question}
                onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                placeholder="请输入面试问题..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={3}
              />
            </div>

            {/* 答案编辑器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                答案（支持 Markdown 和代码块）
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={editingCard.answer}
                  onChange={(value) => setEditingCard({ ...editingCard, answer: value || '' })}
                  height={300}
                  preview="edit"
                  enableScroll={true}
                />
              </div>
            </div>

            {/* 分类和难度 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <input
                  type="text"
                  value={editingCard.category}
                  onChange={(e) => setEditingCard({ ...editingCard, category: e.target.value })}
                  placeholder="如：React、Vue、性能优化..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  难度
                </label>
                <select
                  value={editingCard.difficulty}
                  onChange={(e) => setEditingCard({ ...editingCard, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            </div>

            {/* 模块和章节选择 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  添加到模块
                </label>
                <select
                  value={editingCard.module}
                  onChange={(e) => {
                    const module = e.target.value as ModuleType;
                    const moduleInfo = moduleOptions.find(m => m.module === module);
                    setEditingCard({
                      ...editingCard,
                      module,
                      chapterId: moduleInfo?.chapters[0]?.id || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {moduleOptions.map((option) => (
                    <option key={option.module} value={option.module}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  添加到章节
                </label>
                <select
                  value={editingCard.chapterId}
                  onChange={(e) => setEditingCard({ ...editingCard, chapterId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {currentModuleOption?.chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>保存卡片</span>
            </button>
          </div>
        )}

        {/* 卡片列表 */}
        <div className="mt-4 space-y-3">
          {customCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="text-xs">{card.category}</Badge>
                    {card.difficulty === 'easy' && <Badge variant="success" className="text-xs">简单</Badge>}
                    {card.difficulty === 'medium' && <Badge variant="warning" className="text-xs">中等</Badge>}
                    {card.difficulty === 'hard' && <Badge variant="danger" className="text-xs">困难</Badge>}
                    <Badge variant="outline" className="text-xs">{card.module}/{card.chapterId}</Badge>
                  </div>
                  <p className="text-gray-800 font-medium line-clamp-2">{card.question}</p>
                  <div className="mt-2 text-gray-500 text-sm line-clamp-3 prose prose-sm max-w-none" data-color-mode="light">
                    <MDEditor.Markdown source={card.answer.slice(0, 200) + (card.answer.length > 200 ? '...' : '')} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(card)}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {customCards.length === 0 && !isEditing && (
            <div className="text-center py-12 text-gray-400">
              <p>暂无自定义卡片</p>
              <p className="text-sm mt-1">点击上方按钮添加你的第一张卡片</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
