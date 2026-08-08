/**
 * Habit completion is a calendar-day concept, so dates are stored and compared
 * as plain `YYYY-MM-DD` keys. Every helper here parses those keys at UTC
 * midnight, which keeps arithmetic free of timezone and DST drift.
 */

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

/** `Date` → `YYYY-MM-DD` using UTC parts. */
export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** `YYYY-MM-DD` → `Date` at UTC midnight. */
export function parseDateKey(key) {
  return new Date(`${key}T00:00:00.000Z`);
}

/** Today in UTC terms. Clients send their own local date for user-facing writes. */
export function todayKey() {
  return toDateKey(new Date());
}

export function addDays(key, amount) {
  const date = parseDateKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateKey(date);
}

/** Day of week as `0` (Sunday) through `6` (Saturday). */
export function dayOfWeek(key) {
  return parseDateKey(key).getUTCDay();
}

/** Monday of the week containing `key`. */
export function startOfWeek(key) {
  const weekday = dayOfWeek(key);
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(key, offset);
}

/** The seven `YYYY-MM-DD` keys of the week containing `key`, Monday first. */
export function weekRange(key) {
  const monday = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Inclusive list of date keys between two keys. */
export function eachDay(startKey, endKey) {
  const days = [];
  let cursor = startKey;
  while (cursor <= endKey) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

/** Number of whole days between two keys (`end - start`). */
export function daysBetween(startKey, endKey) {
  return Math.round((parseDateKey(endKey) - parseDateKey(startKey)) / 86_400_000);
}
