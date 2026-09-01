import type { CardStatus, FlashCard } from '@/types';
import type { CheckInDateKey } from '@/types/streak';
import { mergeCheckInDates } from '@/utils/streak';
import { useCardStore } from '@/store/useCardStore';
import { useStreakStore } from '@/store/useStreakStore';
import { supabase } from '@/lib/supabase/client';

export interface LearningSyncPayload {
  cardStatuses: Record<string, CardStatus>;
  cardProgress: Record<string, number>;
  customCards: FlashCard[];
  modifiedCards: Record<string, Partial<FlashCard>>;
  favorites: FlashCard[];
  checkInDates: Record<CheckInDateKey, true>;
}

interface LearningSyncRow {
  user_id: string;
  payload: LearningSyncPayload;
  updated_at: string;
}

const EMPTY_PAYLOAD: LearningSyncPayload = {
  cardStatuses: {},
  cardProgress: {},
  customCards: [],
  modifiedCards: {},
  favorites: [],
  checkInDates: {},
};

const STATUS_PRIORITY: Record<CardStatus, number> = {
  unvisited: 0,
  forgotten: 1,
  fuzzy: 2,
  mastered: 3,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeCardStatus(a: CardStatus, b: CardStatus): CardStatus {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

function mergeFlashCardsById(local: FlashCard[], remote: FlashCard[]): FlashCard[] {
  const map = new Map<string, FlashCard>();
  for (const card of remote) map.set(card.id, card);
  for (const card of local) map.set(card.id, card);
  return [...map.values()];
}

function mergePartialCards(
  local: Record<string, Partial<FlashCard>>,
  remote: Record<string, Partial<FlashCard>>
): Record<string, Partial<FlashCard>> {
  const merged = { ...remote };
  for (const [id, value] of Object.entries(local)) {
    merged[id] = { ...remote[id], ...value };
  }
  return merged;
}

function normalizePayload(raw: unknown): LearningSyncPayload {
  if (!isRecord(raw)) return { ...EMPTY_PAYLOAD };

  return {
    cardStatuses: isRecord(raw.cardStatuses)
      ? (raw.cardStatuses as Record<string, CardStatus>)
      : {},
    cardProgress: isRecord(raw.cardProgress)
      ? Object.fromEntries(
          Object.entries(raw.cardProgress).filter(([, v]) => typeof v === 'number')
        )
      : {},
    customCards: Array.isArray(raw.customCards) ? (raw.customCards as FlashCard[]) : [],
    modifiedCards: isRecord(raw.modifiedCards)
      ? (raw.modifiedCards as Record<string, Partial<FlashCard>>)
      : {},
    favorites: Array.isArray(raw.favorites) ? (raw.favorites as FlashCard[]) : [],
    checkInDates: isRecord(raw.checkInDates)
      ? Object.fromEntries(
          Object.entries(raw.checkInDates).filter(([, v]) => v === true)
        )
      : {},
  };
}

export function mergeLearningPayload(
  local: LearningSyncPayload,
  remote: LearningSyncPayload | null
): LearningSyncPayload {
  if (!remote) return local;

  const cardStatuses = { ...remote.cardStatuses };
  for (const [cardId, status] of Object.entries(local.cardStatuses)) {
    cardStatuses[cardId] = remote.cardStatuses[cardId]
      ? mergeCardStatus(status, remote.cardStatuses[cardId])
      : status;
  }

  const cardProgress = { ...remote.cardProgress };
  for (const [key, index] of Object.entries(local.cardProgress)) {
    cardProgress[key] = Math.max(index, remote.cardProgress[key] ?? 0);
  }

  return {
    cardStatuses,
    cardProgress,
    customCards: mergeFlashCardsById(local.customCards, remote.customCards),
    modifiedCards: mergePartialCards(local.modifiedCards, remote.modifiedCards),
    favorites: mergeFlashCardsById(local.favorites, remote.favorites),
    checkInDates: mergeCheckInDates(local.checkInDates, remote.checkInDates),
  };
}

export async function fetchLearningSync(
  userId: string
): Promise<LearningSyncPayload | null> {
  const { data, error } = await supabase
    .from('learning_sync')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return normalizePayload((data as Pick<LearningSyncRow, 'payload'>).payload);
}

export async function saveLearningSync(
  userId: string,
  payload: LearningSyncPayload
): Promise<string> {
  const { data, error } = await supabase
    .from('learning_sync')
    .upsert(
      {
        user_id: userId,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('updated_at')
    .single();

  if (error) throw new Error(error.message);

  return (data as Pick<LearningSyncRow, 'updated_at'>).updated_at;
}

export function buildLearningSyncPayload(): LearningSyncPayload {
  const cardState = useCardStore.getState();
  const streakState = useStreakStore.getState();

  return {
    cardStatuses: cardState.cardStatuses,
    cardProgress: cardState.cardProgress,
    customCards: cardState.customCards,
    modifiedCards: cardState.modifiedCards,
    favorites: cardState.favorites,
    checkInDates: streakState.checkInDates,
  };
}

export function applyLearningSyncPayload(payload: LearningSyncPayload): void {
  useCardStore.getState().importSyncedState({
    cardStatuses: payload.cardStatuses,
    cardProgress: payload.cardProgress,
    customCards: payload.customCards,
    modifiedCards: payload.modifiedCards,
    favorites: payload.favorites,
  });
  useStreakStore.getState().importSyncedState(payload.checkInDates);
}
