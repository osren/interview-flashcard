import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Home, Layers, Plus } from 'lucide-react';
import type { FlashCard } from '@/types';
import { StudyReader } from '@/components/StudyReader';
import { Button } from '@/components/ui';
import { LazyMDEditor, LazyMDMarkdown } from '@/components/ui/LazyMDEditor';
import { useCardStore } from '@/store';
import { useCardStoreHydrated } from '@/hooks/useCardStoreHydrated';
import { useProjectStore } from '@/store/useProjectStore';
import { loadProjectCards } from '@/data/projects';
import { projectBackgrounds } from '@/data/projects/project-backgrounds';

const STATIC_PROJECT_META: Record<string, { title: string; exportTitle: string; subtitle: string }> = {
  interviewflash: { title: '⚡ InterviewFlash', exportTitle: 'InterviewFlash 秋招备战平台', subtitle: '一体化备战复盘' },
  didi: { title: '🚗 滴滴企业版', exportTitle: '滴滴企业版', subtitle: '实习深挖' },
  'didi-performance': { title: '⚡ 商旅性能监控与体验优化', exportTitle: '商旅 H5 / 小程序性能监控与体验优化', subtitle: '性能监控与体验优化' },
  'didi-interview-guide': { title: '📋 滴滴实习项目简历备战指南', exportTitle: '滴滴实习项目简历备战指南', subtitle: '项目问答与复习' },
  'comprehensive-interview': { title: '🗣️ 综合面试题与参考回答', exportTitle: '综合面试题与参考回答', subtitle: '前端与 AI 面试题' },
  'ai-monitor': { title: '📡 AI 监控降噪工具', exportTitle: 'AI 监控降噪工具', subtitle: '告警智能判定' },
  gresume: { title: '📝 GResume', exportTitle: 'GResume 智能简历', subtitle: '技术攻坚' },
};

export function ProjectDetail() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const customProject = useProjectStore((state) => state.getProject(projectId));
  const customCards = useCardStore((state) => state.customCards);
  const getMergedCards = useCardStore((state) => state.getMergedCards);
  const addCustomCard = useCardStore((state) => state.addCustomCard);
  const hydrated = useCardStoreHydrated();

  const [cards, setCards] = useState<FlashCard[]>([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [activeView, setActiveView] = useState<'questions' | 'background'>('questions');
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });

  useEffect(() => {
    if (!hydrated || !projectId) return;
    let cancelled = false;
    void loadProjectCards(projectId).then((projectCards) => {
      if (cancelled) return;
      setCards(getMergedCards('projects', projectId, projectCards));
      setCardsLoaded(true);
    });
    return () => { cancelled = true; };
  }, [customCards, getMergedCards, hydrated, projectId]);

  const meta = STATIC_PROJECT_META[projectId];
  const projectTitle = customProject ? `${customProject.icon} ${customProject.title}` : meta?.title ?? '项目复盘';
  const exportTitle = customProject?.title ?? meta?.exportTitle ?? '项目复盘';
  const projectSubtitle = customProject ? '自定义项目' : meta?.subtitle ?? '技术攻坚';
  const backgroundMarkdown = projectBackgrounds[projectId];
  const readingButtonLabel = projectId === 'comprehensive-interview' ? '原文阅读' : '背景阅读';

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) return;
    addCustomCard({
      id: '',
      module: 'projects',
      chapterId: projectId,
      question: newQuestion.question.trim(),
      answer: newQuestion.answer,
      tags: ['新增'],
      status: 'unvisited',
      category: projectSubtitle,
    });
    setNewQuestion({ question: '', answer: '' });
    setIsAdding(false);
  };

  if (projectId.startsWith('custom-') && !customProject) {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-4">
        <p className="text-ink-muted">项目不存在或已被删除</p>
        <button onClick={() => navigate('/projects')} className="rounded-xl px-4 py-2 text-primary-600 hover:bg-primary-50">返回项目列表</button>
      </div>
    );
  }

  const addQuestionModal = (
    <AnimatePresence>
      {isAdding && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsAdding(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
            className="surface-panel w-full max-w-lg p-6" onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-display font-semibold text-ink">新增问题</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink-secondary">
                问题
                <input value={newQuestion.question} onChange={(event) => setNewQuestion({ ...newQuestion, question: event.target.value })} className="input-field mt-1" placeholder="输入面试问题" autoFocus />
              </label>
              <label className="block text-sm font-medium text-ink-secondary">
                回答
                <LazyMDEditor value={newQuestion.answer} onChange={(value) => setNewQuestion({ ...newQuestion, answer: value || '' })} height={220} preview="edit" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setIsAdding(false); setNewQuestion({ question: '', answer: '' }); }}>取消</Button>
              <Button onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>保存</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (activeView === 'background' && backgroundMarkdown) {
    return (
      <div className="min-h-screen app-bg flex flex-col">
        <header className="sticky top-14 z-10 border-b border-stone-200 bg-white/95 backdrop-blur-sm lg:top-0">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 sm:px-4">
            <button onClick={() => navigate('/projects')} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-bold text-sky-600 hover:bg-stone-100">
              <ChevronLeft size={16} /><span className="hidden sm:inline">项目列表</span>
            </button>
            <button onClick={() => navigate('/')} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100" aria-label="返回首页"><Home size={16} /></button>
            <h1 className="flex-1 truncate text-center text-sm font-extrabold text-stone-800 sm:text-base">{projectTitle} · {readingButtonLabel}</h1>
            <Button variant="outline" size="sm" onClick={() => setActiveView('questions')}><Layers size={16} /><span className="hidden sm:inline">问答阅读</span></Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-10">
          <article className="surface-card px-5 py-6 sm:px-10 sm:py-10" data-color-mode="light">
            <LazyMDMarkdown source={backgroundMarkdown} className="prose prose-slate max-w-none dark:prose-invert" style={{ backgroundColor: 'transparent' }} />
          </article>
        </main>
      </div>
    );
  }

  if (!cardsLoaded) {
    return <div className="min-h-screen app-bg flex items-center justify-center"><p className="text-ink-muted">加载中...</p></div>;
  }

  return (
    <>
      <StudyReader
        title={exportTitle}
        subtitle={projectSubtitle}
        backPath="/projects"
        module="projects"
        chapterId={projectId}
        cards={cards}
        actions={(
          <div className="flex shrink-0 items-center gap-1.5">
            {backgroundMarkdown && <Button variant="outline" onClick={() => setActiveView('background')} className="gap-1.5 px-2 sm:gap-2 sm:px-4"><BookOpen size={16} /><span className="hidden sm:inline">{readingButtonLabel}</span></Button>}
            <Button onClick={() => setIsAdding(true)} className="gap-1.5 px-2 sm:gap-2 sm:px-4"><Plus size={16} /><span className="hidden sm:inline">新增问题</span></Button>
          </div>
        )}
      />
      {addQuestionModal}
    </>
  );
}
