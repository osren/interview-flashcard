import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import introScriptRaw from '@/data/resume/intro-script.md?raw';
import primaryResumeRaw from '@/data/resume/primary.md?raw';
import { interviewPersistStorage } from '@/store/interview-persist-storage';

export interface Resume {
  id: string;
  name: string;
  data: string;
  uploadTime: number;
  /** Plain text extracted from the PDF for JD optimization */
  extractedText?: string;
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
  updateResumeExtractedText: (id: string, extractedText: string) => void;
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

      updateResumeExtractedText: (id, extractedText) => {
        set((state) => ({
          resumes: state.resumes.map((item) =>
            item.id === id ? { ...item, extractedText } : item
          ),
        }));
      },

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

        // 云端不带 PDF 原件，合并时用本地已有的 data 补回，避免预览/下载失效
        const localById = new Map(get().resumes.map((item) => [item.id, item]));
        const resumes = payload.resumes.map((item) => {
          if (item.data) return item;
          const local = localById.get(item.id);
          return local?.data ? { ...item, data: local.data } : item;
        });

        set({
          resumes,
          introScript: payload.introScript,
          markdownResumes,
          primaryResumeId,
        });
      },
    }),
    {
      name: 'resume-storage',
      version: 3,
      // 上传的 PDF 以 base64 存在 state 里，几份就会超出 localStorage 的 5MB 配额，
      // 这里和面经 / 会话缓存一样走 IndexedDB（并自动迁移旧的 localStorage 数据）。
      storage: interviewPersistStorage as unknown as PersistStorage<Partial<ResumeState>>,
      migrate: (persisted) => {
        const state = persisted as Partial<ResumeState>;
        if (!state.markdownResumes?.length) {
          state.markdownResumes = [defaultPrimaryMarkdown];
          state.primaryResumeId = RESUME_PRIMARY_ID;
        }
        if (Array.isArray(state.resumes)) {
          state.resumes = state.resumes.map((item) => ({
            ...item,
            extractedText:
              typeof item.extractedText === 'string' ? item.extractedText : undefined,
          }));
        }
        return state;
      },
    }
  )
);
