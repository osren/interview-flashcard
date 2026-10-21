import type { CalendarDay, CheckInDateKey } from '@/types/streak';

export function formatDateKey(date: Date): CheckInDateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: CheckInDateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isCheckedIn(
  checkInDates: Record<CheckInDateKey, true>,
  dateKey: CheckInDateKey
): boolean {
  return Boolean(checkInDates[dateKey]);
}

/** Duolingo-style streak: consecutive days ending today or yesterday */
export function calculateStreak(
  checkInDates: Record<CheckInDateKey, true>,
  referenceDate: Date = new Date()
): number {
  const todayKey = formatDateKey(referenceDate);
  let cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);

  if (!checkInDates[todayKey]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (checkInDates[formatDateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年${month + 1}月`;
}

/** Mon(0) … Sun(6) weekday labels */
export const WEEKDAY_LABELS_MON_FIRST = ['一', '二', '三', '四', '五', '六', '日'] as const;

/** Current calendar week Mon–Sun containing referenceDate */
export function buildCurrentWeekDays(
  checkInDates: Record<CheckInDateKey, true>,
  referenceDate: Date = new Date()
): CalendarDay[] {
  const todayKey = formatDateKey(referenceDate);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const jsDay = ref.getDay();
  const daysFromMonday = jsDay === 0 ? 6 : jsDay - 1;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - daysFromMonday);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateKey = formatDateKey(date);

    days.push({
      date,
      dateKey,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isCheckedIn: Boolean(checkInDates[dateKey]),
      isFuture: dateKey > todayKey,
    });
  }

  return days;
}

export function buildMonthCalendar(
  year: number,
  month: number,
  checkInDates: Record<CheckInDateKey, true>,
  referenceDate: Date = new Date()
): CalendarDay[] {
  const todayKey = formatDateKey(referenceDate);
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const dateKey = formatDateKey(date);
    const isFuture = dateKey > todayKey;

    days.push({
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
      isCheckedIn: Boolean(checkInDates[dateKey]),
      isFuture,
    });
  }

  return days;
}

export function mergeCheckInDates(
  local: Record<CheckInDateKey, true>,
  remote: Record<CheckInDateKey, true> | undefined
): Record<CheckInDateKey, true> {
  if (!remote) return { ...local };
  return { ...remote, ...local };
}
