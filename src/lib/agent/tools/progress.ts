import { useCampusJobStore } from '@/store/useCampusJobStore';
import {
  APPLICATION_STATUS_ALL,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  REJECT_REASON_LABELS,
} from '@/data/campus-jobs';
import type { ApplicationStatus, JobProgress, StageDetail } from '@/types/campus-job';
import type { AgentToolDefinition, ToolResult } from '../types';

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readLimit(value: unknown): number {
  const raw = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(raw), MAX_LIMIT);
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUS_ALL as string[]).includes(value);
}

/** 只输出有时间/链接的阶段，避免把空对象塞给模型 */
function compactStageDetails(details?: JobProgress['stageDetails']): Record<string, StageDetail> {
  if (!details) return {};
  const result: Record<string, StageDetail> = {};
  for (const [status, detail] of Object.entries(details)) {
    if (!detail) continue;
    if (!detail.link && !detail.scheduledAt && !detail.completed) continue;
    result[APPLICATION_STATUS_LABELS[status as ApplicationStatus] ?? status] = detail;
  }
  return result;
}

export const getApplicationProgressTool: AgentToolDefinition = {
  name: 'getApplicationProgress',
  description:
    '查询秋招投递进度：按公司名/职位关键词/当前状态筛选，返回每个岗位的当前阶段、拒信原因、最近状态变更时间与测评面试时间链接。用户问“我投了哪些/某公司到哪一步了/进度如何”时使用。',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '公司名或职位关键词，支持部分匹配' },
      status: {
        type: 'string',
        description: '只看某一阶段，取值同投递状态机（如 ai_interview、interview_1、offer、rejected）',
      },
      limit: { type: 'number', description: '返回条数，默认 8，最多 20' },
    },
    additionalProperties: false,
  },
  execute: (args): ToolResult => {
    const query = readString(args.query)?.toLowerCase();
    const statusRaw = readString(args.status);
    const status = statusRaw && isApplicationStatus(statusRaw) ? statusRaw : undefined;
    const limit = readLimit(args.limit);

    const store = useCampusJobStore.getState();
    const tracked = store.getTrackedJobs();

    const matched = tracked.filter((job) => {
      const progress = store.getProgress(job.id);
      if (!progress) return false;
      if (status && progress.status !== status) return false;
      if (!query) return true;
      return (
        job.basic.company.toLowerCase().includes(query) ||
        job.basic.position.toLowerCase().includes(query)
      );
    });

    const sorted = [...matched].sort((a, b) => {
      const pa = store.getProgress(a.id);
      const pb = store.getProgress(b.id);
      const idxA = pa ? APPLICATION_STATUS_ORDER.indexOf(pa.status) : -1;
      const idxB = pb ? APPLICATION_STATUS_ORDER.indexOf(pb.status) : -1;
      if (idxA !== idxB) return idxB - idxA;
      return a.basic.company.localeCompare(b.basic.company, 'zh-CN');
    });

    const items = sorted.slice(0, limit).map((job) => {
      const progress = store.getProgress(job.id);
      return {
        jobId: job.id,
        company: job.basic.company,
        position: job.basic.position,
        status: progress?.status,
        statusLabel: progress ? APPLICATION_STATUS_LABELS[progress.status] : undefined,
        rejectReason: progress?.rejectReason
          ? REJECT_REASON_LABELS[progress.rejectReason] ?? progress.rejectReason
          : undefined,
        updatedAt: progress?.updatedAt,
        stageDetails: compactStageDetails(progress?.stageDetails),
        historyCount: progress?.statusHistory.length ?? 0,
      };
    });

    return {
      content: JSON.stringify({ total: matched.length, returned: items.length, items }),
      summary: `投递记录命中 ${matched.length} 条，返回 ${items.length} 条`,
    };
  },
};

export const getProgressStatsTool: AgentToolDefinition = {
  name: 'getProgressStats',
  description:
    '统计秋招投递整体情况：总投递数、各阶段数量（含 AI 面试、一面等）、已录用与已终止数量。用户问“我整体投递情况如何/卡在哪个阶段”时使用，先调它再看细节。',
  parameters: { type: 'object', properties: {}, additionalProperties: false },
  execute: (): ToolResult => {
    const store = useCampusJobStore.getState();
    const tracked = store.getTrackedJobs();

    const counts: Record<string, number> = {};
    for (const status of APPLICATION_STATUS_ORDER) counts[status] = 0;
    for (const job of tracked) {
      const progress = store.getProgress(job.id);
      if (!progress) continue;
      counts[progress.status] = (counts[progress.status] ?? 0) + 1;
    }

    const byLabel: Record<string, number> = {};
    for (const status of APPLICATION_STATUS_ORDER) {
      byLabel[APPLICATION_STATUS_LABELS[status]] = counts[status] ?? 0;
    }

    // ORDER 本身不含 rejected，这里只排除已录用，得到「仍在流程中」的数量
    const inProgress = APPLICATION_STATUS_ORDER.filter((status) => status !== 'offer').reduce(
      (sum, status) => sum + (counts[status] ?? 0),
      0
    );
    const rejected = counts.rejected ?? 0;

    return {
      content: JSON.stringify({
        total: tracked.length,
        inProgress,
        offer: counts.offer ?? 0,
        rejected,
        byStage: byLabel,
      }),
      summary: `共 ${tracked.length} 条投递，在进度 ${inProgress}，已终止 ${rejected}`,
    };
  },
};
