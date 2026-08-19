import { useMemo, useState } from 'react';
import { PageShell, SectionHeader } from '@/components/ui';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { builtinCampusJobs } from '@/data/campus-jobs';
import type { CampusTab } from '@/types/campus-job';
import { DashboardTab } from './components/DashboardTab';
import { JobsTab } from './components/JobsTab';
import { ProgressTab } from './components/ProgressTab';
import { LayoutDashboard, Briefcase, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

const TABS: { id: CampusTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: '\u6295\u9012\u770b\u677f', icon: LayoutDashboard },
  { id: 'jobs', label: '\u79cb\u62db\u804c\u4f4d', icon: Briefcase },
  { id: 'progress', label: '\u6c42\u804c\u8fdb\u5ea6', icon: TrendingUp },
];

export function CampusIndex() {
  const [activeTab, setActiveTab] = useState<CampusTab>('dashboard');
  const customJobs = useCampusJobStore((state) => state.customJobs);
  const jobs = useMemo(
    () => [...builtinCampusJobs, ...customJobs],
    [customJobs]
  );

  return (
    <PageShell maxWidth="2xl">
      <SectionHeader
        title={'\u79cb\u62db\u6295\u9012'}
        description={`${jobs.length} \u4e2a\u5c97\u4f4d \u00b7 \u7b5b\u9009\u3001\u6295\u9012\u4e0e\u8fdb\u5ea6\u8ffd\u8e2a`}
      />

      <div className="flex gap-1 p-1 mb-6 surface-panel rounded-2xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all',
              activeTab === id
                ? 'bg-[#58CC02] text-white shadow-sm'
                : 'text-ink-secondary hover:bg-[#f7f7f7]'
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <DashboardTab jobs={jobs} />}
      {activeTab === 'jobs' && <JobsTab jobs={jobs} />}
      {activeTab === 'progress' && <ProgressTab jobs={jobs} />}
    </PageShell>
  );
}
