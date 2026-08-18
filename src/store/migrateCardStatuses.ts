import { CardStatus, FlashCard } from '@/types';

interface PersistedCardSlice {
  cardStatuses?: Record<string, CardStatus>;
  cards?: Array<{ id?: string; status?: CardStatus }>;
  customCards?: Array<Pick<FlashCard, 'id'> & { status?: CardStatus }>;
}

const VALID_STATUSES: CardStatus[] = ['unvisited', 'forgotten', 'fuzzy', 'mastered'];

function isCardStatus(value: unknown): value is CardStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as CardStatus);
}

/** Merge legacy persist shapes (`cards: [{id,status}]`) into a durable id → status map. */
export function migratePersistedCardStatuses(
  persisted: PersistedCardSlice | null | undefined
): Record<string, CardStatus> {
  const cardStatuses: Record<string, CardStatus> = { ...(persisted?.cardStatuses ?? {}) };

  if (Array.isArray(persisted?.cards)) {
    for (const card of persisted.cards) {
      if (card?.id && isCardStatus(card.status) && card.status !== 'unvisited' && !cardStatuses[card.id]) {
        cardStatuses[card.id] = card.status;
      }
    }
  }

  if (Array.isArray(persisted?.customCards)) {
    for (const card of persisted.customCards) {
      if (card.id && isCardStatus(card.status) && card.status !== 'unvisited' && !cardStatuses[card.id]) {
        cardStatuses[card.id] = card.status;
      }
    }
  }

  return cardStatuses;
}
