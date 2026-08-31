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
