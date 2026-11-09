import type { ApplicationStatus, CampusJobData, JobProgress } from '@/types/campus-job';
import { STAGE_DETAIL_STATUSES } from '@/data/campus-jobs';

/** 待办/过期/已完成提醒覆盖的阶段（不含 Offer） */
export const REMINDER_STATUSES: ApplicationStatus[] = STAGE_DETAIL_STATUSES.filter(
  (status) => status !== 'offer'
);

export type StageReminderKind = 'expired' | 'todo' | 'completed';

export interface StageReminderItem {
  key: string;
  jobId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  link?: string;
  scheduledAt?: string;
  kind: StageReminderKind;
}

const KIND_ORDER: Record<StageReminderKind, number> = {
  expired: 0,
  todo: 1,
  completed: 2,
};

export function parseStageTime(value?: string): number | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const parsed = Date.parse(value.slice(0, 16));
    return Number.isNaN(parsed) ? null : parsed;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * 提醒口径的单一来源：只有「当前阶段」的详情参与统计，已终止岗位不计入。
 * 页面（RaceChartReminders）与 Agent 工具都调用这里，避免两边算出不同的数字。
 */
export function collectStageReminders(
  jobs: CampusJobData[],
  getProgress: (jobId: string) => JobProgress | undefined,
  now = Date.now()
): StageReminderItem[] {
  const items: StageReminderItem[] = [];

  for (const job of jobs) {
    const progress = getProgress(job.id);
    // 已终止：不进入过期/待办/已完成，仅由终止原因分布统计
    if (!progress || progress.status === 'rejected') continue;
    if (!REMINDER_STATUSES.includes(progress.status)) continue;

    const detail = progress.stageDetails?.[progress.status];
    if (!detail?.link && !detail?.scheduledAt && !detail?.completed) continue;

    const timeMs = parseStageTime(detail.scheduledAt);
    let kind: StageReminderKind;
    if (detail.completed) {
      kind = 'completed';
    } else if (timeMs !== null && timeMs < now) {
      kind = 'expired';
    } else {
      kind = 'todo';
    }

    items.push({
      key: `${job.id}-${progress.status}`,
      jobId: job.id,
      company: job.basic.company,
      position: job.basic.position,
      status: progress.status,
      link: detail.link,
      scheduledAt: detail.scheduledAt,
      kind,
    });
  }

  return items.sort((a, b) => {
    if (a.kind !== b.kind) return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    const ta = parseStageTime(a.scheduledAt) ?? Number.MAX_SAFE_INTEGER;
    const tb = parseStageTime(b.scheduledAt) ?? Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    return a.company.localeCompare(b.company, 'zh-CN');
  });
}

export const STAGE_REMINDER_LABELS: Record<StageReminderKind, string> = {
  expired: '已过期',
  todo: '待办',
  completed: '已完成',
};

/** 按自然日算差额，过期为正数：昨天 17:00 的面试，今天就记 1 天，而不是 0 天 */
export function stageOverdueDays(scheduledAt: string | undefined, now = Date.now()): number | null {
  const timeMs = parseStageTime(scheduledAt);
  if (timeMs === null) return null;
  const startOfDay = (ms: number) => {
    const date = new Date(ms);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };
  return Math.floor((startOfDay(now) - startOfDay(timeMs)) / (24 * 60 * 60 * 1000));
}
