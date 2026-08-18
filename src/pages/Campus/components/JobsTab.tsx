import { useMemo, useState } from 'react';
import type { CampusJobData } from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  JOB_CATEGORY_LABELS,
  TIER_CONFIG,
  COMPANY_COLOR_GRADIENT,
} from '@/data/campus-jobs';
import { useCampusJobStore, COMPANY_COLORS } from '@/store/useCampusJobStore';
import { JobStatusPanel } from './JobStatusPanel';
import { JdParseModal } from '@/components/AI/JdParseModal';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  Trash2,
  Pencil,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { campusStrings } from '../strings';

interface JobsTabProps {
  jobs: CampusJobData[];
}

export function JobsTab({ jobs }: JobsTabProps) {
  const {
    customCompanies,
    addCustomCompany,
    removeCustomCompany,
    updateCustomCompany,
    addCustomJob,
    removeCustomJob,
    getProgress,
    setLastSelectedJobId,
  } = useCampusJobStore();

  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(() => new Set());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusPanelJob, setStatusPanelJob] = useState<CampusJobData | null>(null);
  const [filterTier, setFilterTier] = useState<'all' | 'qualified'>('qualified');

  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyColor, setNewCompanyColor] = useState('blue');

  const [addingJobToCompany, setAddingJobToCompany] = useState<string | null>(null);
  const [newJobPosition, setNewJobPosition] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');

  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [parseOpen, setParseOpen] = useState(false);
  const [parseCompany, setParseCompany] = useState('');

  const filteredJobs = useMemo(
    () => (filterTier === 'qualified' ? jobs.filter((j) => j.match.qualified) : jobs),
    [jobs, filterTier]
  );

  const jobsByCompany = useMemo(() => {
    const map = new Map<string, CampusJobData[]>();
    for (const job of filteredJobs) {
      const list = map.get(job.basic.company) ?? [];
      list.push(job);
      map.set(job.basic.company, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => b.match.confidence - a.match.confidence);
    }
    return map;
  }, [filteredJobs]);

  const companyNames = useMemo(() => {
    const names = new Set([...jobsByCompany.keys(), ...customCompanies.map((c) => c.name)]);
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [jobsByCompany, customCompanies]);

  const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : null;

  const toggleCompany = (name: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const getCompanyColor = (name: string) => {
    const custom = customCompanies.find((c) => c.name === name);
    return custom?.color ?? 'gray';
  };

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) return;
    addCustomCompany(newCompanyName.trim(), newCompanyColor);
    setExpandedCompanies((prev) => new Set(prev).add(newCompanyName.trim()));
    setNewCompanyName('');
    setIsAddingCompany(false);
  };

  const handleAddJob = (companyName: string) => {
    if (!newJobPosition.trim() || !newJobLocation.trim()) return;
    const id = addCustomJob({
      company: companyName,
      position: newJobPosition.trim(),
      location: newJobLocation.trim(),
      job_url: newJobUrl.trim() || undefined,
    });
    setAddingJobToCompany(null);
    setNewJobPosition('');
    setNewJobLocation('');
    setNewJobUrl('');
    setSelectedJobId(id);
  };

  const handleSelectJob = (job: CampusJobData) => {
    setSelectedJobId(job.id);
    setLastSelectedJobId(job.id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">
      <aside className="lg:w-80 flex-shrink-0 surface-panel overflow-hidden flex flex-col max-h-[70vh] lg:max-h-[calc(100vh-220px)]">
        <div className="p-3 border-b border-[#e5e5e5] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-ink-primary">{'\u516c\u53f8 / \u804c\u4f4d'}</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setParseCompany('');
                  setParseOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-[#f0f9ff] text-[#1CB0F6]"
                title="智能添加岗位"
              >
                <Sparkles size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCompany(true)}
                className="p-1.5 rounded-lg hover:bg-[#f7f7f7] text-[#58CC02]"
                title={campusStrings.addCompanyTitle}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            {(['qualified', 'all'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterTier(f)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-bold rounded-lg border-2',
                  filterTier === f
                    ? 'bg-[#58CC02] text-white border-[#58CC02]'
                    : 'border-[#e5e5e5] text-ink-secondary'
                )}
              >
                {f === 'qualified' ? '\u4ec5\u63a8\u8350' : '\u5168\u90e8'}
              </button>
            ))}
          </div>
        </div>

        {isAddingCompany && (
          <div className="p-3 border-b border-[#e5e5e5] bg-[#fafafa] space-y-2">
            <input
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder={campusStrings.companyNamePlaceholder}
              className="w-full px-3 py-2 rounded-xl border-2 border-[#e5e5e5] text-sm"
            />
            <div className="flex flex-wrap gap-1">
              {COMPANY_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewCompanyColor(c.value)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2',
                    newCompanyColor === c.value ? 'border-ink-primary scale-110' : 'border-transparent'
                  )}
                  title={c.name}
                >
                  <span className={cn('block w-full h-full rounded-full bg-gradient-to-br', COMPANY_COLOR_GRADIENT[c.value])} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCompany}
                className="flex-1 py-2 rounded-xl bg-[#58CC02] text-white text-sm font-bold"
              >
                {'\u786e\u5b9a'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCompany(false)}
                className="px-3 py-2 rounded-xl border-2 border-[#e5e5e5] text-sm font-bold"
              >
                {'\u53d6\u6d88'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {companyNames.map((companyName) => {
            const companyJobs = jobsByCompany.get(companyName) ?? [];
            const expanded = expandedCompanies.has(companyName);
            const color = getCompanyColor(companyName);
            const customCo = customCompanies.find((c) => c.name === companyName);

            return (
              <div key={companyName}>
                <div className="flex items-center gap-1 group">
                  <button
                    type="button"
                    onClick={() => toggleCompany(companyName)}
                    className="flex-1 flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#f7f7f7] text-left"
                  >
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-br', COMPANY_COLOR_GRADIENT[color])} />
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="font-bold text-sm truncate">{companyName}</span>
                    <span className="text-xs text-ink-secondary ml-auto">{companyJobs.length}</span>
                  </button>
                  {customCo && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompanyId(customCo.id);
                          setEditCompanyName(customCo.name);
                        }}
                        className="p-1 rounded hover:bg-[#f7f7f7]"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomCompany(customCo.id)}
                        className="p-1 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {editingCompanyId === customCo?.id && (
                  <div className="px-2 pb-2 flex gap-1">
                    <input
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg border border-[#e5e5e5]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateCustomCompany(customCo.id, editCompanyName, customCo.color);
                        setEditingCompanyId(null);
                      }}
                      className="p-1 text-[#58CC02]"
                    >
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setEditingCompanyId(null)} className="p-1">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {expanded && (
                  <div className="ml-4 space-y-0.5 pb-1">
                    {companyJobs.map((job) => {
                      const progress = getProgress(job.id);
                      const status = progress?.status;
                      const isSelected = selectedJobId === job.id;

                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleSelectJob(job)}
                          className={cn(
                            'w-full text-left px-2 py-2 rounded-xl text-xs transition-all border-2',
                            isSelected
                              ? 'border-[#58CC02] bg-[#eefbf0]'
                              : 'border-transparent hover:bg-[#f7f7f7]'
                          )}
                        >
                          <div className="font-bold truncate">{job.basic.position}</div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-ink-secondary">{job.basic.location}</span>
                            {status ? (
                              <span
                                className="font-bold px-1.5 py-0.5 rounded-md text-[10px]"
                                style={{
                                  color: APPLICATION_STATUS_COLORS[status],
                                  backgroundColor: `${APPLICATION_STATUS_COLORS[status]}18`,
                                }}
                              >
                                {APPLICATION_STATUS_LABELS[status]}
                              </span>
                            ) : (
                              <span className="text-[10px] text-ink-secondary">{'\u672a\u8bb0\u5f55'}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {addingJobToCompany === companyName ? (
                      <div className="p-2 space-y-1.5 bg-[#fafafa] rounded-xl">
                        <input
                          value={newJobPosition}
                          onChange={(e) => setNewJobPosition(e.target.value)}
                          placeholder={campusStrings.jobNamePlaceholder}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e5e5e5]"
                        />
                        <input
                          value={newJobLocation}
                          onChange={(e) => setNewJobLocation(e.target.value)}
                          placeholder={campusStrings.locationPlaceholder}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e5e5e5]"
                        />
                        <input
                          value={newJobUrl}
                          onChange={(e) => setNewJobUrl(e.target.value)}
                          placeholder={campusStrings.jobUrlPlaceholder}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e5e5e5]"
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddJob(companyName)}
                            className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#58CC02] text-white"
                          >
                            {'\u6dfb\u52a0\u5c97\u4f4d'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingJobToCompany(null)}
                            className="px-2 text-xs font-bold rounded-lg border border-[#e5e5e5]"
                          >
                            {'\u53d6\u6d88'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setParseCompany(companyName);
                            setParseOpen(true);
                          }}
                          className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-[#1CB0F6] hover:bg-[#f0f9ff] rounded-xl"
                        >
                          <Sparkles size={12} />
                          AI 解析 JD
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingJobToCompany(companyName)}
                          className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-[#58CC02] hover:bg-[#eefbf0] rounded-xl"
                        >
                          <Plus size={12} />
                          {'\u6dfb\u52a0\u5c97\u4f4d'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 surface-panel p-5 min-h-[400px]">
        {!selectedJob ? (
          <div className="h-full flex items-center justify-center text-ink-secondary text-sm">
            {'\u4ece\u5de6\u4fa7\u9009\u62e9\u804c\u4f4d\u67e5\u770b\u8be6\u60c5'}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-[#58CC02] text-lg">{selectedJob.basic.company}</span>
                  {selectedJob.source === 'custom' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f7f7f7] text-ink-secondary">
                      {'\u81ea\u5b9a\u4e49'}
                    </span>
                  )}
                </div>
                <h2 className="font-extrabold text-2xl text-ink-primary">{selectedJob.basic.position}</h2>
                <p className="flex items-center gap-1 text-ink-secondary mt-1">
                  <MapPin size={14} />
                  {selectedJob.basic.location}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {selectedJob.details.job_url && (
                  <a
                    href={selectedJob.details.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1CB0F6] text-white font-bold text-sm hover:opacity-90"
                  >
                    {'\u67e5\u770b\u5c97\u4f4d'}
                    <ExternalLink size={14} />
                  </a>
                )}
                {selectedJob.source === 'custom' && (
                  <button
                    type="button"
                    onClick={() => {
                      removeCustomJob(selectedJob.id);
                      setSelectedJobId(null);
                    }}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    {'\u5220\u9664\u5c97\u4f4d'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-[#eefbf0] text-[#58CC02] text-xs font-bold">
                {TIER_CONFIG[selectedJob.tier].emoji} {TIER_CONFIG[selectedJob.tier].label}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#eef6ff] text-[#1CB0F6] text-xs font-bold">
                {JOB_CATEGORY_LABELS[selectedJob.match.category]}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#fff8e6] text-[#b8860b] text-xs font-bold">
                conf {selectedJob.match.confidence.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => setStatusPanelJob(selectedJob)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold border-2 border-[#e5e5e5] hover:border-[#58CC02] transition-colors"
                style={
                  getProgress(selectedJob.id)?.status
                    ? { color: APPLICATION_STATUS_COLORS[getProgress(selectedJob.id)!.status] }
                    : undefined
                }
              >
                {getProgress(selectedJob.id)?.status
                  ? `${APPLICATION_STATUS_LABELS[getProgress(selectedJob.id)!.status]} \u00b7 \u70b9\u51fb\u66f4\u65b0`
                  : '\u672a\u8bb0\u5f55 \u00b7 \u70b9\u51fb\u6807\u8bb0'}
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-ink-primary mb-1">{'\u5339\u914d\u7406\u7531'}</h4>
              <p className="text-sm text-ink-secondary">{selectedJob.match.reason}</p>
            </div>

            {selectedJob.extended.jd_summary && (
              <div>
                <h4 className="font-bold text-sm text-ink-primary mb-1">{'JD \u6458\u8981'}</h4>
                <p className="text-sm text-ink-secondary leading-relaxed">{selectedJob.extended.jd_summary}</p>
              </div>
            )}

            {selectedJob.extended.tech_stack.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-ink-primary mb-2">{'\u6280\u672f\u6808'}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.extended.tech_stack.slice(0, 12).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-lg bg-[#f7f7f7] text-xs font-bold text-ink-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedJob.extended.requirements_summary && (
              <div>
                <h4 className="font-bold text-sm text-ink-primary mb-1">{'\u4efb\u804c\u8981\u6c42'}</h4>
                <p className="text-sm text-ink-secondary leading-relaxed">{selectedJob.extended.requirements_summary}</p>
              </div>
            )}

            {selectedJob.extended.jd_responsibilities.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-ink-primary mb-1">岗位职责</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-ink-secondary">
                  {selectedJob.extended.jd_responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.extended.jd_requirements.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-ink-primary mb-1">任职要求</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-ink-secondary">
                  {selectedJob.extended.jd_requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {statusPanelJob && (
        <JobStatusPanel job={statusPanelJob} onClose={() => setStatusPanelJob(null)} />
      )}

      <JdParseModal
        open={parseOpen}
        defaultCompany={parseCompany}
        onClose={() => setParseOpen(false)}
        onAdded={(id) => {
          setSelectedJobId(id);
          setLastSelectedJobId(id);
          const job = useCampusJobStore.getState().getJobById(id);
          if (job) {
            setExpandedCompanies((prev) => new Set(prev).add(job.basic.company));
          }
        }}
      />
    </div>
  );
}
