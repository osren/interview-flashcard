import type { Company, InterviewSession } from '@/types/interview';

interface PreloadedSessionRecord {
  company: Pick<Company, 'id' | 'name' | 'color'>;
  department: { id: string; name: string };
  session: InterviewSession;
}

const PRELOADED_RECORDS: PreloadedSessionRecord[] = [
  {
    company: { id: 'company-tuhu', name: '途虎养车', color: 'orange' },
    department: { id: 'dept-tuhu-fullstack', name: '全栈开发工程师' },
    session: { id: 'session-import-tuhu-ai', name: 'AI 面试', date: '', status: 'waiting', questions: [] },
  },
  {
    company: { id: 'company-pingan', name: '中国平安', color: 'blue' },
    department: { id: 'dept-pingan-frontend-ai', name: '前端开发工程师（AI方向）· 平安科技-南京分公司' },
    session: { id: 'session-import-pingan-business', name: '业务初面（15min）', date: '', status: 'waiting', questions: [] },
  },
  {
    company: { id: 'company-meituan', name: '美团', color: 'orange' },
    department: { id: 'dept-saas', name: 'Saas' },
    session: { id: 'session-import-meituan-saas', name: '一面（Markdown 导入）', date: '', status: 'waiting', questions: [] },
  },
  {
    company: { id: 'meituan-local-commerce', name: '美团 - 本地核心商业', color: 'orange' },
    department: { id: 'dept-first-round', name: '一面' },
    session: { id: 'session-import-meituan-local-commerce', name: '技术一面（Markdown 导入）', date: '', status: 'waiting', questions: [] },
  },
];

/** Load the actual documents only when the interview area is opened. */
export async function loadPreloadedInterviewRecords(): Promise<PreloadedSessionRecord[]> {
  const documents = await Promise.all([
    import('./preloaded/tuhu-fullstack-ai.md?raw'),
    import('./preloaded/pingan-frontend-ai.md?raw'),
    import('./preloaded/meituan-saas-first-round.md?raw'),
    import('./preloaded/meituan-local-commerce-tech-round.md?raw'),
  ]);
  return PRELOADED_RECORDS.map((record, index) => ({
    ...record,
    session: { ...record.session, markdownContent: documents[index].default },
  }));
}

/** Append bundled interview documents without replacing a user's existing notes. */
export function mergePreloadedInterviewRecords(
  companies: Company[],
  records: PreloadedSessionRecord[] = PRELOADED_RECORDS,
): Company[] {
  let nextCompanies = companies;

  for (const record of records) {
    const companyIndex = nextCompanies.findIndex((company) => company.id === record.company.id);
    if (companyIndex < 0) {
      nextCompanies = [...nextCompanies, {
        ...record.company,
        departments: [{ ...record.department, sessions: [record.session] }],
      }];
      continue;
    }

    const currentCompany = nextCompanies[companyIndex];
    const departmentIndex = currentCompany.departments.findIndex(
      (department) => department.id === record.department.id,
    );
    let departments = currentCompany.departments;
    if (departmentIndex < 0) {
      departments = [...departments, { ...record.department, sessions: [record.session] }];
    } else {
      const currentDepartment = departments[departmentIndex];
      const sessionIndex = currentDepartment.sessions.findIndex((session) => session.id === record.session.id);
      if (sessionIndex < 0) {
        departments = departments.map((department, index) => index === departmentIndex
          ? { ...department, sessions: [...department.sessions, record.session] }
          : department);
      } else {
        const currentSession = currentDepartment.sessions[sessionIndex];
        if (currentSession.markdownContent !== undefined || record.session.markdownContent === undefined) continue;
        departments = departments.map((department, index) => index === departmentIndex
          ? {
              ...department,
              sessions: department.sessions.map((session, currentIndex) => currentIndex === sessionIndex
                ? { ...session, markdownContent: record.session.markdownContent }
                : session),
            }
          : department);
      }
    }

    nextCompanies = nextCompanies.map((company, index) => index === companyIndex
      ? { ...company, departments }
      : company);
  }

  return nextCompanies;
}
