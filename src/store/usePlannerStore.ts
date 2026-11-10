import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  clampTaskTarget,
  type PlannerAutoSource,
  type PlannerTask,
} from '@/lib/planner/week';

interface PlannerStoreState {
  tasks: PlannerTask[];
  addTask: (input: {
    weekStart: string;
    dateKey: string;
    title: string;
    target: number;
    unit: string;
    autoSource?: PlannerAutoSource | null;
  }) => void;
  toggleTask: (id: string) => void;
  bumpTask: (id: string, delta: number) => void;
  removeTask: (id: string) => void;
}

export const usePlannerStore = create<PlannerStoreState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: ({ weekStart, dateKey, title, target, unit, autoSource = null }) => {
        const trimmed = title.trim();
        if (!trimmed || !weekStart || !dateKey) return;
        set((state) => {
          // 同一周同一种自动来源只能有一条任务，否则同一批题会被算两遍
          const sourceTaken =
            autoSource !== null &&
            state.tasks.some((task) => task.weekStart === weekStart && task.autoSource === autoSource);
          const task: PlannerTask = {
            id: crypto.randomUUID(),
            weekStart,
            dateKey,
            title: trimmed,
            target: clampTaskTarget(target),
            unit: unit || '项',
            manualDone: 0,
            checked: false,
            autoSource: sourceTaken ? null : autoSource,
            createdAt: Date.now(),
          };
          return { tasks: [...state.tasks, task] };
        });
      },

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, checked: !task.checked } : task
          ),
        })),

      bumpTask: (id, delta) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const next = Math.min(task.target, Math.max(0, task.manualDone + delta));
            return {
              ...task,
              manualDone: next,
              // 手动推满就顺手勾上，省一次点击
              checked: next >= task.target ? true : task.checked,
            };
          }),
        })),

      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
    }),
    {
      name: 'planner-storage',
      // 只存计划本身，完成量每次从作答/投递记录重算——存了反而会和真实记录对不上
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
