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

const PRIMARY_ID = 'resume-primary';

const defaultPrimary: MarkdownResume = {
  id: PRIMARY_ID,
  title: '通用精简版',
  content: primaryResumeRaw,
  createdAt: 0,
};

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
}

const defaultIntroScript = introScriptRaw.replace(/^#.*$/m, '').trim();

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],
      introScript: defaultIntroScript,
      markdownResumes: [defaultPrimary],
      primaryResumeId: PRIMARY_ID,

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
        if (id === PRIMARY_ID) return;
        set((state) => ({
          markdownResumes: state.markdownResumes.filter((item) => item.id !== id),
          primaryResumeId: state.primaryResumeId === id ? PRIMARY_ID : state.primaryResumeId,
        }));
      },

      setPrimaryResumeId: (id) => set({ primaryResumeId: id }),

      getMarkdownResume: (id) => get().markdownResumes.find((item) => item.id === id),
    }),
    {
      name: 'resume-storage',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<ResumeState>;
        if (!state.markdownResumes?.length) {
          state.markdownResumes = [defaultPrimary];
          state.primaryResumeId = PRIMARY_ID;
        }
        return state;
      },
    }
  )
);
