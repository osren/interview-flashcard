import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { PageShell, SectionHeader, PageLoadingSkeleton } from '@/components/ui';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import type { CampusTab } from '@/types/campus-job';
import { ProgressTab } from './components/ProgressTab';
import { CampusJobSyncBadge } from './components/CampusJobSyncBadge';
import { useCampusJobSyncContext } from '@/hooks/useCampusJobSync';
import { LayoutDashboard, Briefcase, Table2, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ensureLocalCampusCatalog } from '@/data/campus-jobs/loadJobs';

const DashboardTab = lazy(() =>
  import('./components/DashboardTab').then((m) => ({ default: m.DashboardTab }))
);
const JobsTab = lazy(() =>
  import('./components/JobsTab').then((m) => ({ default: m.JobsTab }))
);
const JobPoolTab = lazy(() =>
  import('./components/JobPoolTab').then((m) => ({ default: m.JobPoolTab }))
);

const TABS: { id: CampusTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'progress', label: '\u6c42\u804c\u8fdb\u5ea6', icon: TrendingUp },
  { id: 'dashboard', label: '\u6295\u9012\u770b\u677f', icon: LayoutDashboard },
  { id: 'jobs', label: '\u79cb\u62db\u804c\u4f4d', icon: Briefcase },
  { id: 'job-pool', label: '\u79cb\u62db\u5c97\u4f4d\u6c60', icon: Table2 },
];

export function CampusIndex() {
  const [activeTab, setActiveTab] = useState<CampusTab>('progress');
  const [visitedTabs, setVisitedTabs] = useState<Set<CampusTab>>(
    () => new Set<CampusTab>(['progress'])
  );
  const sync = useCampusJobSyncContext();
  const customJobs = useCampusJobStore((state) => state.customJobs);
  const catalogJobs = useCampusJobStore((state) => state.catalogJobs);
  const hiddenJobIds = useCampusJobStore((state) => state.hiddenJobIds);
  const catalogSource = useCampusJobStore((state) => state.catalogSource);
  const setCatalogJobs = useCampusJobStore((state) => state.setCatalogJobs);
  const getAllJobs = useCampusJobStore((state) => state.getAllJobs);
  const jobs = useMemo(
    () => getAllJobs(),
    [catalogJobs, customJobs, hiddenJobIds, getAllJobs]
  );

  useEffect(() => {
    sync.ensureCatalogLoaded();
  }, [sync.ensureCatalogLoaded]);

  useEffect(() => {
    let cancelled = false;
    void ensureLocalCampusCatalog().then((localJobs) => {
      if (cancelled) return;
      const state = useCampusJobStore.getState();
      if (state.catalogSource === 'remote' && state.catalogJobs.length > 0) return;
      if (localJobs.length > 0) {
        setCatalogJobs(localJobs, 'local');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setCatalogJobs]);

  const selectTab = (id: CampusTab) => {
    setActiveTab(id);
    setVisitedTabs((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <PageShell maxWidth="2xl">
      <div className="campus-typo">
        <SectionHeader
          title={'\u79cb\u62db\u6295\u9012'}
          description={`${jobs.length} \u4e2a\u5c97\u4f4d \u00b7 \u7b5b\u9009\u3001\u6295\u9012\u4e0e\u8fdb\u5ea6\u8ffd\u8e2a${
            catalogSource === 'remote' ? ' \u00b7 \u4e91\u7aef\u5c97\u4f4d\u5e93' : ''
          }`}
        />

        <div className="mb-4">
          <CampusJobSyncBadge
            status={sync.status}
            error={sync.error}
            isLoggedIn={sync.isLoggedIn}
            isConfigured={sync.isConfigured}
          />
        </div>

        <div className="flex gap-1 p-1 mb-6 surface-panel rounded-2xl">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all',
                activeTab === id
                  ? 'bg-[#58CC02] text-white shadow-sm'
                  : 'text-ink-secondary hover:bg-[#f7f7f7]'
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {visitedTabs.has('dashboard') && (
          <div className={cn(activeTab !== 'dashboard' && 'hidden')}>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <DashboardTab jobs={jobs} />
            </Suspense>
          </div>
        )}
        {visitedTabs.has('jobs') && (
          <div className={cn(activeTab !== 'jobs' && 'hidden')}>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <JobsTab jobs={jobs} />
            </Suspense>
          </div>
        )}
        {visitedTabs.has('job-pool') && (
          <div className={cn(activeTab !== 'job-pool' && 'hidden')}>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <JobPoolTab />
            </Suspense>
          </div>
        )}
        {visitedTabs.has('progress') && (
          <div className={cn(activeTab !== 'progress' && 'hidden')}>
            <ProgressTab jobs={jobs} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
