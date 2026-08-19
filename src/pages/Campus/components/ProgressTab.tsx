import { useMemo } from 'react';
import type { CampusJobData, JobCategory } from '@/types/campus-job';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_ALL,
  JOB_CATEGORY_LABELS,
  JOB_CATEGORY_ORDER,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { ProgressRaceChart } from './ProgressRaceChart';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProgressTabProps {
  jobs: CampusJobData[];
}

export function ProgressTab({ jobs }: ProgressTabProps) {
  const jobProgress = useCampusJobStore((s) => s.jobProgress);
  const { getProgress, getTrackedJobs } = useCampusJobStore();

  const trackedJobs = useMemo(
    () => getTrackedJobs(),
    [jobs, jobProgress, getTrackedJobs]
  );

  const stats = useMemo(() => {
    const counts = Object.fromEntries(
      APPLICATION_STATUS_ALL.map((s) => [s, 0])
    ) as Record<(typeof APPLICATION_STATUS_ALL)[number], number>;

    for (const job of trackedJobs) {
      const p = getProgress(job.id);
      if (p) counts[p.status]++;
    }
    return counts;
  }, [trackedJobs, getProgress]);

  const byCategory = useMemo(() => {
    const map = new Map<JobCategory, CampusJobData[]>();
    for (const cat of JOB_CATEGORY_ORDER) {
      map.set(cat, []);
    }
    for (const job of trackedJobs) {
      const cat = job.match.category;
      const list = map.get(cat) ?? [];
      list.push(job);
      map.set(cat, list);
    }
    return map;
  }, [trackedJobs]);

  const sortedForChart = useMemo(() => {
    return [...trackedJobs].sort((a, b) => {
      const catA = JOB_CATEGORY_ORDER.indexOf(a.match.category);
      const catB = JOB_CATEGORY_ORDER.indexOf(b.match.category);
      if (catA !== catB) return catA - catB;
      return a.basic.company.localeCompare(b.basic.company, 'zh-CN');
    });
  }, [trackedJobs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {APPLICATION_STATUS_ALL.map((status) => (
          <div key={status} className="surface-panel p-3 text-center">
            <div
              className="text-xl font-extrabold tabular-nums"
              style={{ color: APPLICATION_STATUS_COLORS[status] }}
            >
              {stats[status]}
            </div>
            <div className="text-[10px] font-bold text-ink-secondary mt-0.5">
              {APPLICATION_STATUS_LABELS[status]}
            </div>
          </div>
        ))}
      </div>

      <section>
        <h3 className="font-extrabold text-lg text-ink-primary mb-2">{'\u8fdb\u5ea6\u7ade\u8d5b\u56fe'}</h3>
        <p className="text-sm text-ink-secondary mb-4">
          {'\u6a2a\u5411\u5c55\u793a\u5404\u5c97\u4f4d\u5f53\u524d\u8fdb\u5ea6\uff0c\u7eb5\u8f74\u4e3a\u516c\u53f8/\u5c97\u4f4d\uff0c\u6a2a\u8f74\u4e3a\u6295\u9012\u9636\u6bb5'}
        </p>
        <ProgressRaceChart jobs={sortedForChart} getProgress={getProgress} />
      </section>

      <section>
        <h3 className="font-extrabold text-lg text-ink-primary mb-3">{'\u6309\u65b9\u5411\u5206\u7c7b'}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {JOB_CATEGORY_ORDER.map((cat) => {
            const catJobs = byCategory.get(cat) ?? [];
            if (catJobs.length === 0) return null;
            return (
              <div key={cat} className="surface-panel p-4">
                <h4 className="font-bold text-sm mb-2">{JOB_CATEGORY_LABELS[cat]}</h4>
                <ul className="space-y-1.5">
                  {catJobs.map((job) => {
                    const status = getProgress(job.id)?.status;
                    if (!status) return null;
                    const jobUrl = job.details.job_url;
                    const title = `${job.basic.company} · ${job.basic.position}`;
                    return (
                      <li key={job.id} className="flex items-center justify-between text-xs gap-2">
                        {jobUrl ? (
                          <a
                            href={jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`打开招聘页：${title}`}
                            className={cn(
                              'truncate flex-1 inline-flex items-center gap-1 font-semibold',
                              'text-[#1CB0F6] hover:underline'
                            )}
                          >
                            <span className="truncate">{title}</span>
                            <ExternalLink size={11} className="flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="truncate flex-1">{title}</span>
                        )}
                        <span
                          className="font-bold flex-shrink-0"
                          style={{ color: APPLICATION_STATUS_COLORS[status] }}
                        >
                          {APPLICATION_STATUS_LABELS[status]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
