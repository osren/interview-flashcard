import type { Company, InterviewSession } from '@/types/interview';
import tuhuMarkdown from './preloaded/tuhu-fullstack-ai.md?raw';
import pinganMarkdown from './preloaded/pingan-frontend-ai.md?raw';
import meituanSaasMarkdown from './preloaded/meituan-saas-first-round.md?raw';
import meituanLocalMarkdown from './preloaded/meituan-local-commerce-tech-round.md?raw';

interface PreloadedSessionRecord {
  company: Pick<Company, 'id' | 'name' | 'color'>;
  department: { id: string; name: string };
  session: InterviewSession;
}

const importedSession = (id: string, name: string, markdownContent: string): InterviewSession => ({
  id,
  name,
  date: '',
  status: 'waiting',
  questions: [],
  markdownContent,
});

const PRELOADED_RECORDS: PreloadedSessionRecord[] = [
  {
    company: { id: 'company-tuhu', name: '途虎养车', color: 'orange' },
    department: { id: 'dept-tuhu-fullstack', name: '全栈开发工程师' },
    session: importedSession('session-import-tuhu-ai', 'AI 面试', tuhuMarkdown),
  },
  {
    company: { id: 'company-pingan', name: '中国平安', color: 'blue' },
    department: { id: 'dept-pingan-frontend-ai', name: '前端开发工程师（AI方向）· 平安科技-南京分公司' },
    session: importedSession('session-import-pingan-business', '业务初面（15min）', pinganMarkdown),
  },
  {
    company: { id: 'company-meituan', name: '美团', color: 'orange' },
    department: { id: 'dept-saas', name: 'Saas' },
    session: importedSession('session-import-meituan-saas', '一面（Markdown 导入）', meituanSaasMarkdown),
  },
  {
    company: { id: 'meituan-local-commerce', name: '美团 - 本地核心商业', color: 'orange' },
    department: { id: 'dept-first-round', name: '一面' },
    session: importedSession('session-import-meituan-local-commerce', '技术一面（Markdown 导入）', meituanLocalMarkdown),
  },
];

/** Append bundled interview documents without replacing a user's existing company, notes, or sessions. */
export function mergePreloadedInterviewRecords(companies: Company[]): Company[] {
  let nextCompanies = companies;

  for (const record of PRELOADED_RECORDS) {
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
      (department) => department.id === record.department.id
    );
    let departments = currentCompany.departments;
    if (departmentIndex < 0) {
      departments = [...departments, { ...record.department, sessions: [record.session] }];
    } else {
      const currentDepartment = departments[departmentIndex];
      if (currentDepartment.sessions.some((session) => session.id === record.session.id)) continue;
      departments = departments.map((department, index) => index === departmentIndex
        ? { ...department, sessions: [...department.sessions, record.session] }
        : department);
    }

    nextCompanies = nextCompanies.map((company, index) => index === companyIndex
      ? { ...company, departments }
      : company);
  }

  return nextCompanies;
}
