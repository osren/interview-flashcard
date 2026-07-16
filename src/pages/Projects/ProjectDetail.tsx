import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { ImportExportModal } from '@/components/ImportExportModal';
import { ChapterLayout } from '@/components/Layout/ChapterLayout';
import { useCardStore } from '@/store';
import { projectCards } from '@/data/projects';
import { Button } from '@/components/ui';
import { ChevronLeft, Home, Plus, FileText } from 'lucide-react';
import { CardStatus, FlashCard } from '@/types';
import MDEditor from '@uiw/react-md-editor';
import { useProjectStore } from '@/store/useProjectStore';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjectStore();

  const customProject = projectId ? getProject(projectId) : undefined;
  const isCustomProject = !!customProject;

  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndexPicker, setShowIndexPicker] = useState(false);
  const indexPickerRef = useRef<HTMLDivElement>(null);
  const customCards = useCardStore((state) => state.customCards);
  const { updateCardStatus, getMergedCards, saveCardProgress, getCardProgress, addCustomCard } = useCardStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (indexPickerRef.current && !indexPickerRef.current.contains(event.target as Node)) {
        setShowIndexPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const reloadCards = () => {
    if (!projectId) return;
    const projectCardsList = projectCards.filter((c) => c.chapterId === projectId);
    const merged = getMergedCards('projects', projectId, projectCardsList);
    setCards(merged);
    const savedIndex = getCardProgress('projects', projectId);
    setCurrentIndex(merged.length > 0 ? Math.min(savedIndex, merged.length - 1) : 0);
  };

  useEffect(() => {
    reloadCards();
  }, [projectId, customCards]);

  useEffect(() => {
    if (cards.length > 0 && projectId) {
      saveCardProgress('projects', projectId, currentIndex);
    }
  }, [currentIndex, projectId, cards.length]);

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < cards.length) {
      setCurrentIndex(idx);
      setShowIndexPicker(false);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.question.trim() && projectId) {
      addCustomCard({
        id: '',
        module: 'projects',
        chapterId: projectId,
        question: newQuestion.question,
        answer: newQuestion.answer,
        tags: ['新增'],
        status: 'unvisited',
      });
      saveCardProgress('projects', projectId, cards.length);
      setNewQuestion({ question: '', answer: '' });
      setIsAdding(false);
    }
  };

  const currentCard = cards[currentIndex];

  const projectTitle = isCustomProject
    ? `${customProject.icon} ${customProject.title}`
    : projectId === 'didi'
      ? '🚗 滴滴企业版'
      : '📝 GResume';

  const exportTitle = isCustomProject
    ? customProject.title
    : projectId === 'didi'
      ? '滴滴企业版'
      : 'GResume 智能简历';

  const projectSubtitle = isCustomProject
    ? '自定义项目'
    : projectId === 'didi'
      ? '实习深挖'
      : '技术攻坚';

  if (projectId?.startsWith('custom-') && !customProject) {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-4">
        <p className="text-ink-muted">项目不存在或已被删除</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
        >
          返回项目列表
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: CardStatus) => {
    if (!currentCard) return;
    updateCardStatus(currentCard.id, status);
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  const addQuestionModal = (
    <AnimatePresence>
      {isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAdding(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            className="surface-panel w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-display font-semibold text-ink mb-4">新增问题</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1">问题</label>
                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="input-field"
                  placeholder="输入面试问题"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1">回答</label>
                <MDEditor
                  value={newQuestion.answer}
                  onChange={(val) => setNewQuestion({ ...newQuestion, answer: val || '' })}
                  height={200}
                  preview="edit"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => { setIsAdding(false); setNewQuestion({ question: '', answer: '' }); }}>
                取消
              </Button>
              <Button onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>
                保存
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (cards.length === 0) {
    return (
      <div className="min-h-screen app-bg flex flex-col">
        <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-sm border-b border-[#e5e5e5]">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1 px-2 py-1.5 text-sm font-bold text-[#1CB0F6] hover:bg-[#f7f7f7] rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
              返回
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-1.5 text-[#afafaf] hover:text-[#777777] hover:bg-[#f7f7f7] rounded-lg transition-colors"
            >
              <Home size={16} />
            </button>
            <h1 className="flex-1 text-center text-base font-extrabold text-[#3c3c3c] truncate">
              {projectTitle}
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <p className="text-ink-secondary text-lg mb-2">暂无问答卡片</p>
          <p className="text-ink-muted text-sm mb-8 text-center">
            点击下方「新增问题」手动添加，或点击左侧
            <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-white border border-[#e5e5e5] rounded">
              <FileText size={14} className="text-ink-muted" />
            </span>
            按钮导入 Markdown 问答
          </p>
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus size={18} />
            新增问题
          </Button>
        </div>

        {addQuestionModal}

        <ImportExportModal
          cards={cards}
          module="projects"
          chapterId={projectId || ''}
          title={exportTitle}
        />
      </div>
    );
  }

  return (
    <>
      <ChapterLayout
        backPath="/projects"
        chapterTitle={projectTitle}
        category={currentCard.category || projectSubtitle}
        currentIndex={currentIndex}
        totalCards={cards.length}
        showIndexPicker={showIndexPicker}
        setShowIndexPicker={setShowIndexPicker}
        indexPickerRef={indexPickerRef}
        onJumpTo={handleJumpTo}
        onPrev={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
        onNext={() => currentIndex < cards.length - 1 && setCurrentIndex((p) => p + 1)}
        canPrev={currentIndex > 0}
        canNext={currentIndex < cards.length - 1}
        footer={
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus size={18} />
            新增问题
          </Button>
        }
      >
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
            currentIndex={currentIndex}
            totalCards={cards.length}
            showEdit
          />
        </motion.div>
      </ChapterLayout>

      {addQuestionModal}

      <ImportExportModal
        cards={cards}
        module="projects"
        chapterId={projectId || ''}
        title={exportTitle}
      />
    </>
  );
}
