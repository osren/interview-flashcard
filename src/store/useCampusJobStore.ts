import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ApplicationStatus,
  CampusJobData,
  CustomCompany,
  CustomJobInput,
  JobProgress,
  RejectReason,
} from '@/types/campus-job';
import {
  builtinCampusJobs,
  buildJobId,
  getTierFromMatch,
  isRejectReason,
} from '@/data/campus-jobs';
import {
  deriveCurrentStatus,
  deriveCurrentRejectReason,
  createStatusEntry,
  isSameCalendarDay,
} from '@/utils/campus-job-status';

interface CampusJobState {
  customCompanies: CustomCompany[];
  customJobs: CampusJobData[];
  jobProgress: Record<string, JobProgress>;
  lastSelectedJobId: string | null;

  getAllJobs: () => CampusJobData[];
  getJobById: (jobId: string) => CampusJobData | undefined;
  getProgress: (jobId: string) => JobProgress | undefined;
  getTrackedJobs: () => CampusJobData[];

  addCustomCompany: (name: string, color: string) => void;
  removeCustomCompany: (companyId: string) => void;
  updateCustomCompany: (companyId: string, name: string, color: string) => void;

  addCustomJob: (input: CustomJobInput) => string;
  removeCustomJob: (jobId: string) => void;

  setJobStatus: (
    jobId: string,
    status: ApplicationStatus,
    note?: string,
    rejectReason?: RejectReason
  ) => void;
  clearJobStatus: (jobId: string) => void;
  setLastSelectedJobId: (jobId: string | null) => void;
}

function normalizeStatus(status: string): ApplicationStatus {
  if (status === 'saved') return 'applied';
  const allowed: ApplicationStatus[] = ['applied', 'screen', 'interview', 'offer', 'rejected'];
  return allowed.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : 'applied';
}

function normalizeJobProgress(progress: JobProgress): JobProgress {
  const statusHistory = progress.statusHistory.map((entry) => ({
    ...entry,
    id: entry.id ?? crypto.randomUUID(),
    status: normalizeStatus(entry.status),
    rejectReason:
      entry.status === 'rejected' || normalizeStatus(entry.status) === 'rejected'
        ? (isRejectReason(entry.rejectReason) ? entry.rejectReason : undefined)
        : undefined,
  }));
  const status = normalizeStatus(progress.status);
  const rejectReason =
    status === 'rejected'
      ? (isRejectReason(progress.rejectReason)
          ? progress.rejectReason
          : deriveCurrentRejectReason(statusHistory))
      : undefined;

  return {
    ...progress,
    status,
    statusHistory,
    rejectReason,
  };
}

function buildCustomJob(input: CustomJobInput): CampusJobData {
  const category = input.job_category ?? 'other';
  const confidence = input.confidence ?? 0.5;
  const qualified = input.qualified ?? true;

  return {
    id: buildJobId(input.company, input.position, input.location),
    source: 'custom',
    basic: {
      company: input.company,
      position: input.position,
      location: input.location,
    },
    details: {
      job_url: input.job_url ?? null,
      company_logo: null,
      salaryMin: null,
      salaryMax: null,
    },
    extended: {
      graduation_year: '2027',
      recruitment_batch: 'custom',
      employment_type: '校招',
      job_category: category,
      jd_responsibilities: input.jd_responsibilities ?? [],
      jd_requirements: input.jd_requirements ?? [],
      jd_summary: input.jd_summary ?? '',
      requirements_summary: input.requirements_summary ?? '',
      tech_stack: input.tech_stack ?? [],
      education: input.education ?? '',
      major: input.major ?? '',
    },
    match: {
      qualified,
      category,
      batch_type: 'custom',
      confidence,
      reason: input.reason ?? '手动添加',
    },
    tier: getTierFromMatch(qualified, confidence),
  };
}

export const useCampusJobStore = create<CampusJobState>()(
  persist(
    (set, get) => ({
      customCompanies: [],
      customJobs: [],
      jobProgress: {},
      lastSelectedJobId: null,

      getAllJobs: () => [...builtinCampusJobs, ...get().customJobs],

      getJobById: (jobId) => get().getAllJobs().find((j) => j.id === jobId),

      getProgress: (jobId) => {
        const progress = get().jobProgress[jobId];
        return progress ? normalizeJobProgress(progress) : undefined;
      },

      getTrackedJobs: () => {
        const progressMap = get().jobProgress;
        return get()
          .getAllJobs()
          .filter((j) => {
            const p = progressMap[j.id];
            return p && normalizeJobProgress(p).statusHistory.length > 0;
          });
      },

      addCustomCompany: (name, color) => {
        set((state) => ({
          customCompanies: [
            ...state.customCompanies,
            { id: crypto.randomUUID(), name, color },
          ],
        }));
      },

      removeCustomCompany: (companyId) => {
        set((state) => ({
          customCompanies: state.customCompanies.filter((c) => c.id !== companyId),
        }));
      },

      updateCustomCompany: (companyId, name, color) => {
        set((state) => ({
          customCompanies: state.customCompanies.map((c) =>
            c.id === companyId ? { ...c, name, color } : c
          ),
        }));
      },

      addCustomJob: (input) => {
        const job = buildCustomJob(input);
        set((state) => ({
          customJobs: [...state.customJobs.filter((j) => j.id !== job.id), job],
        }));
        return job.id;
      },

      removeCustomJob: (jobId) => {
        set((state) => {
          const { [jobId]: _removed, ...restProgress } = state.jobProgress;
          return {
            customJobs: state.customJobs.filter((j) => j.id !== jobId),
            jobProgress: restProgress,
            lastSelectedJobId:
              state.lastSelectedJobId === jobId ? null : state.lastSelectedJobId,
          };
        });
      },

      setJobStatus: (jobId, status, note, rejectReason) => {
        const now = new Date().toISOString();
        const normalizedReason =
          status === 'rejected' && isRejectReason(rejectReason) ? rejectReason : undefined;

        set((state) => {
          const existing = state.jobProgress[jobId];
          const history = existing?.statusHistory ?? [];
          const currentStatus = deriveCurrentStatus(history);
          const currentReason = deriveCurrentRejectReason(history);

          // 再次点击相同状态（含相同终止原因）：撤销当天最近一次记录
          const sameRejected =
            status === 'rejected' &&
            currentStatus === 'rejected' &&
            currentReason === normalizedReason;
          const sameNonRejected = status !== 'rejected' && currentStatus === status;

          if (sameRejected || sameNonRejected) {
            const last = history[history.length - 1];
            if (last?.status === status && isSameCalendarDay(last.at, now)) {
              const newHistory = history.slice(0, -1);
              if (newHistory.length === 0) {
                const { [jobId]: _removed, ...restProgress } = state.jobProgress;
                return { jobProgress: restProgress };
              }
              const nextStatus = deriveCurrentStatus(newHistory)!;
              return {
                jobProgress: {
                  ...state.jobProgress,
                  [jobId]: {
                    jobId,
                    status: nextStatus,
                    statusHistory: newHistory,
                    updatedAt: now,
                    rejectReason: deriveCurrentRejectReason(newHistory),
                  },
                },
              };
            }
            // 已是该状态且非当天误触：不重复保存
            return state;
          }

          const entry = createStatusEntry(
            status,
            now,
            note?.trim() || undefined,
            normalizedReason
          );
          const statusHistory = [...history, entry];

          return {
            jobProgress: {
              ...state.jobProgress,
              [jobId]: {
                jobId,
                status,
                statusHistory,
                updatedAt: now,
                rejectReason: status === 'rejected' ? normalizedReason : undefined,
              },
            },
          };
        });
      },

      clearJobStatus: (jobId) => {
        set((state) => {
          const { [jobId]: _removed, ...restProgress } = state.jobProgress;
          return {
            jobProgress: restProgress,
            lastSelectedJobId:
              state.lastSelectedJobId === jobId ? null : state.lastSelectedJobId,
          };
        });
      },

      setLastSelectedJobId: (jobId) => set({ lastSelectedJobId: jobId }),
    }),
    {
      name: 'campus-job-storage',
      version: 3,
      migrate: (persisted, fromVersion) => {
        const state = persisted as {
          jobProgress?: Record<string, JobProgress>;
        };
        if (state?.jobProgress) {
          for (const key of Object.keys(state.jobProgress)) {
            state.jobProgress[key] = normalizeJobProgress(state.jobProgress[key]);
          }
        }
        void fromVersion;
        return persisted as CampusJobState;
      },
    }
  )
);

export { COMPANY_COLORS } from '@/data/campus-jobs';
