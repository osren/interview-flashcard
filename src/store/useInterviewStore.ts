import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, Department, InterviewSession, InterviewStatus } from '@/types/interview';

interface InterviewState {
  companies: Company[];
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

  // 问题操作
  addQuestion: (companyId: string, departmentId: string, sessionId: string, question: string, answer: string) => void;
  updateQuestion: (companyId: string, departmentId: string, sessionId: string, questionId: string, question: string, answer: string) => void;
  removeQuestion: (companyId: string, departmentId: string, sessionId: string, questionId: string) => void;

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

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      companies: [],
      lastVisitedCompany: null,
      lastVisitedDepartment: null,
      lastVisitedSession: null,

      addCompany: (name, color) => {
        set((state) => ({
          companies: [
            ...state.companies,
            {
              id: `company-${Date.now()}`,
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
                      id: `dept-${Date.now()}`,
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
                              id: `session-${Date.now()}`,
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
                            s.id === sessionId ? { ...s, date } : s
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
                            s.id === sessionId ? { ...s, name } : s
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
                            s.id === sessionId ? { ...s, status } : s
                          ),
                        }
                      : d
                  ),
                }
              : c
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
                                      id: `q-${Date.now()}`,
                                      question,
                                      answer,
                                    },
                                  ],
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
    }),
    {
      name: 'interview-storage',
    }
  )
);

// 导出公司颜色选项供组件使用
export const COMPANY_COLOR_OPTIONS = COMPANY_COLORS;
