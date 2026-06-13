import { TrendingProject } from '@/data/ai/github-trending';

export interface FavoriteItem extends TrendingProject {
  note: string;
  savedAt: number;
}

const FAVORITES_KEY = 'github-trending-favorites';

export const getFavorites = (): Record<string, FavoriteItem> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveFavorite = (project: TrendingProject, note: string): void => {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  favorites[project.id] = {
    ...project,
    note,
    savedAt: Date.now(),
  };
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const removeFavorite = (projectId: string): void => {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  delete favorites[projectId];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const isFavorite = (projectId: string): boolean => {
  const favorites = getFavorites();
  return !!favorites[projectId];
};

export const getFavoriteNote = (projectId: string): string | undefined => {
  const favorites = getFavorites();
  return favorites[projectId]?.note;
};