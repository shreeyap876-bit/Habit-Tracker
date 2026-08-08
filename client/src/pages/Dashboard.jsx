import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CalendarCheck, Flame, ListChecks, Plus, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabits } from '../context/HabitsContext.jsx';
import useApi from '../hooks/useApi.js';
import { statsApi } from '../api/habits.js';
import coachApi from '../api/coach.js';
import { todayKey, weekLabel } from '../utils/date.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { LoadingScreen } from '../components/ui/Spinner.jsx';
import FocusCard from '../components/dashboard/FocusCard.jsx';
import StatTile from '../components/dashboard/StatTile.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';
import TodayChecklist from '../components/dashboard/TodayChecklist.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { habits, isCompleted, toggleDay, loadingHabits, revision } = useHabits();
  const today = todayKey();

  // `revision` changes after every habit mutation, which refetches the stats.
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useApi(() => statsApi.overview(today), [today, revision]);

  const tipFetcher = useCallback(() => coachApi.tip(today), [today]);
  const { data: tip, loading: tipLoading, error: tipError, reload: reloadTip } = useApi(
    tipFetcher,
    [today]
  );

  if (loadingHabits && !stats) return <LoadingScreen message="Gathering your week…" />;

  const hasHabits = habits.length > 0;

  return (
    <div className="dashboard">
      <FocusCard
        name={user?.name}
        tip={tip}
        loading={tipLoading}
        error={tipError}
        onRefresh={reloadTip}
      />

      {!hasHabits ? (
        <Card>
          <EmptyState
            icon={Target}
            title="Let's plant the first one"
            message="Add a habit and your dashboard will fill up with streaks, progress and coaching."
            action={
              <Link to="/habits">
                <Button variant="primary" icon={Plus}>
                  Create your first habit
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="stat-grid">
            <StatTile
              label="Today"
              icon={CalendarCheck}
              color="sage"
              value={stats ? `${stats.today.completed}` : '—'}
              suffix={stats ? `/ ${stats.today.scheduled}` : ''}
              meta={stats ? `${stats.today.rate}% of today's habits done` : 'Loading…'}
            />
            <StatTile
              label="This week"
              icon={TrendingUp}
              color="clay"
              value={stats ? `${stats.week.rate}%` : '—'}
              meta={stats ? `${stats.week.completed} of ${stats.week.target} check-ins` : weekLabel(today)}
            />
            <StatTile
              label="Best streak"
              icon={Flame}
              color="amber"
              value={stats ? stats.bestStreak.current : '—'}
              suffix={stats ? `${stats.bestStreak.unit}${stats.bestStreak.current === 1 ? '' : 's'}` : ''}
              meta={
                stats?.bestStreak.habit
                  ? `${stats.bestStreak.habit.emoji} ${stats.bestStreak.habit.name}`
                  : 'Keep going to start one'
              }
            />
            <StatTile
              label="Active habits"
              icon={Activity}
              color="lavender"
              value={stats ? stats.activeHabits : habits.length}
              meta={stats ? `${stats.totalCompletions} completions all time` : ''}
            />
          </div>

          <div className="dashboard__columns">
            <div className="stack">
              <Card title="Activity" icon={TrendingUp} action={<span className="eyebrow">Last 14 days</span>}>
                {statsError ? (
                  <p style={{ color: 'var(--danger)' }}>{statsError}</p>
                ) : stats ? (
                  <TrendChart trend={stats.trend} />
                ) : (
                  <p style={{ color: 'var(--muted)' }}>Loading…</p>
                )}
              </Card>

              <Card
                title="Weekly goals"
                icon={Target}
                action={
                  <Link to="/habits" className="chip chip--interactive">
                    Open tracker
                  </Link>
                }
              >
                <div className="habit-stats">
                  {(stats?.habits ?? []).map((habit) => (
                    <div key={habit.id} className="habit-stat" data-color={habit.color}>
                      <p className="habit-stat__name">
                        <span aria-hidden="true">{habit.emoji}</span>
                        {habit.name}
                      </p>
                      <p className="habit-stat__figures">
                        <span>
                          {habit.week.completed}/{habit.week.target}
                        </span>
                        <span>{habit.week.rate}%</span>
                      </p>
                      <div className="habit-stat__bar">
                        <ProgressBar
                          value={habit.week.completed}
                          max={Math.max(habit.week.target, 1)}
                          color={habit.color}
                          label={`${habit.name} weekly progress`}
                        />
                      </div>
                    </div>
                  ))}
                  {!stats && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
                </div>
              </Card>
            </div>

            <div className="dashboard__aside">
              <Card
                title="Quick logs"
                icon={ListChecks}
                action={<span className="eyebrow">Today</span>}
                bodyClassName="stack"
              >
                <TodayChecklist habits={habits} isCompleted={isCompleted} onToggle={toggleDay} />
              </Card>

              <Card title="This week" icon={CalendarCheck}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  {weekLabel(today)}
                </p>
                <p
                  style={{
                    marginTop: 'var(--space-3)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-2xl)',
                  }}
                  className="tabular"
                >
                  {stats ? `${stats.week.completed}/${stats.week.target}` : '—'}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  check-ins completed so far
                </p>
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <ProgressBar
                    value={stats?.week.completed ?? 0}
                    max={Math.max(stats?.week.target ?? 1, 1)}
                    label="Weekly progress"
                  />
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
