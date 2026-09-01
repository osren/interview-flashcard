import type { FlashCard } from '@/types';

type ProjectLoader = () => Promise<FlashCard[]>;

const projectLoaders: Record<string, ProjectLoader> = {
  didi: () => import('./didi_new').then((m) => m.didiCards),
  'ai-monitor': () => import('./ai-monitor').then((m) => m.aiMonitorCards),
  gresume: () => import('./gresume').then((m) => m.gresumeCards),
};

const cache = new Map<string, FlashCard[]>();
const inflight = new Map<string, Promise<FlashCard[]>>();

export async function loadProjectCards(projectId: string): Promise<FlashCard[]> {
  const cached = cache.get(projectId);
  if (cached) return cached;

  const existing = inflight.get(projectId);
  if (existing) return existing;

  const loader = projectLoaders[projectId];
  if (!loader) return [];

  const promise = loader().then((cards) => {
    cache.set(projectId, cards);
    inflight.delete(projectId);
    return cards;
  });
  inflight.set(projectId, promise);
  return promise;
}

export async function loadAllProjectCards(): Promise<FlashCard[]> {
  const ids = Object.keys(projectLoaders);
  const groups = await Promise.all(ids.map((id) => loadProjectCards(id)));
  return groups.flat();
}
