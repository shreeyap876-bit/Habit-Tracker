import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';

/**
 * The client works in the user's *local* calendar day, then sends plain
 * `YYYY-MM-DD` keys to the API. Using `date-fns` formatting rather than
 * `toISOString` keeps a late-evening tick from rolling into tomorrow.
 */

/** `Date` → `YYYY-MM-DD` in local time. */
export const toDateKey = (date) => format(date, 'yyyy-MM-dd');

/** `YYYY-MM-DD` → local `Date` at midnight. */
export const fromDateKey = (key) => parseISO(key);

/** Today, as the user's browser sees it. */
export const todayKey = () => toDateKey(new Date());

/** Monday of the week containing `key`. */
export const weekStartKey = (key) => toDateKey(startOfWeek(fromDateKey(key), { weekStartsOn: 1 }));

/** The seven date keys of that week, Monday first. */
export function weekKeys(key) {
  const monday = fromDateKey(weekStartKey(key));
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)));
}

export const shiftWeeks = (key, amount) => toDateKey(addDays(fromDateKey(key), amount * 7));

export const shiftDays = (key, amount) => toDateKey(addDays(fromDateKey(key), amount));

/** Weekday number for a date key: `0` (Sunday) through `6` (Saturday). */
export const weekdayOf = (key) => fromDateKey(key).getDay();

export const isToday = (key) => isSameDay(fromDateKey(key), new Date());

export const isFuture = (key) => key > todayKey();

/** Short weekday initial-set used above the tracker circles, e.g. "Mon". */
export const shortWeekday = (key) => format(fromDateKey(key), 'EEE');

export const dayNumber = (key) => format(fromDateKey(key), 'd');

/** "6 August 2026" */
export const longDate = (key) => format(fromDateKey(key), 'd MMMM yyyy');

/** "Thursday, 6 August" */
export const friendlyDate = (key) => format(fromDateKey(key), 'EEEE, d MMMM');

/** "3 – 9 Aug 2026", collapsing the month when both ends share one. */
export function weekLabel(key) {
  const [start] = weekKeys(key);
  const end = weekKeys(key)[6];
  const startDate = fromDateKey(start);
  const endDate = fromDateKey(end);

  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const left = format(startDate, sameMonth ? 'd' : 'd MMM');

  return `${left} – ${format(endDate, 'd MMM yyyy')}`;
}

export const timeLabel = (isoString) => format(new Date(isoString), 'HH:mm');

/** "Good morning" / "Good afternoon" / "Good evening". */
export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
