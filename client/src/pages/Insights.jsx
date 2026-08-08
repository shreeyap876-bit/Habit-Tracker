import { useMemo } from 'react';
import { Activity, CalendarDays, Flame, Target } from 'lucide-react';
import { useHabits } from '../context/HabitsContext.jsx';
import useApi from '../hooks/useApi.js';
import { statsApi } from '../api/habits.js';
import { fromDateKey, todayKey, weekdayOf } from '../utils/date.js';
import { streakLabel } from '../utils/habitTheme.js';
import { format } from 'date-fns';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { LoadingScreen } from '../components/ui/Spinner.jsx';
import StatTile from '../components/dashboard/StatTile.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';

const HEATMAP_DAYS = 112; // sixteen weeks
const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

/** Splits the heatmap cells into Monday-first columns. */
function toWeeks(cells) {
  if (!cells?.length) return [];

  const weeks = [];
  let current = new Array(7).fill(null);

  for (const cell of cells) {
    // Row index with Monday at the top.
    const weekday = weekdayOf(cell.date);
    const row = weekday === 0 ? 6 : weekday - 1;

    current[row] = cell;

    if (row === 6) {
      weeks.push(current);
      current = new Array(7).fill(null);
    }
  }

  if (current.some(Boolean)) weeks.push(current);
  return weeks;
}

/** Buckets a day's completion count into one of four shades. */
function levelFor(count, peak) {
  if (!count) return 0;
  const ratio = count / Math.max(peak, 1);
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export default function Insights() {
  const { habits, revision } = useHabits();
  const today = todayKey();

  const { data: stats, loading } = useApi(() => statsApi.overview(today), [today, revision]);
  const { data: heatmap } = useApi(() => statsApi.heatmap(today, HEATMAP_DAYS), [today, revision]);

  const weeks = useMemo(() => toWeeks(heatmap?.cells), [heatmap]);
  const peak = useMemo(
    () => Math.max(1, ...(heatmap?.cells ?? []).map((cell) => cell.count)),
    [heatmap]
  );

  if (loading && !stats) return <LoadingScreen message="Crunching your numbers…" />;

  if (!habits.length) {
    return (
      <Card>
        <EmptyState
          icon={Target}
          title="No data yet"
          message="Once you start tracking habits, your streaks and completion patterns will appear here."
        />
      </Card>
    );
  }

  const sortedHabits = [...(stats?.habits ?? [])].sort(
    (a, b) => b.streak.current - a.streak.current
  );

  // The unit belongs to whichever habit holds the record, since weekly habits
  // count their streak in weeks rather than days.
  const record = sortedHabits.reduce(
    (best, habit) => (habit.streak.longest > best.longest ? habit.streak : best),
    { longest: 0, unit: 'day' }
  );

  return (
    <div className="insights">
      <header className="page__head">
        <div>
          <h1 className="page__title">Insights</h1>
          <p className="page__subtitle">How your routines have actually gone, not how they felt.</p>
        </div>
      </header>

      <div className="stat-grid">
        <StatTile
          label="All-time check-ins"
          icon={Activity}
          color="sage"
          value={stats?.totalCompletions ?? 0}
          meta="Every day you have ticked off"
        />
        <StatTile
          label="Longest streak"
          icon={Flame}
          color="amber"
          value={record.longest}
          suffix={`${record.unit}${record.longest === 1 ? '' : 's'}`}
          meta="Your best run across all habits"
        />
        <StatTile
          label="This week"
          icon={CalendarDays}
          color="clay"
          value={`${stats?.week.rate ?? 0}%`}
          meta={`${stats?.week.completed ?? 0} of ${stats?.week.target ?? 0} check-ins`}
        />
        <StatTile
          label="Active habits"
          icon={Target}
          color="lavender"
          value={stats?.activeHabits ?? habits.length}
          meta="Currently being tracked"
        />
      </div>

      <Card title="Consistency" icon={CalendarDays} action={<span className="eyebrow">Last 16 weeks</span>}>
        {weeks.length ? (
          <>
            <div className="heatmap">
              <div className="heatmap__weekdays" aria-hidden="true">
                {WEEKDAY_LABELS.map((label, index) => (
                  // eslint-disable-next-line react/no-array-index-key -- fixed weekday rows
                  <span key={index} className="heatmap__weekday">
                    {label}
                  </span>
                ))}
              </div>

              <div className="heatmap__weeks">
                {weeks.map((week, weekIndex) => (
                  // eslint-disable-next-line react/no-array-index-key -- weeks are positional
                  <div key={weekIndex} className="heatmap__week">
                    {week.map((cell, dayIndex) =>
                      cell ? (
                        <span
                          key={cell.date}
                          className="heatmap__cell"
                          data-level={levelFor(cell.count, peak)}
                          title={`${format(fromDateKey(cell.date), 'd MMM yyyy')} — ${cell.count} completed`}
                        />
                      ) : (
                        // eslint-disable-next-line react/no-array-index-key -- padding cells
                        <span key={`pad-${weekIndex}-${dayIndex}`} className="heatmap__cell" style={{ opacity: 0 }} />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="heatmap__legend">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span key={level} className="heatmap__cell" data-level={level} />
              ))}
              <span>More</span>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        )}
      </Card>

      <div className="dashboard__columns">
        <Card title="Recent activity" icon={Activity} action={<span className="eyebrow">Last 14 days</span>}>
          {stats ? <TrendChart trend={stats.trend} /> : <p style={{ color: 'var(--muted)' }}>Loading…</p>}
        </Card>

        <Card title="Streaks" icon={Flame}>
          <div className="habit-stats">
            {sortedHabits.map((habit) => (
              <div key={habit.id} className="habit-stat" data-color={habit.color}>
                <p className="habit-stat__name">
                  <span aria-hidden="true">{habit.emoji}</span>
                  {habit.name}
                </p>
                <p className="habit-stat__figures">
                  <span>{streakLabel(habit.streak)}</span>
                  <span>best {habit.streak.longest}</span>
                </p>
                <div className="habit-stat__bar">
                  <ProgressBar
                    value={habit.streak.current}
                    max={Math.max(habit.streak.longest, 1)}
                    color={habit.color}
                    label={`${habit.name} streak`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
