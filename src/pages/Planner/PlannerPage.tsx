import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Flame,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import { useStreakStore } from '@/store/useStreakStore';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { usePlannerStore } from '@/store/usePlannerStore';
import {
  buildPlannerWeek,
  currentWeekStartKey,
  type DayPlanView,
  type PlannerAutoSource,
  type PlannerTaskRow,
} from '@/lib/planner/week';
import { cn } from '@/utils/cn';

interface QuickTemplate {
  key: string;
  label: string;
  title: string;
  target: number;
  unit: string;
  autoSource: PlannerAutoSource | null;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  { key: 'quiz', label: '刷题', title: '刷题', target: 10, unit: '题', autoSource: 'quiz' },
  { key: 'job', label: '投递岗位', title: '投递岗位', target: 5, unit: '个', autoSource: 'job' },
  {
    key: 'mastery',
    label: '掌握知识点',
    title: '掌握知识点',
    target: 3,
    unit: '个',
    autoSource: 'mastery',
  },
  { key: 'review', label: '复习知识点', title: '复习知识点', target: 1, unit: '项', autoSource: null },
  { key: 'note', label: '整理面经', title: '整理面经', target: 1, unit: '项', autoSource: null },
  {
    key: 'status',
    label: '更新岗位状态',
    title: '更新岗位状态',
    target: 1,
    unit: '项',
    autoSource: null,
  },
];

function TaskRow({
  row,
  onToggle,
  onBump,
  onRemove,
}: {
  row: PlannerTaskRow;
  onToggle: () => void;
  onBump: (delta: number) => void;
  onRemove: () => void;
}) {
  const { task, done, autoPart, complete } = row;
  const counted = task.target > 1;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-colors',
        complete
          ? 'border-[#d9f0c4] bg-[#f7fdf3]'
          : 'border-[#eeeeee] bg-white hover:border-[#e0e0e0]'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={complete ? '标记未完成' : '标记完成'}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          complete
            ? 'border-[#58CC02] bg-[#58CC02] text-white'
            : 'border-[#dddddd] text-transparent hover:border-[#58CC02]'
        )}
      >
        <Check size={14} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'truncate text-[15px] font-bold',
            complete ? 'text-[#7a7a7a] line-through' : 'text-[#3c3c3c]'
          )}
        >
          {task.title}
        </div>
        {task.autoSource && (
          <div className="mt-0.5 text-[13px] font-semibold text-[#afafaf]">
            {autoPart > 0 ? `已自动计入 ${autoPart} ${task.unit}` : '自动统计中'}
          </div>
        )}
      </div>

      <div className="shrink-0 text-[15px] font-extrabold text-[#3c3c3c]">
        {done}
        <span className="text-[13px] font-bold text-[#afafaf]">
          /{task.target} {task.unit}
        </span>
      </div>

      {counted && !complete && (
        <button
          type="button"
          onClick={() => onBump(1)}
          aria-label="完成一个"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#eeeeee] text-[#777777] transition-colors hover:bg-[#f7f7f7]"
        >
          <Plus size={13} strokeWidth={3} />
        </button>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="删除任务"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#dddddd] transition-colors hover:bg-[#fff1f0] hover:text-[#FF4B4B]"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );
}

function DaySection({
  day,
  onToggle,
  onBump,
  onRemove,
  onAdd,
}: {
  day: DayPlanView;
  onToggle: (id: string) => void;
  onBump: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onAdd: (title: string, target: number, unit: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('1');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const parsed = Number.parseFloat(target);
    onAdd(trimmed, Number.isFinite(parsed) ? parsed : 1, '项');
    setTitle('');
    setTarget('1');
    setOpen(false);
  };

  return (
    <section
      className={cn(
        'rounded-2xl border-2 px-4 py-3.5',
        day.isToday ? 'border-[#ffd9a8] bg-[#fffaf3]' : 'border-[#f0f0f0] bg-white'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-[16px] font-extrabold',
              day.isToday ? 'text-[#FF9600]' : 'text-[#3c3c3c]'
            )}
          >
            周{day.label}
          </span>
          <span className="text-[13px] font-semibold text-[#afafaf]">
            {day.date.getMonth() + 1}/{day.date.getDate()}
          </span>
          {day.isToday && (
            <span className="rounded-md bg-[#FF9600] px-1.5 py-0.5 text-[12px] font-bold text-white">
              今天
            </span>
          )}
          {day.checkedIn && <Check size={13} className="text-[#58CC02]" strokeWidth={3} />}
        </div>
        <span className="text-[13px] font-bold text-[#777777]">
          {day.tasks.length > 0 ? `${day.doneTaskCount}/${day.tasks.length} 条` : '未排计划'}
          {day.extraPoints > 0 && (
            <span className="ml-1.5 text-[#FF9600]">+{day.extraPoints}</span>
          )}
        </span>
      </div>

      <div className="space-y-2">
        {day.tasks.map((row) => (
          <TaskRow
            key={row.task.id}
            row={row}
            onToggle={() => onToggle(row.task.id)}
            onBump={(delta) => onBump(row.task.id, delta)}
            onRemove={() => onRemove(row.task.id)}
          />
        ))}

        {open ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-[#eeeeee] bg-white px-3 py-2">
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit();
                if (event.key === 'Escape') setOpen(false);
              }}
              placeholder="要做什么"
              className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#3c3c3c] outline-none placeholder:text-[#c4c4c4]"
            />
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              inputMode="numeric"
              className="w-12 rounded-lg border-2 border-[#eeeeee] px-2 py-1 text-center text-[14px] font-bold text-[#3c3c3c] outline-none"
            />
            <button
              type="button"
              onClick={submit}
              className="rounded-lg bg-[#58CC02] px-3 py-1.5 text-[13px] font-extrabold text-white"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[13px] font-bold text-[#afafaf]"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#e5e5e5] py-2 text-[13px] font-bold text-[#afafaf] transition-colors hover:border-[#58CC02] hover:text-[#58CC02]"
          >
            <Plus size={13} strokeWidth={3} />
            加一条
          </button>
        )}
      </div>
    </section>
  );
}

export function PlannerPage() {
  const attempts = useQuizStore((state) => state.attempts);
  const mastery = useQuizStore((state) => state.mastery);
  const checkInDates = useStreakStore((state) => state.checkInDates);
  const jobProgress = useCampusJobStore((state) => state.jobProgress);
  const tasks = usePlannerStore((state) => state.tasks);
  const addTask = usePlannerStore((state) => state.addTask);
  const toggleTask = usePlannerStore((state) => state.toggleTask);
  const bumpTask = usePlannerStore((state) => state.bumpTask);
  const removeTask = usePlannerStore((state) => state.removeTask);

  const now = useMemo(() => new Date(), []);
  const weekStart = currentWeekStartKey(now);

  const jobHistory = useMemo(
    () =>
      Object.entries(jobProgress).flatMap(([jobId, progress]) =>
        (progress?.statusHistory ?? []).map((entry) => ({
          jobId,
          status: String(entry.status),
          at: entry.at,
        }))
      ),
    [jobProgress]
  );

  const weekTasks = useMemo(
    () => tasks.filter((task) => task.weekStart === weekStart),
    [tasks, weekStart]
  );

  const view = useMemo(
    () =>
      buildPlannerWeek({
        tasks: weekTasks,
        attempts,
        jobHistory,
        mastery,
        checkInDates,
        now,
      }),
    [weekTasks, attempts, jobHistory, mastery, checkInDates, now]
  );

  const todayKey = view.days[view.todayIndex >= 0 ? view.todayIndex : 0]?.dateKey ?? weekStart;

  const [draftTitle, setDraftTitle] = useState('');
  const [draftTarget, setDraftTarget] = useState('1');
  const [draftDate, setDraftDate] = useState(todayKey);

  const sourceTaken = (source: PlannerAutoSource) =>
    weekTasks.some((task) => task.autoSource === source);

  const addFreeTask = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    const parsed = Number.parseFloat(draftTarget);
    addTask({
      weekStart,
      dateKey: draftDate || todayKey,
      title: trimmed,
      target: Number.isFinite(parsed) ? parsed : 1,
      unit: '项',
    });
    setDraftTitle('');
    setDraftTarget('1');
  };

  const percent = Math.round(view.progress * 100);
  const todayView = view.days.find((day) => day.isToday);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7">
      <header className="mb-5">
        <h1 className="text-[26px] font-extrabold leading-tight text-[#3c3c3c]">本周计划</h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[14px] font-semibold text-[#777777]">
          <CalendarDays size={15} />
          {view.rangeLabel}
          <span className="text-[#c4c4c4]">·</span>
          周一至周日
        </p>
      </header>

      <section className="mb-4 rounded-2xl border-2 border-[#eeeeee] border-b-[3px] bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-[#afafaf]">计划完成度</div>
            <div className="mt-1 text-[30px] font-extrabold leading-none text-[#3c3c3c]">
              {view.donePoints + view.extraPoints}
              <span className="text-[16px] font-bold text-[#afafaf]"> / {view.planPoints}</span>
            </div>
          </div>
          <div
            className="rounded-xl px-3 py-1.5 text-[15px] font-extrabold"
            style={{
              color: percent >= 100 ? '#58CC02' : '#1CB0F6',
              background: percent >= 100 ? '#f0fdf4' : '#eff8ff',
            }}
          >
            {percent}%
          </div>
        </div>

        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, percent)}%`,
              background: percent >= 100 ? '#58CC02' : '#1CB0F6',
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-semibold text-[#777777]">
          {view.planPoints === 0 ? (
            <span>还没排计划，从下面加一条开始</span>
          ) : (
            <>
              <span>
                已完成 {view.doneTaskCount}/{view.taskCount} 条
              </span>
              {todayView && (
                <span>
                  今天 {todayView.doneTaskCount}/{todayView.tasks.length} 条
                </span>
              )}
              {view.extraPoints > 0 && (
                <span className="text-[#FF9600]">计划外多做 +{view.extraPoints}</span>
              )}
            </>
          )}
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {view.days.map((day) => (
            <div key={day.dateKey} className="flex flex-col items-center">
              <span
                className={cn(
                  'text-[13px] font-extrabold',
                  day.planPoints > 0 ? 'text-[#3c3c3c]' : 'text-[#c4c4c4]'
                )}
              >
                {day.planPoints > 0 ? `${day.doneTaskCount}/${day.tasks.length}` : '·'}
              </span>
              <div className="mt-1.5 flex h-[104px] w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500',
                    day.isFuture
                      ? 'h-full border-2 border-dashed border-[#f0f0f0] bg-transparent'
                      : day.fill > 0
                        ? day.isToday
                          ? 'bg-[#FF9600]'
                          : 'bg-[#58CC02]'
                        : 'bg-[#f0f0f0]'
                  )}
                  style={
                    day.isFuture
                      ? undefined
                      : {
                          height: `${Math.max(day.fill * 100, 3)}%`,
                          borderBottomLeftRadius: 6,
                          borderBottomRightRadius: 6,
                        }
                  }
                />
              </div>
              <span
                className={cn(
                  'mt-2 text-[14px] font-extrabold',
                  day.isToday ? 'text-[#FF9600]' : 'text-[#777777]'
                )}
              >
                {day.label}
              </span>
              <span className="text-[12px] font-semibold text-[#c4c4c4]">
                {day.date.getMonth() + 1}/{day.date.getDate()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-2xl border-2 border-[#eeeeee] border-b-[3px] bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Sparkles size={15} className="text-[#1CB0F6]" />
          <span className="text-[15px] font-extrabold text-[#3c3c3c]">加一条计划</span>
          <select
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            className="ml-auto rounded-lg border-2 border-[#eeeeee] px-2 py-1 text-[13px] font-bold text-[#777777] outline-none"
          >
            {view.days.map((day) => (
              <option key={day.dateKey} value={day.dateKey}>
                周{day.label} {day.date.getMonth() + 1}/{day.date.getDate()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addFreeTask();
            }}
            placeholder="比如：复习 React 生命周期"
            className="min-w-[180px] flex-1 rounded-xl border-2 border-[#eeeeee] px-3 py-2 text-[15px] font-semibold text-[#3c3c3c] outline-none focus:border-[#1CB0F6]"
          />
          <input
            value={draftTarget}
            onChange={(event) => setDraftTarget(event.target.value)}
            inputMode="numeric"
            className="w-14 rounded-xl border-2 border-[#eeeeee] px-2 py-2 text-center text-[15px] font-bold text-[#3c3c3c] outline-none"
          />
          <span className="text-[14px] font-bold text-[#afafaf]">项</span>
          <button
            type="button"
            onClick={addFreeTask}
            className="rounded-xl bg-[#58CC02] px-4 py-2 text-[14px] font-extrabold text-white active:translate-y-[1px]"
          >
            添加
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template) => {
            const taken = template.autoSource ? sourceTaken(template.autoSource) : false;
            return (
              <button
                key={template.key}
                type="button"
                disabled={taken}
                onClick={() =>
                  addTask({
                    weekStart,
                    dateKey: draftDate || todayKey,
                    title: template.title,
                    target: template.target,
                    unit: template.unit,
                    autoSource: template.autoSource,
                  })
                }
                className={cn(
                  'rounded-lg border-2 px-2.5 py-1.5 text-[13px] font-bold transition-colors',
                  taken
                    ? 'cursor-not-allowed border-[#f0f0f0] text-[#dddddd]'
                    : 'border-[#eeeeee] text-[#777777] hover:border-[#1CB0F6] hover:text-[#1CB0F6]'
                )}
                title={taken ? '这周已经有同类任务了' : undefined}
              >
                {template.label}
                {template.target > 1 && (
                  <span className="ml-1 text-[#afafaf]">{template.target}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-[16px] font-extrabold text-[#3c3c3c]">这一周</span>
        <span className="text-[13px] font-semibold text-[#afafaf]">
          {view.taskCount > 0 ? `共 ${view.taskCount} 条` : '暂无计划'}
        </span>
      </div>

      <div className="space-y-3">
        {view.days.map((day) => (
          <DaySection
            key={day.dateKey}
            day={day}
            onToggle={toggleTask}
            onBump={bumpTask}
            onRemove={removeTask}
            onAdd={(title, target, unit) =>
              addTask({ weekStart, dateKey: day.dateKey, title, target, unit })
            }
          />
        ))}
      </div>

      <section className="mt-5 rounded-2xl border-2 border-[#eeeeee] bg-[#fafafa] p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#58CC02]" />
          <span className="text-[15px] font-extrabold text-[#3c3c3c]">本周自动记录</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '测验题数', value: view.auto.quiz, unit: '题', tone: '#1CB0F6' },
            { label: '掌握知识点', value: view.auto.mastery, unit: '个', tone: '#58CC02' },
            { label: '岗位投递', value: view.auto.job, unit: '个', tone: '#FF9600' },
            { label: '打卡天数', value: view.checkedDays, unit: '天', tone: '#FF4B4B' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex-1 min-w-[86px] rounded-xl border-2 border-[#eeeeee] bg-white px-3 py-2"
            >
              <div className="text-[18px] font-extrabold leading-none" style={{ color: item.tone }}>
                {item.value}
                <span className="ml-0.5 text-[12px] font-bold text-[#afafaf]">{item.unit}</span>
              </div>
              <div className="mt-1 text-[13px] font-bold text-[#afafaf]">{item.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] font-semibold leading-relaxed text-[#777777]">
          带「自动统计」的任务会自己长进度：刷题认收藏题测验记录，投递认岗位状态变更，掌握认掌握度升级。
          计划外的部分只加进完成度，不改变你的计划量。
        </p>
        {view.auto.quiz === 0 && view.auto.job === 0 && (
          <p className="mt-2 text-[13px] font-semibold text-[#afafaf]">
            还没产生自动记录。去收藏页做一轮测验，或更新一个岗位状态试试。
          </p>
        )}
      </section>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#c4c4c4]">
        <Flame size={11} />
        计划是给自己看的，不是用来扣分的
      </div>
    </div>
  );
}
