import { useCampusJobStore } from '@/store/useCampusJobStore';
import type { JobCategory, JobTier } from '@/types/campus-job';
import type { AgentToolDefinition, ToolResult } from '../types';

const TIER_RANK: Record<JobTier, number> = { S: 0, A: 1, B: 2, edge: 3, skip: 4 };
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readLimit(value: unknown): number {
  const raw = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(raw), MAX_LIMIT);
}

export const searchJobsTool: AgentToolDefinition = {
  name: 'searchJobs',
  description:
    '按公司名、职位关键词、评级档位或岗位类别检索秋招岗位库。返回命中总数与最匹配的若干条（含投递链接、地点、评级、匹配原因）。用户问“有哪些岗位/某公司投什么”时使用。',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '公司名或职位关键词，支持部分匹配' },
      tier: { type: 'string', enum: ['S', 'A', 'B', 'edge', 'skip'], description: '岗位评级档位' },
      category: {
        type: 'string',
        enum: ['frontend', 'agent_dev', 'ai_fullstack', 'ai_app', 'other'],
        description: '岗位类别',
      },
      limit: { type: 'number', description: '返回条数，默认 5，最多 10' },
    },
    additionalProperties: false,
  },
  execute: (args): ToolResult => {
    const query = readString(args.query)?.toLowerCase();
    const tier = readString(args.tier) as JobTier | undefined;
    const category = readString(args.category) as JobCategory | undefined;
    const limit = readLimit(args.limit);

    const all = useCampusJobStore.getState().getAllJobs();
    const matched = all.filter((job) => {
      if (tier && job.tier !== tier) return false;
      if (category && job.extended.job_category !== category) return false;
      if (!query) return true;
      return (
        job.basic.company.toLowerCase().includes(query) ||
        job.basic.position.toLowerCase().includes(query)
      );
    });

    const sorted = [...matched].sort((a, b) => {
      const rankDiff = (TIER_RANK[a.tier] ?? 9) - (TIER_RANK[b.tier] ?? 9);
      if (rankDiff !== 0) return rankDiff;
      return a.basic.company.localeCompare(b.basic.company, 'zh-CN');
    });

    const items = sorted.slice(0, limit).map((job) => ({
      jobId: job.id,
      company: job.basic.company,
      position: job.basic.position,
      location: job.basic.location,
      tier: job.tier,
      qualified: job.match.qualified,
      category: job.extended.job_category,
      techStack: job.extended.tech_stack.slice(0, 6),
      matchReason: job.match.reason,
      jobUrl: job.details.job_url,
    }));

    return {
      content: JSON.stringify({ total: matched.length, returned: items.length, items }),
      summary: `岗位库命中 ${matched.length} 个，返回前 ${items.length} 个`,
    };
  },
};

export const getJobDetailTool: AgentToolDefinition = {
  name: 'getJobDetail',
  description:
    '查看单个岗位的完整信息：JD 职责与要求、技术栈、学历专业要求、匹配原因与投递链接。需要基于具体岗位回答或准备投递时使用，jobId 可由 searchJobs 获得。',
  parameters: {
    type: 'object',
    properties: {
      jobId: { type: 'string', description: '岗位 id，来自 searchJobs 返回' },
    },
    required: ['jobId'],
    additionalProperties: false,
  },
  execute: (args): ToolResult => {
    const jobId = readString(args.jobId);
    if (!jobId) {
      return { content: JSON.stringify({ error: '缺少 jobId' }), summary: '参数缺失', isError: true };
    }

    const job = useCampusJobStore.getState().getJobById(jobId);
    if (!job) {
      return {
        content: JSON.stringify({ error: `未找到岗位 ${jobId}，请先用 searchJobs 检索` }),
        summary: '岗位不存在',
        isError: true,
      };
    }

    return {
      content: JSON.stringify({
        jobId: job.id,
        company: job.basic.company,
        position: job.basic.position,
        location: job.basic.location,
        tier: job.tier,
        salary:
          job.details.salaryMin || job.details.salaryMax
            ? { min: job.details.salaryMin, max: job.details.salaryMax }
            : null,
        jobUrl: job.details.job_url,
        match: job.match,
        graduationYear: job.extended.graduation_year,
        batch: job.extended.recruitment_batch,
        education: job.extended.education,
        major: job.extended.major,
        techStack: job.extended.tech_stack,
        responsibilities: job.extended.jd_responsibilities.slice(0, 8),
        requirements: job.extended.jd_requirements.slice(0, 8),
        jdSummary: job.extended.jd_summary,
        requirementsSummary: job.extended.requirements_summary,
      }),
      summary: `${job.basic.company} · ${job.basic.position} 详情`,
    };
  },
};
