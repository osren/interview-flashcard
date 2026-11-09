import type { CardStatus, FlashCard } from '@/types';
import type { CheckInDateKey } from '@/types/streak';
import { mergeCheckInDates } from '@/utils/streak';
import { migrateCardStatusRecord, normalizeCardStatus } from '@/utils/cardStatus';
import { useCardStore, type HiddenCardEntry } from '@/store/useCardStore';
import { useStreakStore } from '@/store/useStreakStore';
import { supabase } from '@/lib/supabase/client';

export interface LearningSyncPayload {
  cardStatuses: Record<string, CardStatus>;
  cardProgress: Record<string, number>;
  customCards: FlashCard[];
  modifiedCards: Record<string, Partial<FlashCard>>;
  /** 删除/隐藏台账，多端按 at 取较新的一条 */
  hiddenCards: Record<string, HiddenCardEntry>;
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
  hiddenCards: {},
  favorites: [],
  checkInDates: {},
};

const STATUS_PRIORITY: Record<CardStatus, number> = {
  unvisited: 0,
  review: 1,
  remembered: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeCardStatus(a: CardStatus, b: CardStatus): CardStatus {
  const normalizedA = normalizeCardStatus(a);
  const normalizedB = normalizeCardStatus(b);
  return STATUS_PRIORITY[normalizedA] >= STATUS_PRIORITY[normalizedB] ? normalizedA : normalizedB;
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

function normalizeHiddenCards(raw: unknown): Record<string, HiddenCardEntry> {
  if (!isRecord(raw)) return {};
  const result: Record<string, HiddenCardEntry> = {};
  for (const [cardId, value] of Object.entries(raw)) {
    if (!isRecord(value)) continue;
    if (typeof value.hidden !== 'boolean') continue;
    result[cardId] = {
      hidden: value.hidden,
      at: typeof value.at === 'number' ? value.at : 0,
    };
  }
  return result;
}

/** 同一张卡两边都有记录时，取时间较新的一条（同时间以本地为准） */
function mergeHiddenCards(
  local: Record<string, HiddenCardEntry>,
  remote: Record<string, HiddenCardEntry>
): Record<string, HiddenCardEntry> {
  const merged: Record<string, HiddenCardEntry> = { ...remote };
  for (const [cardId, entry] of Object.entries(local)) {
    const remoteEntry = remote[cardId];
    if (!remoteEntry || entry.at >= remoteEntry.at) merged[cardId] = entry;
  }
  return merged;
}

function hiddenIdSet(hiddenCards: Record<string, HiddenCardEntry>): Set<string> {
  return new Set(
    Object.entries(hiddenCards)
      .filter(([, entry]) => entry.hidden)
      .map(([cardId]) => cardId)
  );
}

function normalizePayload(raw: unknown): LearningSyncPayload {
  if (!isRecord(raw)) return { ...EMPTY_PAYLOAD };

  return {
    cardStatuses: migrateCardStatusRecord(
      isRecord(raw.cardStatuses)
        ? (raw.cardStatuses as Record<string, CardStatus>)
        : undefined
    ),
    cardProgress: isRecord(raw.cardProgress)
      ? (Object.fromEntries(
          Object.entries(raw.cardProgress).filter(([, v]) => typeof v === 'number')
        ) as Record<string, number>)
      : {},
    customCards: Array.isArray(raw.customCards) ? (raw.customCards as FlashCard[]) : [],
    modifiedCards: isRecord(raw.modifiedCards)
      ? (raw.modifiedCards as Record<string, Partial<FlashCard>>)
      : {},
    hiddenCards: normalizeHiddenCards(raw.hiddenCards),
    favorites: Array.isArray(raw.favorites) ? (raw.favorites as FlashCard[]) : [],
    checkInDates: isRecord(raw.checkInDates)
      ? (Object.fromEntries(
          Object.entries(raw.checkInDates).filter(([, v]) => v === true)
        ) as Record<CheckInDateKey, true>)
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

  const hiddenCards = mergeHiddenCards(local.hiddenCards, remote.hiddenCards);
  const deleted = hiddenIdSet(hiddenCards);

  return {
    cardStatuses,
    cardProgress,
    // 并集合并会让"本地已删除、云端还在"的卡片复活，这里用删除台账把它们压住
    customCards: mergeFlashCardsById(local.customCards, remote.customCards).filter(
      (card) => !deleted.has(card.id)
    ),
    modifiedCards: mergePartialCards(local.modifiedCards, remote.modifiedCards),
    hiddenCards,
    favorites: mergeFlashCardsById(local.favorites, remote.favorites).filter(
      (card) => !deleted.has(card.id)
    ),
    checkInDates: mergeCheckInDates(local.checkInDates, remote.checkInDates),
  };
}

function isSupabaseTableMissingError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST205' ||
    (typeof error.message === 'string' &&
      error.message.includes("Could not find the table 'public.learning_sync'"))
  );
}

export async function fetchLearningSync(
  userId: string
): Promise<LearningSyncPayload | null> {
  const { data, error } = await supabase
    .from('learning_sync')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (isSupabaseTableMissingError(error)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  return normalizePayload((data as Pick<LearningSyncRow, 'payload'>).payload);
}

export async function saveLearningSync(
  userId: string,
  payload: LearningSyncPayload
): Promise<string | null> {
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

  if (error) {
    if (isSupabaseTableMissingError(error)) return null;
    throw new Error(error.message);
  }

  return (data as Pick<LearningSyncRow, 'updated_at'>).updated_at;
}

export function isLearningSyncTableMissingError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('learning_sync') || error.message.includes('PGRST205');
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return isSupabaseTableMissingError(error as { code?: string; message?: string });
  }
  return false;
}

export function buildLearningSyncPayload(): LearningSyncPayload {
  const cardState = useCardStore.getState();
  const streakState = useStreakStore.getState();

  return {
    cardStatuses: cardState.cardStatuses,
    cardProgress: cardState.cardProgress,
    customCards: cardState.customCards,
    modifiedCards: cardState.modifiedCards,
    hiddenCards: cardState.hiddenCards,
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
    hiddenCards: payload.hiddenCards,
    favorites: payload.favorites,
  });
  useStreakStore.getState().importSyncedState(payload.checkInDates);
}
