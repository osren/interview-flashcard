import { CardStatus, FlashCard } from '@/types';
import { migrateCardStatusRecord, normalizeCardStatus } from '@/utils/cardStatus';

interface PersistedCardSlice {
  cardStatuses?: Record<string, CardStatus>;
  cards?: Array<{ id?: string; status?: CardStatus | string }>;
  customCards?: Array<Pick<FlashCard, 'id'> & { status?: CardStatus | string }>;
}

/** Merge legacy persist shapes (`cards: [{id,status}]`) into a durable id → status map. */
export function migratePersistedCardStatuses(
  persisted: PersistedCardSlice | null | undefined
): Record<string, CardStatus> {
  const cardStatuses = migrateCardStatusRecord(persisted?.cardStatuses);

  if (Array.isArray(persisted?.cards)) {
    for (const card of persisted.cards) {
      if (card?.id && card.status && card.status !== 'unvisited' && !cardStatuses[card.id]) {
        const status = normalizeCardStatus(card.status);
        if (status !== 'unvisited') {
          cardStatuses[card.id] = status;
        }
      }
    }
  }

  if (Array.isArray(persisted?.customCards)) {
    for (const card of persisted.customCards) {
      if (card.id && card.status && card.status !== 'unvisited' && !cardStatuses[card.id]) {
        const status = normalizeCardStatus(card.status);
        if (status !== 'unvisited') {
          cardStatuses[card.id] = status;
        }
      }
    }
  }

  return cardStatuses;
}
