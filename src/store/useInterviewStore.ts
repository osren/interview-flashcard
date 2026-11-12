import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Company,
  Department,
  InterviewSession,
  InterviewStatus,
  InterviewQuestion,
  InterviewResumeSource,
  MasteryLevel,
} from '@/types/interview';
import { DEMO_DATA } from '@/data/interview/demo-data';
import { questionsToInterviewMarkdown } from '@/utils/interviewMarkdown';
import { mergePreloadedInterviewRecords } from '@/data/interview/preloaded-interviews';
import { interviewPersistStorage } from '@/store/interview-persist-storage';

export interface GeneratedSessionInput {
  companyName: string;
  departmentName: string;
  sessionName: string;
  date?: string;
  markdownContent: string;
  questions: InterviewQuestion[];
}

interface InterviewState {
  companies: Company[];
  favoriteQuestions: InterviewQuestion[];
  /** 生成面经时注入哪份简历；null 表示跟随简历模块的默认口径（最新上传的 PDF，其次主 Markdown） */
  aiResumeSource: InterviewResumeSource | null;
  lastVisitedCompany: string | null;
  lastVisitedDepartment: string | null;
  lastVisitedSession: string | null;

  // 公司操作
  addCompany: (name: string, color: string) => void;
  removeCompany: (companyId: string) => void;
  updateCompany: (companyId: string, name: string, color: string) => void;

  // 部门操作
  addDepartment: (companyId: string, name: string) => void;
  removeDepartment: (companyId: string, departmentId: string) => void;
  updateDepartment: (companyId: string, departmentId: string, name: string) => void;

  // 场次操作
  addSession: (companyId: string, departmentId: string, name: string, date: string) => void;
  removeSession: (companyId: string, departmentId: string, sessionId: string) => void;
  updateSessionName: (companyId: string, departmentId: string, sessionId: string, name: string) => void;
  updateSessionDate: (companyId: string, departmentId: string, sessionId: string, date: string) => void;
  updateSessionStatus: (companyId: string, departmentId: string, sessionId: string, status: InterviewStatus) => void;
  updateSessionMarkdown: (companyId: string, departmentId: string, sessionId: string, markdownContent: string) => void;

  // 问题操作
  addQuestion: (companyId: string, departmentId: string, sessionId: string, question: string, answer: string) => void;
  updateQuestion: (companyId: string, departmentId: string, sessionId: string, questionId: string, question: string, answer: string) => void;
  removeQuestion: (companyId: string, departmentId: string, sessionId: string, questionId: string) => void;

  // AI 生成面经：把生成结果写入指定的公司 / 岗位 / 场次（不存在则新建）
  createGeneratedSession: (input: GeneratedSessionInput) => {
    companyId: string;
    departmentId: string;
    sessionId: string;
  };

  // 掌握度操作，level 传 null 表示清除标记
  setQuestionMastery: (
    companyId: string,
    departmentId: string,
    sessionId: string,
    questionId: string,
    level: MasteryLevel | null
  ) => void;
  // 用当前文档重新解析出的题目覆盖 session.questions（编辑文档后保持收藏与掌握度的题目清单同步）
  syncSessionQuestions: (
    companyId: string,
    departmentId: string,
    sessionId: string,
    questions: InterviewQuestion[]
  ) => void;

  // 收藏操作
  toggleFavorite: (question: InterviewQuestion) => void;
  isFavorited: (questionId: string) => boolean;

  // AI 生成时注入的简历来源
  setAiResumeSource: (source: InterviewResumeSource | null) => void;

  // 访问记录
  setLastVisited: (companyId: string | null, departmentId: string | null, sessionId: string | null) => void;

  // 辅助方法
  getCompany: (companyId: string) => Company | undefined;
  getDepartment: (companyId: string, departmentId: string) => Department | undefined;
  getSession: (companyId: string, departmentId: string, sessionId: string) => InterviewSession | undefined;
}

const COMPANY_COLORS = [
  { name: '蓝色', value: 'blue' },
  { name: '绿色', value: 'green' },
  { name: '橙色', value: 'orange' },
  { name: '黄色', value: 'yellow' },
  { name: '紫色', value: 'purple' },
  { name: '红色', value: 'red' },
  { name: '粉色', value: 'pink' },
  { name: '青色', value: 'cyan' },
  { name: '灰色', value: 'gray' },
];

/** 新建公司时优先挑一个还没用过的颜色，用完则按下标循环 */
function nextCompanyColor(companies: Company[]): string {
  const used = new Set(companies.map((company) => company.color));
  const free = COMPANY_COLORS.find((option) => !used.has(option.value));
  return free?.value ?? COMPANY_COLORS[companies.length % COMPANY_COLORS.length].value;
}

// Key for localStorage initialization flag
const INIT_KEY = 'interview-storage-init';
const PRELOADED_MARKDOWN_COMPANIES = new Set(['meituan-local-commerce', 'company-meituan']);

type PersistedInterviewState = Pick<InterviewState,
  'companies' | 'favoriteQuestions' | 'aiResumeSource' | 'lastVisitedCompany' | 'lastVisitedDepartment' | 'lastVisitedSession'>;

function migratePreloadedInterviewMarkdown(companies: Company[]) {
  let changed = false;
  const migrated = companies.map((company) => {
    if (!PRELOADED_MARKDOWN_COMPANIES.has(company.id)) return company;
    let companyChanged = false;
    const departments = company.departments.map((department) => {
      let departmentChanged = false;
      const sessions = department.sessions.map((session) => {
        if (session.markdownContent !== undefined) return session;
        // These bundled documents are loaded on demand; do not replace them with
        // an empty generated document during initial store hydration.
        if (session.id.startsWith('session-import-')) return session;
        changed = true;
        companyChanged = true;
        departmentChanged = true;
        const title = `${company.name} · ${department.name} · ${session.name}`;
        return {
          ...session,
          markdownContent: questionsToInterviewMarkdown(session.questions, title),
        };
      });
      return departmentChanged ? { ...department, sessions } : department;
    });
    return companyChanged ? { ...company, departments } : company;
  });
  return changed ? migrated : companies;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      companies: [],
      favoriteQuestions: [],
      aiResumeSource: null,
      lastVisitedCompany: null,
      lastVisitedDepartment: null,
      lastVisitedSession: null,

      addCompany: (name, color) => {
        set((state) => ({
          companies: [
            ...state.companies,
            {
              id: crypto.randomUUID(),
              name,
              color,
              departments: [],
            },
          ],
        }));
      },

      removeCompany: (companyId) => {
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== companyId),
        }));
      },

      updateCompany: (companyId, name, color) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId ? { ...c, name, color } : c
          ),
        }));
      },

      addDepartment: (companyId, name) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: [
                    ...c.departments,
                    {
                      id: crypto.randomUUID(),
                      name,
                      sessions: [],
                    },
                  ],
                }
              : c
          ),
        }));
      },

      removeDepartment: (companyId, departmentId) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.filter((d) => d.id !== departmentId),
                }
              : c
          ),
        }));
      },

      updateDepartment: (companyId, departmentId, name) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId ? { ...d, name } : d
                  ),
                }
              : c
          ),
        }));
      },

      addSession: (companyId, departmentId, name, date) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: [
                            ...d.sessions,
                            {
                              id: crypto.randomUUID(),
                              name,
                              date,
                              status: 'waiting' as InterviewStatus,
                              questions: [],
                            },
                          ],
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      removeSession: (companyId, departmentId, sessionId) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.filter((s) => s.id !== sessionId),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      updateSessionDate: (companyId, departmentId, sessionId, date) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.map((s) =>
                            s.id === sessionId ? { ...s, date, updatedAt: Date.now() } : s
                          ),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      updateSessionName: (companyId, departmentId, sessionId, name) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.map((s) =>
                            s.id === sessionId ? { ...s, name, updatedAt: Date.now() } : s
                          ),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      updateSessionStatus: (companyId, departmentId, sessionId, status) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.map((s) =>
                            s.id === sessionId ? { ...s, status, updatedAt: Date.now() } : s
                          ),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      updateSessionMarkdown: (companyId, departmentId, sessionId, markdownContent) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  departments: company.departments.map((department) =>
                    department.id === departmentId
                      ? {
                          ...department,
                          sessions: department.sessions.map((session) =>
                            session.id === sessionId ? { ...session, markdownContent, updatedAt: Date.now() } : session
                          ),
                        }
                      : department
                  ),
                }
              : company
          ),
        }));
      },

      createGeneratedSession: (input) => {
        const companies = get().companies;
        const companyName = input.companyName.trim() || '未命名公司';
        const departmentName = input.departmentName.trim() || '未命名岗位';
        const sessionName = input.sessionName.trim() || '新场次';
        const now = Date.now();

        const existingCompany = companies.find((company) => company.name.trim() === companyName);
        const companyId = existingCompany?.id ?? crypto.randomUUID();
        const existingDepartment = existingCompany?.departments.find(
          (department) => department.name.trim() === departmentName
        );
        const departmentId = existingDepartment?.id ?? crypto.randomUUID();
        const sessionId = crypto.randomUUID();

        // 同岗位下已有同名场次时补序号，避免列表里出现两个一模一样的名字
        const duplicateCount =
          existingDepartment?.sessions.filter((session) => session.name === sessionName).length ?? 0;
        const finalSessionName =
          duplicateCount > 0 ? `${sessionName}（${duplicateCount + 1}）` : sessionName;

        const session: InterviewSession = {
          id: sessionId,
          name: finalSessionName,
          date: (input.date ?? '').trim(),
          status: 'waiting',
          questions: input.questions,
          markdownContent: input.markdownContent,
          updatedAt: now,
        };

        const department: Department = {
          id: departmentId,
          name: departmentName,
          sessions: [session],
        };

        set((state) => {
          if (!existingCompany) {
            return {
              companies: [
                ...state.companies,
                {
                  id: companyId,
                  name: companyName,
                  color: nextCompanyColor(state.companies),
                  departments: [department],
                },
              ],
            };
          }

          return {
            companies: state.companies.map((company) => {
              if (company.id !== companyId) return company;
              if (!existingDepartment) {
                return { ...company, departments: [...company.departments, department] };
              }
              return {
                ...company,
                departments: company.departments.map((item) =>
                  item.id === departmentId
                    ? { ...item, sessions: [...item.sessions, session] }
                    : item
                ),
              };
            }),
          };
        });

        return { companyId, departmentId, sessionId };
      },

      setQuestionMastery: (companyId, departmentId, sessionId, questionId, level) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id !== companyId
              ? company
              : {
                  ...company,
                  departments: company.departments.map((department) =>
                    department.id !== departmentId
                      ? department
                      : {
                          ...department,
                          sessions: department.sessions.map((session) => {
                            if (session.id !== sessionId) return session;
                            const mastery = { ...(session.mastery ?? {}) };
                            if (level === null) delete mastery[questionId];
                            else mastery[questionId] = level;
                            return { ...session, mastery, updatedAt: Date.now() };
                          }),
                        }
                  ),
                }
          ),
        }));
      },

      syncSessionQuestions: (companyId, departmentId, sessionId, questions) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id !== companyId
              ? company
              : {
                  ...company,
                  departments: company.departments.map((department) =>
                    department.id !== departmentId
                      ? department
                      : {
                          ...department,
                          sessions: department.sessions.map((session) => {
                            if (session.id !== sessionId) return session;
                            // 文档改动后题目可能增删，顺手清掉指向已消失题目的掌握度
                            const keep = new Set(questions.map((item) => item.id));
                            const mastery = Object.fromEntries(
                              Object.entries(session.mastery ?? {}).filter(([key]) => keep.has(key))
                            ) as Record<string, MasteryLevel>;
                            return { ...session, questions, mastery, updatedAt: Date.now() };
                          }),
                        }
                  ),
                }
          ),
        }));
      },

      addQuestion: (companyId, departmentId, sessionId, question, answer) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.map((s) =>
                            s.id === sessionId
                              ? {
                                  ...s,
                                  questions: [
                                    ...s.questions,
                                    {
                                      id: crypto.randomUUID(),
                                      question,
                                      answer,
                                    },
                                  ],
                                  updatedAt: Date.now(),
                                }
                              : s
                          ),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      updateQuestion: (companyId, departmentId, sessionId, questionId, question, answer) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.map((s) =>
                            s.id === sessionId
                              ? {
                                  ...s,
                                  questions: s.questions.map((q) =>
                                    q.id === questionId ? { ...q, question, answer } : q
                                  ),
                                  updatedAt: Date.now(),
                                }
                              : s
                          ),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      removeQuestion: (companyId, departmentId, sessionId, questionId) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  departments: c.departments.map((d) =>
                    d.id === departmentId
                      ? {
                          ...d,
                          sessions: d.sessions.map((s) =>
                            s.id === sessionId
                              ? {
                                  ...s,
                                  questions: s.questions.filter((q) => q.id !== questionId),
                                  updatedAt: Date.now(),
                                }
                              : s
                          ),
                        }
                      : d
                  ),
                }
              : c
          ),
        }));
      },

      setLastVisited: (companyId, departmentId, sessionId) => {
        set({
          lastVisitedCompany: companyId,
          lastVisitedDepartment: departmentId,
          lastVisitedSession: sessionId,
        });
      },

      getCompany: (companyId) => {
        return get().companies.find((c) => c.id === companyId);
      },

      getDepartment: (companyId, departmentId) => {
        const company = get().companies.find((c) => c.id === companyId);
        return company?.departments.find((d) => d.id === departmentId);
      },

      getSession: (companyId, departmentId, sessionId) => {
        const company = get().companies.find((c) => c.id === companyId);
        const department = company?.departments.find((d) => d.id === departmentId);
        return department?.sessions.find((s) => s.id === sessionId);
      },

      toggleFavorite: (question) => {
        set((state) => {
          const exists = state.favoriteQuestions.find((q) => q.id === question.id);
          if (exists) {
            return {
              favoriteQuestions: state.favoriteQuestions.filter((q) => q.id !== question.id),
            };
          } else {
            return {
              favoriteQuestions: [...state.favoriteQuestions, question],
            };
          }
        });
      },

      isFavorited: (questionId) => {
        return get().favoriteQuestions.some((q) => q.id === questionId);
      },

      setAiResumeSource: (source) => {
        set({ aiResumeSource: source });
      },
    }),
    {
      name: 'interview-storage',
      storage: interviewPersistStorage,
      partialize: (state): PersistedInterviewState => ({
        companies: state.companies,
        favoriteQuestions: state.favoriteQuestions,
        aiResumeSource: state.aiResumeSource,
        lastVisitedCompany: state.lastVisitedCompany,
        lastVisitedDepartment: state.lastVisitedDepartment,
        lastVisitedSession: state.lastVisitedSession,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<InterviewState>;
        let companies = Array.isArray(persisted.companies)
          ? persisted.companies
          : currentState.companies;

        // Keep the existing first-run demo behavior, then merge bundled imports even
        // for users whose browser already contains an empty/older interview snapshot.
        if (companies.length === 0 && !localStorage.getItem(INIT_KEY)) {
          companies = DEMO_DATA;
          localStorage.setItem(INIT_KEY, 'true');
        }

        const withImportedRecords = mergePreloadedInterviewRecords(companies);
        return {
          ...currentState,
          ...persisted,
          companies: migratePreloadedInterviewMarkdown(withImportedRecords),
        };
      },
    }
  )
);

export const COMPANY_COLOR_OPTIONS = COMPANY_COLORS;
