import { beforeEach, describe, expect, it } from 'vitest';
import { APPLICATION_STATUS_LABELS, REJECT_REASON_LABELS } from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import type { CampusJobData, JobCategory, JobTier } from '@/types/campus-job';
import { getJobDetailTool, searchJobsTool } from '../tools/jobs';
import {
  getApplicationProgressTool,
  getProgressStatsTool,
  getStageRemindersTool,
} from '../tools/progress';
import type { ToolResult } from '../types';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** 生成 'YYYY-MM-DDTHH:mm' 本地时间，避免测试数据写死日期后随时间失效 */
function stageTime(offsetDays: number, hour = 10): string {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:00`;
}

function makeJob(
  id: string,
  company: string,
  position: string,
  tier: JobTier,
  category: JobCategory
): CampusJobData {
  return {
    id,
    source: 'builtin',
    basic: { position, company, location: '上海' },
    details: {
      job_url: `https://jobs.example.com/${id}`,
      company_logo: null,
      salaryMin: 20,
      salaryMax: 35,
    },
    extended: {
      graduation_year: '2027',
      recruitment_batch: '秋招',
      employment_type: '校招',
      job_category: category,
      jd_responsibilities: ['负责前端架构', '维护组件库'],
      jd_requirements: ['熟悉 React', '熟悉 TypeScript'],
      jd_summary: '前端开发',
      requirements_summary: '本科以上',
      tech_stack: ['React', 'TypeScript', 'Vite'],
      education: '本科',
      major: '计算机',
    },
    match: { qualified: true, category, batch_type: '秋招', confidence: 0.9, reason: '技术栈匹配' },
    tier,
  };
}

interface ToolPayload {
  total?: number;
  returned?: number;
  offer?: number;
  rejected?: number;
  inProgress?: number;
  items: Array<Record<string, unknown>>;
  byStage?: Record<string, number>;
  [key: string]: unknown;
}

async function parse(result: ToolResult | Promise<ToolResult>): Promise<ToolPayload> {
  const resolved = await result;
  return JSON.parse(resolved.content) as ToolPayload;
}

function seedStore() {
  const store = useCampusJobStore.getState();
  store.setCatalogJobs(
    [
      makeJob('j1', '字节跳动', '前端开发工程师', 'S', 'frontend'),
      makeJob('j2', '腾讯', 'AI 应用开发', 'A', 'ai_app'),
      makeJob('j3', '美团', '前端开发', 'B', 'frontend'),
    ],
    'local'
  );
  store.setJobStatus('j1', 'ai_interview', '约了周五 AI 面');
  store.setJobStatus('j2', 'rejected', 'AI 面挂了', 'ai_interview_fail');
  store.setJobStatus('j3', 'offer');
  store.setStageDetail('j1', 'ai_interview', {
    scheduledAt: stageTime(2),
    link: 'https://meeting.example.com/x',
    completed: false,
  });
}

beforeEach(() => {
  useCampusJobStore.setState({
    catalogJobs: [],
    customJobs: [],
    customCompanies: [],
    hiddenJobIds: [],
    jobProgress: {},
    lastSelectedJobId: null,
  });
});

describe('searchJobs', () => {
  beforeEach(seedStore);

  it('按公司名部分匹配', async () => {
    const result = await parse(searchJobsTool.execute({ query: '腾讯' }, {}));
    expect(result.total).toBe(1);
    expect(result.items[0].company).toBe('腾讯');
  });

  it('按职位关键词匹配', async () => {
    const result = await parse(searchJobsTool.execute({ query: '前端' }, {}));
    expect(result.total).toBe(2);
  });

  it('按评级筛选', async () => {
    const result = await parse(searchJobsTool.execute({ tier: 'S' }, {}));
    expect(result.total).toBe(1);
    expect(result.items[0].jobId).toBe('j1');
  });

  it('按岗位类别筛选', async () => {
    const result = await parse(searchJobsTool.execute({ category: 'frontend' }, {}));
    expect(result.total).toBe(2);
  });

  it('limit 超过上限被夹紧，且不影响 total', async () => {
    const result = await parse(searchJobsTool.execute({ limit: 999 }, {}));
    expect(result.returned).toBe(3);
    expect(result.total).toBe(3);
  });

  it('无查询条件时按 tier 排序 S > A > B', async () => {
    const result = await parse(searchJobsTool.execute({}, {}));
    expect(result.items.map((item) => item.jobId)).toEqual(['j1', 'j2', 'j3']);
  });

  it('无命中时返回 total 0', async () => {
    const result = await parse(searchJobsTool.execute({ query: '不存在的公司' }, {}));
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });
});

describe('getJobDetail', () => {
  beforeEach(seedStore);

  it('返回岗位详情与投递链接', async () => {
    const result = await parse(getJobDetailTool.execute({ jobId: 'j1' }, {}));
    expect(result.company).toBe('字节跳动');
    expect(result.techStack).toHaveLength(3);
    expect(result.jobUrl).toBe('https://jobs.example.com/j1');
  });

  it('jobId 不存在时返回错误', async () => {
    const result = await getJobDetailTool.execute({ jobId: 'no-such-job' }, {});
    expect(result.isError).toBe(true);
    expect(result.content).toContain('未找到岗位');
  });

  it('缺少 jobId 时返回错误', async () => {
    const result = await getJobDetailTool.execute({}, {});
    expect(result.isError).toBe(true);
  });
});

describe('getApplicationProgress', () => {
  beforeEach(seedStore);

  it('只返回有进度的岗位，并按阶段倒序', async () => {
    const result = await parse(getApplicationProgressTool.execute({}, {}));
    expect(result.total).toBe(3);
    expect(result.items.map((item) => item.jobId)).toEqual(['j3', 'j1', 'j2']);
  });

  it('输出阶段标签、面试时间与链接', async () => {
    const result = await parse(getApplicationProgressTool.execute({ status: 'ai_interview' }, {}));
    expect(result.total).toBe(1);
    const item = result.items[0];
    const details = item.stageDetails as Record<string, unknown>;
    expect(item.statusLabel).toBe(APPLICATION_STATUS_LABELS.ai_interview);
    expect(details[APPLICATION_STATUS_LABELS.ai_interview]).toMatchObject({
      scheduledAt: stageTime(2),
      link: 'https://meeting.example.com/x',
      kind: 'todo',
      kindLabel: '待办',
    });
  });

  it('已终止岗位输出拒信原因', async () => {
    const result = await parse(getApplicationProgressTool.execute({ status: 'rejected' }, {}));
    expect(result.total).toBe(1);
    expect(result.items[0].rejectReason).toBe(REJECT_REASON_LABELS.ai_interview_fail);
    expect(result.items[0].status).toBe('rejected');
  });

  it('按公司名筛选', async () => {
    const result = await parse(getApplicationProgressTool.execute({ query: '美团' }, {}));
    expect(result.total).toBe(1);
    expect(result.items[0].jobId).toBe('j3');
  });

  it('未跟踪的岗位不出现', async () => {
    const store = useCampusJobStore.getState();
    store.setCatalogJobs(
      [...store.getAllJobs(), makeJob('j4', '阿里', '前端', 'A', 'frontend')],
      'local'
    );
    const result = await parse(getApplicationProgressTool.execute({}, {}));
    expect(result.total).toBe(3);
    expect(result.items.map((item) => item.jobId)).not.toContain('j4');
  });
});

describe('getStageReminders', () => {
  beforeEach(() => {
    const store = useCampusJobStore.getState();
    store.setCatalogJobs(
      [
        makeJob('r1', '腾讯音乐', '软件开发-前端开发方向', 'A', 'frontend'),
        makeJob('r2', '360', '全栈开发工程师', 'B', 'frontend'),
        makeJob('r3', '小红书', '产品工程师', 'A', 'other'),
        makeJob('r4', '华为', '通用软件', 'S', 'frontend'),
        makeJob('r5', '京东', '前端开发工程师', 'A', 'frontend'),
      ],
      'local'
    );
    // 已过期：一面在 3 天前且未完成
    store.setJobStatus('r1', 'interview_1');
    store.setStageDetail('r1', 'interview_1', { scheduledAt: stageTime(-3, 17), completed: false });
    // 待办：技术测评在 3 天后
    store.setJobStatus('r2', 'written_tech');
    store.setStageDetail('r2', 'written_tech', { scheduledAt: stageTime(3, 15), completed: false });
    // 已完成
    store.setJobStatus('r3', 'written_tech');
    store.setStageDetail('r3', 'written_tech', { scheduledAt: stageTime(-5), completed: true });
    // 当前阶段没有时间安排，不计入
    store.setJobStatus('r4', 'ai_interview');
    // 已终止岗位即使有时间，也不计入
    store.setJobStatus('r5', 'rejected', undefined, 'written_tech_fail');
    store.setStageDetail('r5', 'written_tech', { scheduledAt: stageTime(-2), completed: false });
  });

  it('按页面口径统计，已终止岗位不计入', async () => {
    const result = await parse(getStageRemindersTool.execute({}, {}));
    expect(result.expiredCount).toBe(1);
    expect(result.todoCount).toBe(1);
    expect(result.completedCount).toBe(1);
    expect(result.matched).toBe(3);
    expect(result.items).toHaveLength(3);
  });

  it('返回当前时间，模型不需要自己推算', async () => {
    const result = await parse(getStageRemindersTool.execute({}, {}));
    expect(typeof result.now).toBe('string');
    expect(new Date(result.now as string).toString()).not.toBe('Invalid Date');
  });

  it('只查已过期时带出阶段、状态与链接', async () => {
    const result = await parse(getStageRemindersTool.execute({ kind: 'expired' }, {}));
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      jobId: 'r1',
      company: '腾讯音乐',
      stage: APPLICATION_STATUS_LABELS.interview_1,
      kind: 'expired',
      kindLabel: '已过期',
    });
    expect(result.items[0].overdueDays).toBe(3);
  });

  it('按关键词筛选，计数仍按全量口径', async () => {
    const result = await parse(getStageRemindersTool.execute({ query: '360' }, {}));
    expect(result.matched).toBe(1);
    expect(result.items[0].kind).toBe('todo');
    expect(result.expiredCount).toBe(1);
  });

  it('没有符合条件的提醒时返回空列表', async () => {
    const result = await parse(
      getStageRemindersTool.execute({ kind: 'completed', query: '字节' }, {})
    );
    expect(result.matched).toBe(0);
    expect(result.items).toEqual([]);
    expect(result.note).toBe('没有符合条件的提醒');
  });
});

describe('getProgressStats', () => {
  beforeEach(seedStore);

  it('统计各阶段、已录用与已终止', async () => {
    const result = await parse(getProgressStatsTool.execute({}, {}));
    expect(result.total).toBe(3);
    expect(result.offer).toBe(1);
    expect(result.rejected).toBe(1);
    expect(result.inProgress).toBe(1);
    expect(result.byStage?.[APPLICATION_STATUS_LABELS.ai_interview]).toBe(1);
  });

  it('无投递记录时全部为 0', async () => {
    useCampusJobStore.setState({
      catalogJobs: [],
      customJobs: [],
      jobProgress: {},
      hiddenJobIds: [],
    });
    const result = await parse(getProgressStatsTool.execute({}, {}));
    expect(result.total).toBe(0);
    expect(result.offer).toBe(0);
    expect(result.inProgress).toBe(0);
  });
});
