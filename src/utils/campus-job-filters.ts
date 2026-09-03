import type { CampusJobData, CustomCompany } from '@/types/campus-job';

export function shouldShowCampusJob(
  job: CampusJobData,
  filter: 'all' | 'qualified'
): boolean {
  if (filter === 'all') {
    return true;
  }
  return job.match.qualified || job.source === 'custom';
}

export function ensureCustomCompaniesForJobs(
  customCompanies: CustomCompany[],
  customJobs: CampusJobData[]
): CustomCompany[] {
  const existing = new Set(customCompanies.map((company) => company.name));
  const next = [...customCompanies];

  for (const job of customJobs) {
    const name = job.basic.company.trim();
    if (!name || existing.has(name)) {
      continue;
    }
    existing.add(name);
    next.push({
      id: crypto.randomUUID(),
      name,
      color: 'gray',
    });
  }

  return next;
}

/** 公司下已无可见岗位时，移除对应自定义公司条目 */
export function pruneCompaniesWithoutJobs(
  customCompanies: CustomCompany[],
  visibleJobs: CampusJobData[],
  removedCompanyName?: string
): CustomCompany[] {
  if (!removedCompanyName) return customCompanies;
  const stillHasJobs = visibleJobs.some((j) => j.basic.company === removedCompanyName);
  if (stillHasJobs) return customCompanies;
  return customCompanies.filter((c) => c.name !== removedCompanyName);
}
