import { beforeEach, describe, expect, it } from 'vitest';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import type { CampusJobData, JobTier } from '@/types/campus-job';
import { setJobStatusTool } from '../tools/actions';
import { agentTools, campusJobTools, campusJobWriteTools } from '../tools';
import type { ToolResult } from '../types';

function makeJob(id: string, company: string, position: string): CampusJobData {
  return {
    id,
    source: 'builtin',
    basic: { position, company, location: '上海' },
    details: { job_url: null, company_logo: null, salaryMin: null, salaryMax: null },
    extended: {
      graduation_year: '2027',
      recruitment_batch: '秋招',
      employment_type: '校招',
      job_category: 'frontend',
      jd_responsibilities: [],
      jd_requirements: [],
      jd_summary: '',
      requirements_summary: '',
      tech_stack: [],
      education: '本科',
      major: '计算机',
    },
    match: { qualified: true, category: 'frontend', batch_type: '秋招', confidence: 0.8, reason: 'ok' },
    tier: 'A' as JobTier,
  };
}

async function run(args: Record<string, unknown>): Promise<ToolResult> {
  const result = await setJobStatusTool.execute(args, {});
  return result;
}

beforeEach(() => {
  useCampusJobStore.setState({
    catalogJobs: [makeJob('j1', '字节跳动', '前端开发')],
    customJobs: [],
    customCompanies: [],
    hiddenJobIds: [],
    jobProgress: {},
    lastSelectedJobId: null,
  });
});

describe('setJobStatus（确认式写操作）', () => {
  it('声明为需要用户确认', () => {
    expect(setJobStatusTool.requiresConfirm).toBe(true);
  });

  it('确认后写入状态历史', async () => {
    const result = await run({ jobId: 'j1', status: 'ai_interview', note: '约了周五' });
    expect(result.isError).toBeFalsy();
    const progress = useCampusJobStore.getState().getProgress('j1');
    expect(progress?.status).toBe('ai_interview');
    expect(progress?.statusHistory.some((entry) => entry.note === '约了周五')).toBe(true);
  });

  it('标记为已终止时带上拒信原因', async () => {
    await run({ jobId: 'j1', status: 'rejected', rejectReason: 'ai_interview_fail' });
    const progress = useCampusJobStore.getState().getProgress('j1');
    expect(progress?.status).toBe('rejected');
    expect(progress?.rejectReason).toBe('ai_interview_fail');
  });

  it('非 rejected 状态忽略 rejectReason', async () => {
    await run({ jobId: 'j1', status: 'interview_1', rejectReason: 'hr_fail' });
    const progress = useCampusJobStore.getState().getProgress('j1');
    expect(progress?.status).toBe('interview_1');
    expect(progress?.rejectReason).toBeUndefined();
  });

  it('非法 status 直接报错且不落库', async () => {
    const result = await run({ jobId: 'j1', status: 'not_a_status' });
    expect(result.isError).toBe(true);
    expect(useCampusJobStore.getState().getProgress('j1')).toBeUndefined();
  });

  it('非法 rejectReason 直接报错且不落库', async () => {
    const result = await run({ jobId: 'j1', status: 'rejected', rejectReason: 'bad_reason' });
    expect(result.isError).toBe(true);
    expect(useCampusJobStore.getState().getProgress('j1')).toBeUndefined();
  });

  it('岗位不存在时报错', async () => {
    const result = await run({ jobId: 'no-such', status: 'applied' });
    expect(result.isError).toBe(true);
  });

  it('缺少参数时报错', async () => {
    const result = await run({});
    expect(result.isError).toBe(true);
  });
});

describe('工具集合', () => {
  it('只读与写工具分开暴露，并合并为 agentTools', () => {
    expect(campusJobTools.map((tool) => tool.name)).toEqual([
      'getProgressStats',
      'searchJobs',
      'getJobDetail',
      'getApplicationProgress',
    ]);
    expect(campusJobWriteTools.map((tool) => tool.name)).toEqual(['setJobStatus']);
    expect(agentTools).toHaveLength(5);
    expect(agentTools.filter((tool) => tool.requiresConfirm)).toHaveLength(1);
  });

  it('所有工具都有 name、description 和 object 类型的 parameters', () => {
    for (const tool of agentTools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.parameters.type).toBe('object');
    }
  });
});
