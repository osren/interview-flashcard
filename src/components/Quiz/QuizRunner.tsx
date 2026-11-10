import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useQuizStore } from '@/store/useQuizStore';
import { recordLearningCheckIn } from '@/store/useStreakStore';
import { generateQuizItems } from '@/lib/quiz/generate';
import { nextMastery, masteryLabel } from '@/lib/quiz/mastery';
import { buildReviewQueue, buildRoundPlan } from '@/lib/quiz/round';
import { scoreRound, toAttemptRecords } from '@/lib/quiz/scoring';
import { cn } from '@/utils/cn';
import type { FlashCard, QuizItem, QuizRoundResult } from '@/types';
import type { RoundMode } from '@/lib/quiz/round';

interface QuizRunnerProps {
  cards: FlashCard[];
  /** mixed：常规测验；review：只练最近答错的题 */
  mode?: RoundMode;
  onExit: () => void;
  /** 结果页「去看原题」：把用户带回原卡片 */
  onOpenCard: (cardId: string) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function accuracyTone(accuracy: number): { color: string; label: string } {
  if (accuracy >= 80) return { color: '#58CC02', label: '掌握得不错' };
  if (accuracy >= 60) return { color: '#1CB0F6', label: '还有几个盲点' };
  return { color: '#FF9600', label: '这几道建议回去再看一遍' };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(dueAt: number): number {
  return Math.max(1, Math.round((dueAt - Date.now()) / DAY_MS));
}

/** 找出用户选中的那个错误选项对应的误解诊断 */
function findDiagnosis(item: QuizItem, selectedIndex: number) {
  return item.distractors?.find((note) => note.optionIndex === selectedIndex);
}

export function QuizRunner({ cards, mode = 'mixed', onExit, onOpenCard }: QuizRunnerProps) {
  const mastery = useQuizStore((state) => state.mastery);
  const attemptsState = useQuizStore((state) => state.attempts);
  const [sessionMode, setSessionMode] = useState<RoundMode>(mode);
  const [roundKey, setRoundKey] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'result' | 'error'>('loading');
  const [items, setItems] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizRoundResult | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPhase('loading');
      setItems([]);
      setIndex(0);
      setAnswers({});
      setResult(null);
      setError('');
      setNotice('');

      const state = useQuizStore.getState();
      const plan = buildRoundPlan({
        cards,
        items: state.items,
        attempts: state.attempts,
        mastery: state.mastery,
        mode: sessionMode,
      });

      if (plan.total === 0) {
        setError(
          sessionMode === 'review'
            ? '错题已经清空了，没有需要重练的题。'
            : '收藏里还没有题目，先去收藏几道题再来。'
        );
        setPhase('error');
        return;
      }

      let generated: QuizItem[] = [];
      if (plan.toGenerate.length > 0) {
        try {
          generated = await generateQuizItems(plan.toGenerate);
          if (!cancelled && generated.length > 0) {
            useQuizStore.getState().upsertItems(generated);
          }
        } catch (err) {
          if (!cancelled) {
            setNotice(err instanceof Error ? err.message : '出题失败');
          }
        }
      }

      if (cancelled) return;

      const roundItems = [...plan.reuse, ...generated];
      if (roundItems.length === 0) {
        setError('这一轮没能生成题目，可能是 AI 额度用完了，明天再试或稍后重试。');
        setPhase('error');
        return;
      }

      setItems(shuffle(roundItems));
      setPhase('ready');
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [cards, roundKey, sessionMode]);

  const currentItem = items[index];
  const currentAnswer = currentItem ? answers[currentItem.id] : undefined;
  const answered = typeof currentAnswer === 'number';
  const isLast = index === items.length - 1;
  const answeredCount = Object.keys(answers).length;

  // 选错时找出这个干扰项对应的误解，用来当场说「你把什么和什么混了」
  const wrongDiagnosis =
    currentItem && typeof currentAnswer === 'number' && currentAnswer !== currentItem.answerIndex
      ? currentItem.distractors?.find((note) => note.optionIndex === currentAnswer)
      : undefined;

  function chooseOption(optionIndex: number) {
    if (!currentItem || answered) return;
    setAnswers((prev) => ({ ...prev, [currentItem.id]: optionIndex }));
  }

  function goNext() {
    if (!answered) return;

    if (isLast) {
      const scored = scoreRound(items, answers);
      setResult(scored);
      setPhase('result');
      setNotice('');

      const sessionId = createSessionId();
      const now = Date.now();
      const store = useQuizStore.getState();

      // 掌握度要在写记录之前算：nextMastery 需要上一轮的强度
      const masteryRecords = scored.details.map((detail) =>
        nextMastery(
          store.mastery[detail.item.cardId],
          detail.item.cardId,
          detail.correct,
          now
        )
      );

      store.recordAttempts(toAttemptRecords(scored, sessionId, now));
      store.applyMastery(masteryRecords);
      recordLearningCheckIn();
      return;
    }

    setIndex((prev) => prev + 1);
  }

  function restart() {
    setRoundKey((prev) => prev + 1);
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Loader2 className="animate-spin text-[#58CC02]" size={32} />
        <div className="text-sm font-bold text-gray-700 dark:text-gray-200">正在出题…</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
          第一次做某道题会调用 AI 生成选项，之后直接读缓存，不会再等。
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <XCircle className="text-[#FF4B4B]" size={40} />
        <div className="text-sm text-gray-700 dark:text-gray-200 max-w-sm">{notice || error}</div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onExit}>返回收藏</Button>
          <Button variant="primary" onClick={restart}>重试</Button>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const tone = accuracyTone(result.accuracy);
    const wrongDetails = result.details.filter((detail) => !detail.correct);
    // 错题队列由作答记录现算，所以这里显示的是「练完之后还剩多少」
    const remainingReview =
      sessionMode === 'review'
        ? buildReviewQueue({ cards, attempts: attemptsState, mastery }).length
        : 0;

    return (
      <div className="min-h-screen app-bg pb-24">
        <div className="max-w-xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onExit}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={18} />
              关闭
            </button>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {sessionMode === 'review' ? '错题重练' : '本轮结果'}
            </span>
            <span className="text-xs text-gray-400">{items.length} 道</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-6 py-8 text-center shadow-sm">
            <div className="text-5xl font-black" style={{ color: tone.color }}>
              {result.accuracy}%
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              答对 {result.correct} / {result.total} 题
            </div>
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">{tone.label}</div>
          </div>

          {sessionMode === 'review' && (
            <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
              {remainingReview > 0
                ? `错题队列还剩 ${remainingReview} 道，答对一次就移出`
                : '错题队列已清空'}
            </div>
          )}

          {wrongDetails.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={18} className="text-[#FF4B4B]" />
                <h2 className="font-bold text-gray-800 dark:text-white text-sm">
                  错题 {wrongDetails.length} 道
                </h2>
              </div>
              <div className="space-y-3">
                {wrongDetails.map((detail) => {
                  const diagnosis = findDiagnosis(detail.item, detail.selectedIndex);
                  return (
                  <div
                    key={detail.item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900/40 p-4"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                      {detail.item.stem}
                    </div>
                    <div className="mt-3 text-xs leading-relaxed">
                      <div className="text-red-500">
                        你选：{detail.item.options[detail.selectedIndex] ?? '未作答'}
                      </div>
                      <div className="text-[#58CC02] mt-1">
                        正确：{detail.item.options[detail.item.answerIndex]}
                      </div>
                      {detail.item.explanation && (
                        <div className="mt-2 text-gray-500 dark:text-gray-400">
                          {detail.item.explanation}
                        </div>
                      )}
                    </div>
                    {mastery[detail.item.cardId] && (
                      <div className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        掌握度 {masteryLabel(mastery[detail.item.cardId].strength)} · 约{' '}
                        {daysUntil(mastery[detail.item.cardId].dueAt)} 天后再复习
                      </div>
                    )}
                    <button
                      onClick={() => onOpenCard(detail.item.cardId)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1CB0F6] hover:underline"
                    >
                      <BookOpen size={14} />
                      去看原卡片
                    </button>
                    {diagnosis && (
                      <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs">
                        <div className="font-bold text-amber-700 dark:text-amber-300">误解诊断</div>
                        <div className="mt-0.5 text-amber-800 dark:text-amber-200">
                          {diagnosis.misconception}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {wrongDetails.length === 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#58CC02] font-bold">
              <Check size={18} />
              全对，这一轮没有错题
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {sessionMode === 'mixed' && wrongDetails.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSessionMode('review');
                  setRoundKey((prev) => prev + 1);
                }}
              >
                只练这 {wrongDetails.length} 道错题
              </Button>
            )}
            <Button variant="primary" size="lg" onClick={restart}>
              <RotateCcw size={18} />
              再来一轮
            </Button>
            <Button variant="secondary" onClick={onExit}>返回收藏</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center text-sm text-gray-500">
        暂无可用题目
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg pb-24">
      <div className="sticky top-0 z-10 bg-surface-elevated/95 backdrop-blur border-b border-surface-border">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onExit}
              className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              aria-label="退出测验"
            >
              <X size={20} />
            </button>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {index + 1} / {items.length}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">已答 {answeredCount}</span>
          </div>
          <div className="h-2 rounded-full bg-[#e5e5e5] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#58CC02] transition-all duration-300"
              style={{ width: `${(index / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {notice && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {notice}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mb-2">
          <Sparkles size={13} className="text-[#58CC02]" />
          <span>考点：{currentItem.point}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-5 shadow-sm">
          <div className="text-base font-bold text-gray-900 dark:text-white leading-relaxed">
            {currentItem.stem}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {currentItem.options.map((option, optionIndex) => {
            const isAnswer = optionIndex === currentItem.answerIndex;
            const isSelected = optionIndex === currentAnswer;
            return (
              <button
                key={`${currentItem.id}-${optionIndex}`}
                onClick={() => chooseOption(optionIndex)}
                disabled={answered}
                className={cn(
                  'w-full flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                  !answered &&
                    'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#58CC02] hover:bg-[#f7fee7] dark:hover:bg-green-900/20',
                  answered && isAnswer && 'border-[#58CC02] bg-[#f0fdf4] dark:bg-green-900/20',
                  answered && !isAnswer && isSelected && 'border-[#FF4B4B] bg-[#fef2f2] dark:bg-red-900/20',
                  answered && !isAnswer && !isSelected && 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-60'
                )}
              >
                <span
                  className={cn(
                    'shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black',
                    !answered && 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300',
                    answered && isAnswer && 'bg-[#58CC02] text-white',
                    answered && !isAnswer && isSelected && 'bg-[#FF4B4B] text-white',
                    answered && !isAnswer && !isSelected && 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                  )}
                >
                  {OPTION_LABELS[optionIndex] ?? optionIndex + 1}
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={cn(
              'mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed',
              currentAnswer === currentItem.answerIndex
                ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
            )}
          >
            <div className="font-bold mb-1">
              {currentAnswer === currentItem.answerIndex ? '回答正确' : '回答错误'}
            </div>
            <div>{currentItem.explanation}</div>
            {wrongDiagnosis && (
              <div className="mt-2 rounded-lg bg-white/70 dark:bg-black/20 px-3 py-2">
                <div className="font-bold">误解诊断</div>
                <div className="mt-0.5">{wrongDiagnosis.misconception}</div>
                {wrongDiagnosis.correction && (
                  <div className="mt-1 opacity-80">怎么区分：{wrongDiagnosis.correction}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            variant={answered ? 'primary' : 'secondary'}
            size="lg"
            className="w-full"
            disabled={!answered}
            onClick={goNext}
          >
            {isLast ? '看结果' : '下一题'}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
