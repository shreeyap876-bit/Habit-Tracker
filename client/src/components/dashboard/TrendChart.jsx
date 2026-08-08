import { fromDateKey, isToday } from '../../utils/date.js';
import { format } from 'date-fns';

/**
 * Fourteen-day completion chart. Bars are drawn with plain CSS heights rather
 * than a charting library — it is one series of small integers.
 */
export default function TrendChart({ trend = [] }) {
  const peak = Math.max(1, ...trend.map((day) => day.completed));

  return (
    <div className="trend" role="img" aria-label="Habit completions over the last 14 days">
      {trend.map((day) => {
        const height = Math.round((day.completed / peak) * 100);
        const today = isToday(day.date);

        return (
          <div key={day.date} className={`trend__col ${today ? 'trend__col--today' : ''}`.trim()}>
            <div
              className="trend__track"
              title={`${format(fromDateKey(day.date), 'd MMM')} — ${day.completed} of ${day.scheduled} done`}
            >
              <div
                className={`trend__bar ${day.completed === 0 ? 'trend__bar--empty' : ''}`.trim()}
                style={{ height: `${day.completed === 0 ? 3 : Math.max(height, 8)}%` }}
              />
            </div>
            <span className="trend__label">{format(fromDateKey(day.date), 'd')}</span>
          </div>
        );
      })}
    </div>
  );
}
