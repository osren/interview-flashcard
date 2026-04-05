import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import introScriptRaw from '@/data/resume/intro-script.md?raw';

export interface Resume {
  id: string;
  name: string;
  data: string; // base64 encoded PDF
  uploadTime: number;
}

interface ResumeState {
  resumes: Resume[];
  introScript: string; // 面试口述稿
  addResume: (resume: Omit<Resume, 'id' | 'uploadTime'>) => void;
  removeResume: (id: string) => void;
  getResume: (id: string) => Resume | undefined;
  setIntroScript: (script: string) => void;
}

// 去除 Markdown 标题行
const defaultIntroScript = introScriptRaw.replace(/^#.*$/m, '').trim();

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],
      introScript: defaultIntroScript,

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

      getResume: (id) => {
        return get().resumes.find((r) => r.id === id);
      },

      setIntroScript: (script) => {
        set({ introScript: script });
      },
    }),
    {
      name: 'resume-storage',
    }
  )
);
