import {
  APPLICATION_STATUS_ALL,
  APPLICATION_STATUS_LABELS,
  REJECT_REASON_ORDER,
  STAGE_DETAIL_STATUSES,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import type { ApplicationStatus, RejectReason } from '@/types/campus-job';
import type { AgentToolDefinition, ToolResult } from '../types';

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUS_ALL as string[]).includes(value);
}

function isRejectReason(value: string): value is RejectReason {
  return (REJECT_REASON_ORDER as string[]).includes(value);
}

function isStageDetailStatus(value: string): boolean {
  return (STAGE_DETAIL_STATUSES as string[]).includes(value);
}

/**
 * 写操作统一走「提案」：requiresConfirm 让 loop 只发 pending_action，
 * 用户确认后由 UI 调 execute 真正落库。
 */
export const setJobStatusTool: AgentToolDefinition = {
  name: 'setJobStatus',
  description:
    '把某个岗位的投递阶段更新为新状态（写操作，用户确认后才生效）。用户说“帮我标成一面/把这家标为挂了/这家终止了”时使用。jobId 来自 searchJobs 或 getApplicationProgress。注意：只改阶段，不会标记某场测评/面试是否已完成。',
  parameters: {
    type: 'object',
    properties: {
      jobId: { type: 'string', description: '岗位 id' },
      status: {
        type: 'string',
        enum: APPLICATION_STATUS_ALL,
        description: '目标阶段',
      },
      note: { type: 'string', description: '可选备注，写进状态历史' },
      rejectReason: {
        type: 'string',
        enum: REJECT_REASON_ORDER,
        description: '仅当 status 为 rejected 时使用，说明被刷在哪一步',
      },
    },
    required: ['jobId', 'status'],
    additionalProperties: false,
  },
  requiresConfirm: true,
  execute: (args): ToolResult => {
    const jobId = readString(args.jobId);
    const statusRaw = readString(args.status);
    const note = readString(args.note);
    const rejectRaw = readString(args.rejectReason);

    if (!jobId) {
      return { content: JSON.stringify({ error: '缺少 jobId' }), summary: '参数缺失', isError: true };
    }
    if (!statusRaw || !isApplicationStatus(statusRaw)) {
      return {
        content: JSON.stringify({ error: `status 非法：${statusRaw ?? '空'}` }),
        summary: '参数非法',
        isError: true,
      };
    }
    if (rejectRaw && !isRejectReason(rejectRaw)) {
      return {
        content: JSON.stringify({ error: `rejectReason 非法：${rejectRaw}` }),
        summary: '参数非法',
        isError: true,
      };
    }

    const store = useCampusJobStore.getState();
    const job = store.getJobById(jobId);
    if (!job) {
      return {
        content: JSON.stringify({ error: `未找到岗位 ${jobId}` }),
        summary: '岗位不存在',
        isError: true,
      };
    }

    const rejectReason = statusRaw === 'rejected' ? (rejectRaw as RejectReason | undefined) : undefined;
    store.setJobStatus(jobId, statusRaw, note, rejectReason);

    return {
      content: JSON.stringify({ ok: true, jobId, status: statusRaw, rejectReason: rejectReason ?? null }),
      summary: `${job.basic.company} · ${job.basic.position} → ${statusRaw}`,
    };
  },
};

/**
 * 标记「当前这场测评/面试」已完成：对应页面上 StageDetailEditor 的“已完成”，
 * 标记后该条不再计入「已过期 / 待办」，与进度竞赛图的计数实时同步。
 */
export const completeStageTool: AgentToolDefinition = {
  name: 'completeStage',
  description:
    '把某岗位某个阶段的测评/面试标记为「已完成」或取消完成（写操作，用户确认后才生效）。用户说“这条我参加过了/测评做完了/帮我把已过期的标成已完成/撤销完成”时使用。它只改这一阶段的完成状态，不改岗位阶段；改阶段请用 setJobStatus。',
  parameters: {
    type: 'object',
    properties: {
      jobId: { type: 'string', description: '岗位 id，来自 getStageReminders 或 getApplicationProgress' },
      status: {
        type: 'string',
        enum: STAGE_DETAIL_STATUSES,
        description: '要操作的阶段，缺省为该岗位当前阶段',
      },
      completed: {
        type: 'boolean',
        description: 'true 标记已完成（默认），false 取消完成',
      },
    },
    required: ['jobId'],
    additionalProperties: false,
  },
  requiresConfirm: true,
  execute: (args): ToolResult => {
    const jobId = readString(args.jobId);
    if (!jobId) {
      return { content: JSON.stringify({ error: '缺少 jobId' }), summary: '参数缺失', isError: true };
    }

    const store = useCampusJobStore.getState();
    const job = store.getJobById(jobId);
    if (!job) {
      return {
        content: JSON.stringify({ error: `未找到岗位 ${jobId}` }),
        summary: '岗位不存在',
        isError: true,
      };
    }

    const progress = store.getProgress(jobId);
    if (!progress) {
      return {
        content: JSON.stringify({ error: '该岗位还没有投递记录，请先记录当前阶段' }),
        summary: '没有投递记录',
        isError: true,
      };
    }

    const statusRaw = readString(args.status);
    const status: ApplicationStatus = statusRaw ? (statusRaw as ApplicationStatus) : progress.status;
    if (!isApplicationStatus(status) || !isStageDetailStatus(status)) {
      return {
        content: JSON.stringify({ error: `status 非法：${statusRaw ?? status}` }),
        summary: '参数非法',
        isError: true,
      };
    }

    const existing = progress.stageDetails?.[status];
    const completed = args.completed === undefined ? true : args.completed === true;
    // setStageDetail 是整体替换，必须把已有的时间与链接带上，否则会被清掉
    store.setStageDetail(jobId, status, {
      link: existing?.link,
      scheduledAt: existing?.scheduledAt,
      completed,
    });

    return {
      content: JSON.stringify({
        ok: true,
        jobId,
        company: job.basic.company,
        position: job.basic.position,
        status,
        statusLabel: APPLICATION_STATUS_LABELS[status],
        completed,
      }),
      summary: `${job.basic.company} · ${APPLICATION_STATUS_LABELS[status]}：${
        completed ? '已标记完成' : '已取消完成'
      }`,
    };
  },
};
