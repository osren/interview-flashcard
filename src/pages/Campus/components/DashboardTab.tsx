import { useMemo } from 'react';
import type { CampusJobData, JobTier } from '@/types/campus-job';
import { TIER_CONFIG, JOB_CATEGORY_LABELS } from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { ExternalLink, Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DashboardTabProps {
  jobs: CampusJobData[];
}

const TIER_ORDER: JobTier[] = ['S', 'A', 'B', 'edge'];

function isJobApplied(jobId: string, getProgress: ReturnType<typeof useCampusJobStore.getState>['getProgress']) {
  const progress = getProgress(jobId);
  return Boolean(progress && progress.statusHistory.length > 0);
}

function TierSection({
  tier,
  jobs,
  getProgress,
}: {
  tier: JobTier;
  jobs: CampusJobData[];
  getProgress: ReturnType<typeof useCampusJobStore.getState>['getProgress'];
}) {
  const config = TIER_CONFIG[tier];
  const tierJobs = jobs.filter((j) => j.tier === tier);
  if (tierJobs.length === 0) return null;

  const appliedCount = tierJobs.filter((j) => isJobApplied(j.id, getProgress)).length;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xl">{config.emoji}</span>
        <h3 className="font-extrabold text-lg text-ink-primary">{config.label}</h3>
        <span className="text-sm font-bold text-[#58CC02] tabular-nums">
          {appliedCount}/{tierJobs.length}
        </span>
        <span className="text-xs text-ink-secondary">已投递/总数</span>
        <span className="text-xs text-ink-secondary ml-1">{'\u00b7'} {config.description}</span>
      </div>
      <div className="surface-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-left">
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u516c\u53f8'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u5c97\u4f4d'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u5730\u70b9'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u7c7b\u578b'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">conf</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u5339\u914d\u7406\u7531'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u94fe\u63a5'}</th>
            </tr>
          </thead>
          <tbody>
            {tierJobs
              .sort((a, b) => b.match.confidence - a.match.confidence)
              .map((job) => (
                <tr key={job.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-bold">{job.basic.company}</td>
                  <td className="px-4 py-3">{job.basic.position}</td>
                  <td className="px-4 py-3 text-ink-secondary">{job.basic.location}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-lg bg-[#eefbf0] text-[#58CC02] text-xs font-bold">
                      {JOB_CATEGORY_LABELS[job.match.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums">
                    {job.match.confidence.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary max-w-xs truncate" title={job.match.reason}>
                    {job.match.reason}
                  </td>
                  <td className="px-4 py-3">
                    {job.details.job_url ? (
                      <a
                        href={job.details.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1CB0F6] font-bold hover:underline"
                      >
                        {'\u6295\u9012'}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-ink-secondary">{'\u2014'}</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardTab({ jobs }: DashboardTabProps) {
  const getProgress = useCampusJobStore((s) => s.getProgress);
  const jobProgress = useCampusJobStore((s) => s.jobProgress);

  const qualifiedJobs = useMemo(() => jobs.filter((j) => j.match.qualified), [jobs]);
  const skipJobs = useMemo(() => jobs.filter((j) => !j.match.qualified), [jobs]);
  const skipAppliedCount = useMemo(
    () => skipJobs.filter((j) => isJobApplied(j.id, getProgress)).length,
    [skipJobs, getProgress, jobProgress]
  );

  const stats = useMemo(
    () =>
      TIER_ORDER.map((tier) => {
        const tierJobs = qualifiedJobs.filter((j) => j.tier === tier);
        const appliedCount = tierJobs.filter((j) => isJobApplied(j.id, getProgress)).length;
        return {
          tier,
          total: tierJobs.length,
          applied: appliedCount,
        };
      }),
    [qualifiedJobs, getProgress, jobProgress]
  );

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {stats.map(({ tier, total, applied }) => (
          <div key={tier} className="surface-panel p-4 text-center">
            <div className="text-2xl mb-1">{TIER_CONFIG[tier].emoji}</div>
            <div className="text-2xl font-extrabold text-ink-primary tabular-nums">
              {applied}/{total}
            </div>
            <div className="text-xs text-ink-secondary font-bold">{TIER_CONFIG[tier].label}</div>
            <div className="text-[10px] text-ink-secondary mt-0.5">已投递/总数</div>
          </div>
        ))}
        <div className="surface-panel p-4 text-center">
          <div className="text-2xl mb-1">{'\u274c'}</div>
          <div className="text-2xl font-extrabold text-ink-primary tabular-nums">
            {skipAppliedCount}/{skipJobs.length}
          </div>
          <div className="text-xs text-ink-secondary font-bold">{'\u4e0d\u5efa\u8bae\u6295\u9012'}</div>
          <div className="text-[10px] text-ink-secondary mt-0.5">已投递/总数</div>
        </div>
      </div>

      <div className="surface-panel p-4 mb-8 bg-[#fffbeb] border-[#FFC800]/30">
        <p className="text-sm text-ink-primary">
          <Star size={14} className="inline mr-1 text-[#FFC800]" />
          {'\u7b5b\u9009\u6761\u4ef6\uff1a2027 \u5c4a \u00b7 \u524d\u7aef / AI \u5e94\u7528 / AI \u5168\u6808 / Agent \u5e94\u7528 \u00b7 \u6392\u9664\u6a21\u578b\u8bad\u7ec3/SFT/\u7b97\u6cd5\u7814\u7a76'}
        </p>
      </div>

      {TIER_ORDER.map((tier) => (
        <TierSection key={tier} tier={tier} jobs={qualifiedJobs} getProgress={getProgress} />
      ))}

      <section>
        <h3 className="font-extrabold text-lg text-ink-primary mb-3 flex items-center gap-2 flex-wrap">
          <span>{'\u274c'}</span> {'\u4e0d\u5efa\u8bae\u6295\u9012'}
          <span className="text-sm font-bold text-[#58CC02] tabular-nums">
            {skipAppliedCount}/{skipJobs.length}
          </span>
          <span className="text-xs font-normal text-ink-secondary">已投递/总数</span>
        </h3>
        <div className="surface-panel p-4">
          <div className="flex flex-wrap gap-2">
            {skipJobs.map((job) => (
              <span
                key={job.id}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f7f7f7] text-ink-secondary border border-[#e5e5e5]'
                )}
                title={job.match.reason}
              >
                {job.basic.company} {'\u00b7'} {job.basic.position}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
