export { projectChapters, PROJECT_TOTAL_CARD_COUNT } from './chapters-meta';
export { loadProjectCards, loadAllProjectCards } from './loadProject';

import type { FlashCard } from '@/types';

/** @deprecated Prefer loadProjectCards / loadAllProjectCards */
export const projectCards: FlashCard[] = [];
