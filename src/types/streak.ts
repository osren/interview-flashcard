/** YYYY-MM-DD */
export type CheckInDateKey = string;

export interface StreakState {
  /** Dates the user recorded learning progress */
  checkInDates: Record<CheckInDateKey, true>;
}

export interface CalendarDay {
  date: Date;
  dateKey: CheckInDateKey;
  isCurrentMonth: boolean;
  isToday: boolean;
  isCheckedIn: boolean;
  isFuture: boolean;
}
