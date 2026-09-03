import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import introScriptRaw from '@/data/resume/intro-script.md?raw';
import primaryResumeRaw from '@/data/resume/primary.md?raw';

export interface Resume {
  id: string;
  name: string;
  data: string;
  uploadTime: number;
}

export interface MarkdownResume {
  id: string;
  title: string;
  content: string;
  sourceResumeId?: string;
  targetJobId?: string;
  jdSnapshot?: string;
  createdAt: number;
}

export interface ResumeSyncPayload {
  resumes: Resume[];
  introScript: string;
  markdownResumes: MarkdownResume[];
  primaryResumeId: string;
}

export const RESUME_PRIMARY_ID = 'resume-primary';

export const defaultPrimaryMarkdown: MarkdownResume = {
  id: RESUME_PRIMARY_ID,
  title: '通用精简版',
  content: primaryResumeRaw,
  createdAt: 0,
};

export const DEFAULT_INTRO_SCRIPT = introScriptRaw.replace(/^#.*$/m, '').trim();

interface ResumeState {
  resumes: Resume[];
  introScript: string;
  markdownResumes: MarkdownResume[];
  primaryResumeId: string;
  addResume: (resume: Omit<Resume, 'id' | 'uploadTime'>) => void;
  removeResume: (id: string) => void;
  getResume: (id: string) => Resume | undefined;
  setIntroScript: (script: string) => void;
  upsertMarkdownResume: (resume: MarkdownResume) => void;
  updateMarkdownContent: (id: string, content: string) => void;
  removeMarkdownResume: (id: string) => void;
  setPrimaryResumeId: (id: string) => void;
  getMarkdownResume: (id: string) => MarkdownResume | undefined;
  getSyncPayload: () => ResumeSyncPayload;
  importSyncedState: (payload: ResumeSyncPayload) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],
      introScript: DEFAULT_INTRO_SCRIPT,
      markdownResumes: [defaultPrimaryMarkdown],
      primaryResumeId: RESUME_PRIMARY_ID,

      addResume: (resume) => {
        const newResume: Resume = {
          ...resume,
          id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uploadTime: Date.now(),
        };
        set((state) => ({
          resumes: [...state.resumes, newResume],
        }));
      },

      removeResume: (id) => {
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
        }));
      },

      getResume: (id) => get().resumes.find((r) => r.id === id),

      setIntroScript: (script) => set({ introScript: script }),

      upsertMarkdownResume: (resume) => {
        set((state) => ({
          markdownResumes: [
            ...state.markdownResumes.filter((item) => item.id !== resume.id),
            resume,
          ],
        }));
      },

      updateMarkdownContent: (id, content) => {
        set((state) => ({
          markdownResumes: state.markdownResumes.map((item) =>
            item.id === id ? { ...item, content } : item
          ),
        }));
      },

      removeMarkdownResume: (id) => {
        if (id === RESUME_PRIMARY_ID) return;
        set((state) => ({
          markdownResumes: state.markdownResumes.filter((item) => item.id !== id),
          primaryResumeId: state.primaryResumeId === id ? RESUME_PRIMARY_ID : state.primaryResumeId,
        }));
      },

      setPrimaryResumeId: (id) => set({ primaryResumeId: id }),

      getMarkdownResume: (id) => get().markdownResumes.find((item) => item.id === id),

      getSyncPayload: () => {
        const state = get();
        return {
          resumes: state.resumes,
          introScript: state.introScript,
          markdownResumes: state.markdownResumes,
          primaryResumeId: state.primaryResumeId,
        };
      },

      importSyncedState: (payload) => {
        const markdownResumes = payload.markdownResumes.some(
          (item) => item.id === RESUME_PRIMARY_ID
        )
          ? payload.markdownResumes
          : [defaultPrimaryMarkdown, ...payload.markdownResumes];

        const primaryResumeId = markdownResumes.some((item) => item.id === payload.primaryResumeId)
          ? payload.primaryResumeId
          : RESUME_PRIMARY_ID;

        set({
          resumes: payload.resumes,
          introScript: payload.introScript,
          markdownResumes,
          primaryResumeId,
        });
      },
    }),
    {
      name: 'resume-storage',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<ResumeState>;
        if (!state.markdownResumes?.length) {
          state.markdownResumes = [defaultPrimaryMarkdown];
          state.primaryResumeId = RESUME_PRIMARY_ID;
        }
        return state;
      },
    }
  )
);
