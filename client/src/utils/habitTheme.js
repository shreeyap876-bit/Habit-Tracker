/** Colour tokens a habit can use. Mirrors server/src/config/constants.js. */
export const HABIT_COLORS = ['sage', 'clay', 'sky', 'lavender', 'amber', 'rose'];

/** Emoji offered by the habit form's picker. */
export const HABIT_EMOJIS = [
  '🌱', '📚', '🏃', '💧', '🧘', '✍️', '🛌', '🥗', '🎧', '☀️', '🧹', '💊',
  '🎯', '🎨', '🎸', '🚶', '🧠', '💪', '📵', '🌙', '☕', '🪥', '💰', '🌸',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Order the tracker grid is drawn in: Monday first. */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const weekdayName = (weekday) => WEEKDAY_NAMES[weekday];

/** The default frequency a brand-new habit starts with. */
export const defaultFrequency = () => ({
  type: 'daily',
  days: [0, 1, 2, 3, 4, 5, 6],
  timesPerWeek: 7,
});

/** Human label for a frequency, e.g. "Everyday", "5 times a week", "Mo, We, Fr". */
export function frequencyLabel(frequency) {
  if (!frequency || frequency.type === 'daily') return 'Everyday';

  if (frequency.type === 'weekly') {
    const times = frequency.timesPerWeek ?? 1;
    return times === 1 ? 'Once a week' : `${times} times a week`;
  }

  const days = [...(frequency.days ?? [])].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b)
  );

  if (days.length === 7) return 'Everyday';
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';

  return days.map((d) => WEEKDAY_NAMES[d].slice(0, 2)).join(', ');
}

/** Whether a habit is meant to be done on a given weekday. */
export function isScheduledOn(habit, weekday) {
  if (habit?.frequency?.type === 'specific') {
    return habit.frequency.days.includes(weekday);
  }
  return true;
}

/** "5 days" / "1 week" — the unit comes from the habit's frequency type. */
export function streakLabel(streak) {
  if (!streak?.current) return 'No streak yet';
  const unit = streak.unit === 'week' ? 'week' : 'day';
  return `${streak.current} ${unit}${streak.current === 1 ? '' : 's'}`;
}
