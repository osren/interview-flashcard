import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { PageShell, SectionHeader, PageLoadingSkeleton } from '@/components/ui';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import type { CampusTab } from '@/types/campus-job';
import { ProgressTab } from './components/ProgressTab';
import { CampusJobSyncBadge } from './components/CampusJobSyncBadge';
import { useCampusJobSyncContext } from '@/hooks/useCampusJobSync';
import { LayoutDashboard, Briefcase, Loader2, Table2, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ensureLocalCampusCatalog } from '@/data/campus-jobs/loadJobs';
import { shouldMountAgentPanel } from '@/lib/agent/feature';
import { AGENT_CHAT_BUSY_KEY, useChatBusyStore } from '@/store/useChatBusyStore';

const DashboardTab = lazy(() =>
  import('./components/DashboardTab').then((m) => ({ default: m.DashboardTab }))
);
const JobsTab = lazy(() =>
  import('./components/JobsTab').then((m) => ({ default: m.JobsTab }))
);
const JobPoolTab = lazy(() =>
  import('./components/JobPoolTab').then((m) => ({ default: m.JobPoolTab }))
);
// Agent 面板按需加载：开关关闭时不会进主包，也不会发起任何 LLM 请求
const AgentPanel = lazy(() =>
  import('@/components/AI/AgentPanel').then((m) => ({ default: m.AgentPanel }))
);

const TABS: { id: CampusTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'progress', label: '\u6c42\u804c\u8fdb\u5ea6', icon: TrendingUp },
  { id: 'dashboard', label: '\u6295\u9012\u770b\u677f', icon: LayoutDashboard },
  { id: 'jobs', label: '\u79cb\u62db\u804c\u4f4d', icon: Briefcase },
  { id: 'job-pool', label: '\u79cb\u62db\u5c97\u4f4d\u6c60', icon: Table2 },
];

export function CampusIndex() {
  const [activeTab, setActiveTab] = useState<CampusTab>('progress');
  const [agentOpen, setAgentOpen] = useState(false);
  // 打开过一次就常驻：关闭只收起面板，正在跑的一轮仍在后台继续，重开即可看到结果
  const [agentMounted, setAgentMounted] = useState(false);
  const agentBusy = useChatBusyStore((state) => state.busy[AGENT_CHAT_BUSY_KEY] ?? false);
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

        <nav className="mb-6 grid grid-cols-2 gap-2 rounded-2xl p-2 surface-panel sm:grid-cols-4 sm:gap-1 sm:p-1" aria-label="秋招投递模块">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={cn(
                'flex min-w-0 w-full items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-extrabold transition-all sm:text-sm',
                activeTab === id
                  ? 'bg-[#58CC02] text-white shadow-sm'
                  : 'text-ink-secondary hover:bg-[#f7f7f7]'
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </nav>

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

        {shouldMountAgentPanel() && (
          <>
            <button
              type="button"
              onClick={() => {
                setAgentMounted(true);
                setAgentOpen(true);
              }}
              className={cn(
                'fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(88,204,2,0.35)] transition-transform hover:-translate-y-0.5',
                agentBusy ? 'bg-[#FF9600]' : 'bg-[#58CC02]'
              )}
              aria-label={agentBusy ? '秋招 AI 助手正在后台处理，点击查看' : '打开秋招 AI 助手'}
            >
              {agentBusy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {agentBusy ? '处理中…' : '秋招助手'}
            </button>
            {agentMounted && (
              <Suspense fallback={null}>
                <AgentPanel open={agentOpen} onClose={() => setAgentOpen(false)} />
              </Suspense>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
