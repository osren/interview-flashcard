import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Resume {
  id: string;
  name: string;
  data: string; // base64 encoded PDF
  uploadTime: number;
}

interface ResumeState {
  resumes: Resume[];
  addResume: (resume: Omit<Resume, 'id' | 'uploadTime'>) => void;
  removeResume: (id: string) => void;
  getResume: (id: string) => Resume | undefined;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],

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
    }),
    {
      name: 'resume-storage',
    }
  )
);
