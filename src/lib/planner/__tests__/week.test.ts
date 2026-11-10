import { describe, expect, it } from 'vitest';
import {
  buildPlannerWeek,
  clampTaskTarget,
  computePlanProgress,
  currentWeekStartKey,
  emptyCounts,
  type PlannerTask,
} from '../week';

const TUESDAY = new Date(2026, 10, 10, 20, 0, 0);
const SUNDAY = new Date(2026, 10, 15, 20, 0, 0);
const WEEK_START = '2026-11-09';

function makeTask(overrides: Partial<PlannerTask> = {}): PlannerTask {
  return {
    id: overrides.id ?? 't1',
    weekStart: WEEK_START,
    dateKey: WEEK_START,
    title: '刷题',
    target: 10,
    unit: '题',
    manualDone: 0,
    checked: false,
    autoSource: 'quiz',
    createdAt: 0,
    ...overrides,
  };
}

describe('周区间与目标钳制', () => {
  it('周二落在本周周一，周日仍算这一周', () => {
    expect(currentWeekStartKey(TUESDAY)).toBe(WEEK_START);
    expect(currentWeekStartKey(SUNDAY)).toBe(WEEK_START);
  });

  it('任务目标钳在 1~200 的整数', () => {
    expect(clampTaskTarget(0)).toBe(1);
    expect(clampTaskTarget(999)).toBe(200);
    expect(clampTaskTarget(Number.NaN)).toBe(1);
    expect(clampTaskTarget(7.6)).toBe(8);
  });
});

describe('computePlanProgress', () => {
  it('自动量会填进任务进度', () => {
    const result = computePlanProgress([makeTask({ target: 10 })], {
      ...emptyCounts(),
      quiz: 4,
    });

    expect(result.rows[0].done).toBe(4);
    expect(result.rows[0].complete).toBe(false);
    expect(result.plan).toBe(10);
    expect(result.done).toBe(4);
    expect(result.extra).toBe(0);
    expect(result.progress).toBeCloseTo(0.4, 5);
  });

  it('手动勾选直接算满，不看计数', () => {
    const result = computePlanProgress(
      [makeTask({ target: 10, manualDone: 2, checked: true })],
      emptyCounts()
    );

    expect(result.rows[0].done).toBe(10);
    expect(result.rows[0].complete).toBe(true);
    expect(result.progress).toBe(1);
  });

  it('自动量超出计划时，多出来的只进分子', () => {
    const result = computePlanProgress([makeTask({ target: 5 })], {
      ...emptyCounts(),
      quiz: 8,
    });

    expect(result.plan).toBe(5);
    expect(result.done).toBe(5);
    expect(result.extra).toBe(3);
    // 8 题做完 5 题的计划，完成度是 160%，不是被截成 100%
    expect(result.progress).toBeCloseTo(1.6, 5);
  });

  it('同一来源的两条任务不会把同一批题算两遍', () => {
    const result = computePlanProgress(
      [makeTask({ id: 'a', target: 5 }), makeTask({ id: 'b', target: 5 })],
      { ...emptyCounts(), quiz: 6 }
    );

    expect(result.rows[0].done).toBe(5);
    expect(result.rows[1].done).toBe(1);
    expect(result.done).toBe(6);
    expect(result.extra).toBe(0);
  });

  it('没有任何计划时，额外工作量不会除以零', () => {
    const result = computePlanProgress([], { ...emptyCounts(), quiz: 5 });

    expect(result.plan).toBe(0);
    expect(result.extra).toBe(5);
    expect(result.progress).toBe(0);
  });
});

describe('buildPlannerWeek', () => {
  it('固定 7 天，任务落到对应那天，今天和未来有标记', () => {
    const view = buildPlannerWeek({
      tasks: [
        makeTask({ id: 'mon', dateKey: '2026-11-09', target: 10 }),
        makeTask({ id: 'wed', dateKey: '2026-11-11', target: 4, autoSource: null, unit: '项' }),
      ],
      attempts: [],
      jobHistory: [],
      mastery: {},
      checkInDates: {},
      now: TUESDAY,
    });

    expect(view.days).toHaveLength(7);
    expect(view.days.map((day) => day.label)).toEqual(['一', '二', '三', '四', '五', '六', '日']);
    expect(view.days[0].tasks).toHaveLength(1);
    expect(view.days[2].tasks).toHaveLength(1);
    expect(view.days[1].isToday).toBe(true);
    expect(view.days[3].isFuture).toBe(true);
    expect(view.remainingDays).toBe(6);
  });

  it('测验记录按本地天归到当天，并计入当周自动量', () => {
    const view = buildPlannerWeek({
      tasks: [],
      attempts: [
        { at: new Date(2026, 10, 9, 9, 0, 0).getTime() },
        { at: new Date(2026, 10, 9, 21, 0, 0).getTime() },
        { at: new Date(2026, 10, 10, 8, 0, 0).getTime() },
        { at: new Date(2026, 10, 6, 8, 0, 0).getTime() },
      ],
      jobHistory: [],
      mastery: {},
      checkInDates: {},
      now: TUESDAY,
    });

    expect(view.days[0].auto.quiz).toBe(2);
    expect(view.days[1].auto.quiz).toBe(1);
    expect(view.auto.quiz).toBe(3);
  });

  it('岗位投递事件与掌握度升级都按发生日计入', () => {
    const view = buildPlannerWeek({
      tasks: [],
      attempts: [],
      jobHistory: [
        { status: 'applied', at: '2026-11-09T10:00' },
        { status: 'applied', at: '2026-11-10T10:00' },
        { status: 'interview', at: '2026-11-10T11:00' },
      ],
      mastery: {
        c1: { strength: 3, lastAt: new Date(2026, 10, 10, 12, 0, 0).getTime() },
        c2: { strength: 2, lastAt: new Date(2026, 10, 10, 13, 0, 0).getTime() },
      },
      checkInDates: {},
      now: TUESDAY,
    });

    expect(view.auto.job).toBe(2);
    expect(view.auto.mastery).toBe(1);
    expect(view.days[1].auto.job).toBe(1);
    expect(view.days[1].auto.mastery).toBe(1);
  });

  it('新增任务会让分母变大，完成度相应下降', () => {
    const base = {
      attempts: [{ at: new Date(2026, 10, 9, 9, 0, 0).getTime() }],
      jobHistory: [],
      mastery: {},
      checkInDates: {},
      now: TUESDAY,
    };

    const withQuizTask = buildPlannerWeek({
      ...base,
      tasks: [makeTask({ id: 'quiz', dateKey: '2026-11-09', target: 10 })],
    });
    const withExtraTask = buildPlannerWeek({
      ...base,
      tasks: [
        makeTask({ id: 'quiz', dateKey: '2026-11-09', target: 10 }),
        makeTask({ id: 'note', dateKey: '2026-11-10', target: 1, unit: '项', autoSource: null }),
      ],
    });

    expect(withQuizTask.planPoints).toBe(10);
    expect(withExtraTask.planPoints).toBe(11);
    expect(withExtraTask.progress).toBeLessThan(withQuizTask.progress);
  });

  it('周完成度同时算日完成度与额外量', () => {
    const view = buildPlannerWeek({
      tasks: [
        makeTask({ id: 'a', dateKey: '2026-11-09', target: 4 }),
        makeTask({ id: 'b', dateKey: '2026-11-10', target: 2, unit: '项', autoSource: null, manualDone: 2 }),
      ],
      attempts: [
        { at: new Date(2026, 10, 9, 9, 0, 0).getTime() },
        { at: new Date(2026, 10, 9, 10, 0, 0).getTime() },
        { at: new Date(2026, 10, 9, 11, 0, 0).getTime() },
        { at: new Date(2026, 10, 9, 12, 0, 0).getTime() },
        { at: new Date(2026, 10, 9, 13, 0, 0).getTime() },
      ],
      jobHistory: [],
      mastery: {},
      checkInDates: {},
      now: TUESDAY,
    });

    // 周一：计划 4 题，做了 5 题 → 完成 4 + 额外 1
    expect(view.days[0].donePoints).toBe(4);
    expect(view.days[0].extraPoints).toBe(1);
    expect(view.days[0].fill).toBe(1);
    // 周二：纯手动任务直接勾满
    expect(view.days[1].doneTaskCount).toBe(1);
    expect(view.days[1].fill).toBe(1);

    expect(view.planPoints).toBe(6);
    expect(view.donePoints).toBe(6);
    expect(view.extraPoints).toBe(1);
    expect(view.taskCount).toBe(2);
    expect(view.doneTaskCount).toBe(2);
  });
});
