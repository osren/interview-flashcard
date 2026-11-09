import { APPLICATION_STATUS_ALL, REJECT_REASON_ORDER } from '@/data/campus-jobs';
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

/**
 * 写操作统一走「提案」：requiresConfirm 让 loop 只发 pending_action，
 * 用户确认后由 UI 调 execute 真正落库。
 */
export const setJobStatusTool: AgentToolDefinition = {
  name: 'setJobStatus',
  description:
    '把某个岗位的投递阶段更新为新状态（写操作，用户确认后才生效）。用户说“帮我标成一面/把这家标为挂了”时使用。jobId 来自 searchJobs 或 getApplicationProgress。',
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
