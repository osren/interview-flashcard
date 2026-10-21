import { useMemo } from 'react';
import type { ApplicationStatus, CampusJobData, JobProgress, JobTier } from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  formatApplicationStatusLabel,
  isRejectReason,
  JOB_CATEGORY_LABELS,
  REJECT_REASON_LABELS,
  REJECT_REASON_ORDER,
  TIER_CONFIG,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { ExternalLink, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RejectReason } from '@/types/campus-job';

interface DashboardTabProps {
  jobs: CampusJobData[];
}

const TIER_ORDER: JobTier[] = ['S', 'A', 'B', 'edge'];

function isJobApplied(jobId: string, getProgress: ReturnType<typeof useCampusJobStore.getState>['getProgress']) {
  const progress = getProgress(jobId);
  return Boolean(progress && progress.statusHistory.length > 0);
}

function encodeStatus(status: ApplicationStatus, rejectReason?: RejectReason): string {
  return status === 'rejected' && rejectReason ? `rejected:${rejectReason}` : status;
}

function DashboardJobStatusSelect({ job, progress }: { job: CampusJobData; progress?: JobProgress }) {
  const setJobStatus = useCampusJobStore((state) => state.setJobStatus);
  const value = progress ? encodeStatus(progress.status, progress.rejectReason) : '';
  const label = progress
    ? formatApplicationStatusLabel(progress.status, progress.rejectReason)
    : '未设置';

  return (
    <select
      value={value}
      aria-label={`更新${job.basic.company} ${job.basic.position}的投递状态`}
      title={`当前状态：${label}`}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (!nextValue) return;
        if (nextValue.startsWith('rejected:')) {
          const reason = nextValue.slice('rejected:'.length);
          if (isRejectReason(reason)) setJobStatus(job.id, 'rejected', undefined, reason);
          return;
        }
        setJobStatus(job.id, nextValue as ApplicationStatus);
      }}
      className="max-w-[140px] rounded-lg border border-[#e5e5e5] bg-white px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]/30"
      style={{ color: progress ? APPLICATION_STATUS_COLORS[progress.status] : '#777777' }}
    >
      {!progress && <option value="">设置状态</option>}
      {APPLICATION_STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {APPLICATION_STATUS_LABELS[status]}
        </option>
      ))}
      <optgroup label="已终止">
        {REJECT_REASON_ORDER.map((reason) => (
          <option key={reason} value={`rejected:${reason}`}>
            {REJECT_REASON_LABELS[reason]}
          </option>
        ))}
      </optgroup>
      {progress?.status === 'rejected' && !progress.rejectReason && (
        <option value="rejected">已终止（未注明原因）</option>
      )}
    </select>
  );
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
      <div className="surface-panel overflow-x-auto">
        <table className="w-full min-w-[1050px] text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-left">
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u516c\u53f8'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u5c97\u4f4d'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u5730\u70b9'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u7c7b\u578b'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">conf</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">投递状态</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u5339\u914d\u7406\u7531'}</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">{'\u94fe\u63a5'}</th>
            </tr>
          </thead>
          <tbody>
            {tierJobs
              .sort((a, b) => b.match.confidence - a.match.confidence)
              .map((job) => {
                const progress = getProgress(job.id);
                const applied = Boolean(progress && progress.statusHistory.length > 0);
                const isRejected = progress?.status === 'rejected';
                return (
                  <tr 
                    key={job.id} 
                    className={cn(
                      "border-b border-[#f0f0f0] hover:bg-[#fafafa]",
                      applied && "bg-[#f0fdf4]"
                    )}
                  >
                    <td className="px-4 py-3 font-bold">
                      <div className="flex items-center gap-2">
                        {applied && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02]" title="已投递" />
                        )}
                        {job.basic.company}
                      </div>
                    </td>
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
                    <td className="px-4 py-3">
                      <DashboardJobStatusSelect job={job} progress={progress} />
                    </td>
                    <td className="px-4 py-3 text-ink-secondary max-w-xs truncate" title={job.match.reason}>
                      {job.match.reason}
                    </td>
                    <td className="px-4 py-3">
                      {job.details.job_url ? (
                        isRejected ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#FF4B4B]">
                            已结束
                            <ExternalLink size={12} />
                          </span>
                        ) : (
                          <a
                            href={job.details.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "inline-flex items-center gap-1 font-bold hover:underline",
                              applied ? "text-ink-secondary" : "text-[#1CB0F6]"
                            )}
                          >
                            {progress
                              ? formatApplicationStatusLabel(progress.status, progress.rejectReason)
                              : '\u6295\u9012'}
                            <ExternalLink size={12} />
                          </a>
                        )
                      ) : (
                        <span className="text-ink-secondary">{'\u2014'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
          {skipJobs.map((job) => {
            const progress = getProgress(job.id);
            return (
              <div
                key={job.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f7f7f7] text-ink-secondary border border-[#e5e5e5]"
                title={job.match.reason}
              >
                <span>{job.basic.company} {'\u00b7'} {job.basic.position}</span>
                <DashboardJobStatusSelect job={job} progress={progress} />
              </div>
            );
          })}
          </div>
        </div>
      </section>
    </div>
  );
}
