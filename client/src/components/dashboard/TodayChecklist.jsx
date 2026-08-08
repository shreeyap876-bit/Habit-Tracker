import { Check, Circle, Sprout } from 'lucide-react';
import { frequencyLabel, isScheduledOn } from '../../utils/habitTheme.js';
import { todayKey, weekdayOf } from '../../utils/date.js';
import EmptyState from '../ui/EmptyState.jsx';

/** The "quick logs" list: everything due today, one tap to tick off. */
export default function TodayChecklist({ habits, isCompleted, onToggle, action }) {
  const today = todayKey();
  const weekday = weekdayOf(today);
  const due = habits.filter((habit) => isScheduledOn(habit, weekday));

  if (!due.length) {
    return (
      <EmptyState
        icon={Sprout}
        title="Nothing due today"
        message="Habits scheduled for today will show up here, ready to tick off."
        action={action}
      />
    );
  }

  return (
    <div className="checklist">
      {due.map((habit) => {
        const done = isCompleted(habit.id, today);

        return (
          <button
            key={habit.id}
            type="button"
            data-color={habit.color}
            className={`checklist__item ${done ? 'checklist__item--done' : ''}`.trim()}
            aria-pressed={done}
            onClick={() => onToggle(habit.id, today)}
          >
            <span className="checklist__emoji" aria-hidden="true">
              {habit.emoji}
            </span>

            <span>
              <span className="checklist__name">{habit.name}</span>
              <span className="checklist__meta" style={{ display: 'block' }}>
                {frequencyLabel(habit.frequency)}
              </span>
            </span>

            <span className="checklist__check">
              {done ? (
                <Check size={20} strokeWidth={2.6} color="var(--habit)" />
              ) : (
                <Circle size={20} strokeWidth={1.8} color="var(--muted-soft)" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
