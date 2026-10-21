import fs from 'fs';
import path from 'path';

const root = path.resolve('src/pages/Campus');

const files = {
  'components/DashboardTab.tsx': String.raw`import { useMemo } from 'react';
import type { CampusJobData, JobTier } from '@/types/campus-job';
import { TIER_CONFIG, JOB_CATEGORY_LABELS } from '@/data/campus-jobs';
import { ExternalLink, Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DashboardTabProps {
  jobs: CampusJobData[];
}

const TIER_ORDER: JobTier[] = ['S', 'A', 'B', 'edge'];

function TierSection({ tier, jobs }: { tier: JobTier; jobs: CampusJobData[] }) {
  const config = TIER_CONFIG[tier];
  const tierJobs = jobs.filter((j) => j.tier === tier);
  if (tierJobs.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{config.emoji}</span>
        <h3 className="font-extrabold text-lg text-ink-primary">{config.label}</h3>
        <span className="text-sm text-ink-secondary">({tierJobs.length})</span>
        <span className="text-xs text-ink-secondary ml-1">· {config.description}</span>
      </div>
      <div className="surface-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-left">
              <th className="px-4 py-2.5 font-bold text-ink-secondary">公司</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">岗位</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">地点</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">类型</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">conf</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">匹配理由</th>
              <th className="px-4 py-2.5 font-bold text-ink-secondary">链接</th>
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
                        投递
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-ink-secondary">—</span>
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
  const qualifiedJobs = useMemo(() => jobs.filter((j) => j.match.qualified), [jobs]);
  const skipCount = jobs.filter((j) => !j.match.qualified).length;

  const stats = useMemo(
    () =>
      TIER_ORDER.map((tier) => ({
        tier,
        count: qualifiedJobs.filter((j) => j.tier === tier).length,
      })),
    [qualifiedJobs]
  );

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map(({ tier, count }) => (
          <div key={tier} className="surface-panel p-4 text-center">
            <div className="text-2xl mb-1">{TIER_CONFIG[tier].emoji}</div>
            <div className="text-2xl font-extrabold text-ink-primary">{count}</div>
            <div className="text-xs text-ink-secondary font-bold">{TIER_CONFIG[tier].label}</div>
          </div>
        ))}
        <div className="surface-panel p-4 text-center">
          <div className="text-2xl mb-1">❌</div>
          <div className="text-2xl font-extrabold text-ink-primary">{skipCount}</div>
          <div className="text-xs text-ink-secondary font-bold">不建议投递</div>
        </div>
      </div>

      <div className="surface-panel p-4 mb-8 bg-[#fffbeb] border-[#FFC800]/30">
        <p className="text-sm text-ink-primary">
          <Star size={14} className="inline mr-1 text-[#FFC800]" />
          筛选条件：2027 届 · 前端 / AI 应用 / AI 全栈 / Agent 应用 · 排除模型训练/SFT/算法研究
        </p>
      </div>

      {TIER_ORDER.map((tier) => (
        <TierSection key={tier} tier={tier} jobs={qualifiedJobs} />
      ))}

      <section>
        <h3 className="font-extrabold text-lg text-ink-primary mb-3 flex items-center gap-2">
          <span>❌</span> 不建议投递
          <span className="text-sm font-normal text-ink-secondary">({skipCount})</span>
        </h3>
        <div className="surface-panel p-4">
          <div className="flex flex-wrap gap-2">
            {jobs
              .filter((j) => !j.match.qualified)
              .map((job) => (
                <span
                  key={job.id}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f7f7f7] text-ink-secondary border border-[#e5e5e5]'
                  )}
                  title={job.match.reason}
                >
                  {job.basic.company} · {job.basic.position}
                </span>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
`,
};

for (const [rel, content] of Object.entries(files)) {
  const filePath = path.join(root, rel);
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log('Wrote', rel);
}
