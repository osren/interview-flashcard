export { coreChapters, CORE_TOTAL_CARD_COUNT } from './chapters-meta';
export { loadCoreChapterCards, loadAllCoreCards, getCoreChapterLoaderIds } from './loadChapter';

import type { FlashCard } from '@/types';
import { loadAllCoreCards } from './loadChapter';

/**
 * @deprecated Prefer loadCoreChapterCards / loadAllCoreCards for code-splitting.
 * Kept as empty sync stub so accidental sync imports don't pull the full dataset.
 * Callers that need cards must use the async loaders.
 */
export const coreCards: FlashCard[] = [];

/** Eager-load helper for rare sync migration paths */
export async function ensureCoreCardsLoaded(): Promise<FlashCard[]> {
  return loadAllCoreCards();
}
