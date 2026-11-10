import { beforeEach, describe, expect, it } from 'vitest';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { buildPlannerWeek } from '../week';

/** 从真实 store 里拍平出状态历史，和页面传给 buildPlannerWeek 的完全一致 */
function jobHistoryFromStore() {
  const { jobProgress } = useCampusJobStore.getState();
  return Object.entries(jobProgress).flatMap(([jobId, progress]) =>
    (progress?.statusHistory ?? []).map((entry) => ({
      jobId,
      status: String(entry.status),
      at: entry.at,
    }))
  );
}

function buildView() {
  return buildPlannerWeek({
    tasks: [],
    attempts: [],
    jobHistory: jobHistoryFromStore(),
    mastery: {},
    checkInDates: {},
    now: new Date(),
  });
}

beforeEach(() => {
  useCampusJobStore.setState({ jobProgress: {}, customJobs: [], catalogJobs: [] });
});

describe('岗位投递自动统计', () => {
  it('新增岗位并标为已投递，会被计进本周投递数', () => {
    const store = useCampusJobStore.getState();
    for (const company of ['A 公司', 'B 公司', 'C 公司']) {
      const jobId = store.addCustomJob({ company, position: '前端开发', location: '重庆' });
      store.setJobStatus(jobId, 'applied');
    }

    expect(buildView().auto.job).toBe(3);
  });

  it('只新增岗位、没标状态时不计投递', () => {
    const store = useCampusJobStore.getState();
    store.addCustomJob({ company: 'D 公司', position: '前端开发', location: '重庆' });
    store.addCustomJob({ company: 'E 公司', position: '后端开发', location: '重庆' });

    expect(buildView().auto.job).toBe(0);
  });

  it('同一岗位状态回退后再置为已投递，只算一次投递', () => {
    const store = useCampusJobStore.getState();
    const jobId = store.addCustomJob({ company: 'F 公司', position: '前端开发', location: '重庆' });
    store.setJobStatus(jobId, 'applied');
    store.setJobStatus(jobId, 'written_tech');
    store.setJobStatus(jobId, 'applied');

    expect(buildView().auto.job).toBe(1);
  });

  it('非投递阶段的状态变更不计入投递数', () => {
    const store = useCampusJobStore.getState();
    const jobId = store.addCustomJob({ company: 'G 公司', position: '前端开发', location: '重庆' });
    store.setJobStatus(jobId, 'written_tech');
    store.setJobStatus(jobId, 'interview_1');

    expect(buildView().auto.job).toBe(0);
  });
});
