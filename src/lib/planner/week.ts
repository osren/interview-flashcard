import { buildCurrentWeekDays, formatDateKey, WEEKDAY_LABELS_MON_FIRST } from '@/utils/streak';

/** 自动完成量的来源：测验作答 / 岗位投递事件 / 掌握度升级 */
export const AUTO_SOURCES = ['quiz', 'job', 'mastery'] as const;
export type PlannerAutoSource = (typeof AUTO_SOURCES)[number];
export type AutoCounts = Record<PlannerAutoSource, number>;

export const MIN_TASK_TARGET = 1;
export const MAX_TASK_TARGET = 200;

/** 一条手动计划。target 是计划量，勾选型填 1 */
export interface PlannerTask {
  id: string;
  /** 归属周（周一，YYYY-MM-DD） */
  weekStart: string;
  /** 归属日（YYYY-MM-DD） */
  dateKey: string;
  title: string;
  /** 计划量：刷 10 题 → 10；整理一份面经 → 1 */
  target: number;
  /** 单位，题 / 个 / 项 */
  unit: string;
  /** 手动推进的量，勾选型为 0 */
  manualDone: number;
  /** 手动勾选完成，优先级高于计数 */
  checked: boolean;
  /** 自动完成来源，null 为纯手动 */
  autoSource: PlannerAutoSource | null;
  createdAt: number;
}

export interface PlannerTaskRow {
  task: PlannerTask;
  done: number;
  /** 其中有多少来自自动记录 */
  autoPart: number;
  complete: boolean;
}

export interface PlannerAutoStats {
  week: AutoCounts;
  byDay: Record<string, AutoCounts>;
}

export interface DayPlanView {
  dateKey: string;
  label: string;
  date: Date;
  isToday: boolean;
  isFuture: boolean;
  checkedIn: boolean;
  tasks: PlannerTaskRow[];
  auto: AutoCounts;
  /** 计划量（分母） */
  planPoints: number;
  /** 已完成量（分子第一部分） */
  donePoints: number;
  /** 计划之外多出来的量（分子第二部分，只加不减分母） */
  extraPoints: number;
  /** 未封顶的完成度 */
  progress: number;
  /** 柱高，0~1 */
  fill: number;
  doneTaskCount: number;
}

export interface WeekPlanView {
  weekStart: string;
  weekEnd: string;
  rangeLabel: string;
  days: DayPlanView[];
  planPoints: number;
  donePoints: number;
  extraPoints: number;
  progress: number;
  fill: number;
  taskCount: number;
  doneTaskCount: number;
  auto: AutoCounts;
  activeDays: number;
  checkedDays: number;
  todayIndex: number;
  remainingDays: number;
}

export function emptyCounts(): AutoCounts {
  return { quiz: 0, job: 0, mastery: 0 };
}

/** 当前所在周的周一，形如 2026-11-09 */
export function currentWeekStartKey(now: Date = new Date()): string {
  return buildCurrentWeekDays({}, now)[0].dateKey;
}

/** 把任务计划量钳到合法区间 */
export function clampTaskTarget(value: number): number {
  if (!Number.isFinite(value)) return MIN_TASK_TARGET;
  return Math.min(MAX_TASK_TARGET, Math.max(MIN_TASK_TARGET, Math.round(value)));
}

/**
 * 从既有行为里算出每天/每周自动完成量。
 *
 * 这些数不是二次记账，是从已有记录派生：测验作答、岗位投递事件、掌握度升级。
 */
export function buildAutoStats(input: {
  dateKeys: string[];
  attempts: { at: number }[];
  jobHistory: { status: string; at: string }[];
  mastery: Record<string, { strength: number; lastAt: number }>;
}): PlannerAutoStats {
  const { dateKeys, attempts, jobHistory, mastery } = input;
  const byDay: Record<string, AutoCounts> = {};
  const week = emptyCounts();

  for (const key of dateKeys) byDay[key] = emptyCounts();

  const bump = (key: string, source: PlannerAutoSource) => {
    if (!byDay[key]) return;
    byDay[key][source] += 1;
    week[source] += 1;
  };

  for (const attempt of attempts) {
    if (typeof attempt.at !== 'number' || attempt.at <= 0) continue;
    bump(formatDateKey(new Date(attempt.at)), 'quiz');
  }

  for (const entry of jobHistory) {
    if (entry.status !== 'applied' || !entry.at) continue;
    const parsed = new Date(entry.at);
    if (Number.isNaN(parsed.getTime())) continue;
    bump(formatDateKey(parsed), 'job');
  }

  for (const record of Object.values(mastery)) {
    if (!record || record.strength < 3 || typeof record.lastAt !== 'number') continue;
    if (record.lastAt <= 0) continue;
    bump(formatDateKey(new Date(record.lastAt)), 'mastery');
  }

  return { week, byDay };
}

/**
 * 把自动完成量分配到任务上，再算出「计划量 / 完成量 / 额外量」。
 *
 * 分母只包含用户明确答应的事；多做的量只进分子，不进分母——
 * 这样临时加练不会被当成「没完成计划」，计划系统才不会打击人。
 * 同一来源只允许一条任务吸收，避免两道「刷题」任务把同一批题算两遍。
 */
export function computePlanProgress(
  tasks: PlannerTask[],
  auto: AutoCounts
): { rows: PlannerTaskRow[]; plan: number; done: number; extra: number; progress: number } {
  const used = emptyCounts();
  const rows: PlannerTaskRow[] = [];

  for (const task of tasks) {
    let autoPart = 0;
    if (task.autoSource) {
      const remain = Math.max(0, auto[task.autoSource] - used[task.autoSource]);
      autoPart = Math.min(remain, task.target);
      used[task.autoSource] += autoPart;
    }
    const done = task.checked ? task.target : Math.min(task.target, task.manualDone + autoPart);
    rows.push({ task, done, autoPart, complete: done >= task.target });
  }

  const plan = rows.reduce((sum, row) => sum + row.task.target, 0);
  const done = rows.reduce((sum, row) => sum + row.done, 0);
  const extra =
    Math.max(0, auto.quiz - used.quiz) +
    Math.max(0, auto.job - used.job) +
    Math.max(0, auto.mastery - used.mastery);

  return { rows, plan, done, extra, progress: plan > 0 ? (done + extra) / plan : 0 };
}

/**
 * 把一周拼出来：7 天 + 每天任务 + 自动量 + 完成度。
 */
export function buildPlannerWeek(input: {
  tasks: PlannerTask[];
  attempts: { at: number }[];
  jobHistory: { status: string; at: string }[];
  mastery: Record<string, { strength: number; lastAt: number }>;
  checkInDates: Record<string, true>;
  now?: Date;
}): WeekPlanView {
  const { tasks, attempts, jobHistory, mastery, checkInDates, now = new Date() } = input;
  const week = buildCurrentWeekDays(checkInDates, now);
  const dateKeys = week.map((day) => day.dateKey);
  const autoStats = buildAutoStats({ dateKeys, attempts, jobHistory, mastery });

  const days: DayPlanView[] = week.map((day, index) => {
    const dayTasks = tasks.filter((task) => task.dateKey === day.dateKey);
    const auto = autoStats.byDay[day.dateKey] ?? emptyCounts();
    const { rows, plan, done, extra, progress } = computePlanProgress(dayTasks, auto);

    const fill = plan > 0 ? Math.min(1, progress) : extra > 0 ? 0.12 : 0;

    return {
      dateKey: day.dateKey,
      label: WEEKDAY_LABELS_MON_FIRST[index],
      date: day.date,
      isToday: day.isToday,
      isFuture: day.isFuture,
      checkedIn: day.isCheckedIn,
      tasks: rows,
      auto,
      planPoints: plan,
      donePoints: done,
      extraPoints: extra,
      progress,
      fill,
      doneTaskCount: rows.filter((row) => row.complete).length,
    };
  });

  const planPoints = days.reduce((sum, day) => sum + day.planPoints, 0);
  const donePoints = days.reduce((sum, day) => sum + day.donePoints, 0);
  const extraPoints = days.reduce((sum, day) => sum + day.extraPoints, 0);
  const taskCount = days.reduce((sum, day) => sum + day.tasks.length, 0);
  const doneTaskCount = days.reduce((sum, day) => sum + day.doneTaskCount, 0);
  const nowAuto = autoStats.week;

  const todayIndex = days.findIndex((day) => day.isToday);
  const fmt = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

  return {
    weekStart: days[0].dateKey,
    weekEnd: days[days.length - 1].dateKey,
    rangeLabel: `${fmt(days[0].date)} - ${fmt(days[days.length - 1].date)}`,
    days,
    planPoints,
    donePoints,
    extraPoints,
    progress: planPoints > 0 ? (donePoints + extraPoints) / planPoints : 0,
    fill: planPoints > 0 ? Math.min(1, (donePoints + extraPoints) / planPoints) : 0,
    taskCount,
    doneTaskCount,
    auto: nowAuto,
    activeDays: days.filter((day) => day.planPoints > 0 || day.donePoints > 0 || day.extraPoints > 0)
      .length,
    checkedDays: days.filter((day) => day.checkedIn).length,
    todayIndex,
    remainingDays: todayIndex >= 0 ? 7 - todayIndex : 0,
  };
}
