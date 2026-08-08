import { Check } from 'lucide-react';
import { isFuture, isToday, shortWeekday } from '../../utils/date.js';

/**
 * One day in a habit's weekly row: the weekday label with a check circle under
 * it, matching the tracker in the inspiration board.
 *
 * @param {object} props
 * @param {string} props.date        `YYYY-MM-DD`.
 * @param {boolean} props.completed
 * @param {boolean} props.scheduled  Whether the habit is due on this weekday.
 * @param {string} props.habitName   Used to build the accessible label.
 */
export default function DayCell({ date, completed, scheduled, habitName, onToggle }) {
  const future = isFuture(date);
  const today = isToday(date);
  const disabled = future;

  const classes = [
    'day-cell',
    today && 'day-cell--today',
    future && 'day-cell--future',
    !scheduled && 'day-cell--off',
  ]
    .filter(Boolean)
    .join(' ');

  const buttonClasses = [
    'day-cell__button',
    completed && 'day-cell__button--done',
    today && 'day-cell__button--today',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <span className="day-cell__label">{shortWeekday(date)}</span>
      <button
        type="button"
        className={buttonClasses}
        disabled={disabled}
        aria-pressed={completed}
        aria-label={`${habitName} on ${date}${completed ? ', completed' : ''}`}
        title={future ? 'You cannot tick off a future day' : date}
        onClick={() => onToggle(date)}
      >
        <Check size={18} strokeWidth={3} />
      </button>
    </div>
  );
}
