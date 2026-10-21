import type { CardStatus, FlashCard } from '@/types';

/** @deprecated legacy statuses from older persist/sync payloads */
const LEGACY_STATUS_MAP: Record<string, CardStatus> = {
  forgotten: 'review',
  fuzzy: 'review',
  mastered: 'remembered',
};

export function normalizeCardStatus(status: unknown): CardStatus {
  if (status === 'unvisited' || status === 'remembered' || status === 'review') {
    return status;
  }
  if (typeof status === 'string' && status in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[status];
  }
  return 'unvisited';
}

export function isRemembered(status: CardStatus | undefined): boolean {
  return normalizeCardStatus(status) === 'remembered';
}

export function resolveCardStatus(
  cardId: string,
  cardStatuses: Record<string, CardStatus>,
  fallback?: CardStatus
): CardStatus {
  const raw = cardStatuses[cardId] ?? fallback ?? 'unvisited';
  return normalizeCardStatus(raw);
}

/** First card not marked as remembered; falls back to 0 when all are remembered. */
export function findFirstUnrememberedIndex(
  cards: FlashCard[],
  cardStatuses: Record<string, CardStatus>
): number {
  const index = cards.findIndex(
    (card) => !isRemembered(resolveCardStatus(card.id, cardStatuses, card.status))
  );
  return index >= 0 ? index : 0;
}

export function migrateCardStatusRecord(
  cardStatuses: Record<string, CardStatus> | undefined
): Record<string, CardStatus> {
  if (!cardStatuses) return {};
  return Object.fromEntries(
    Object.entries(cardStatuses).map(([id, status]) => [id, normalizeCardStatus(status)])
  );
}
