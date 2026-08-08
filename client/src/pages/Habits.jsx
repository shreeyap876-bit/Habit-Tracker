import { useMemo, useState } from 'react';
import { Archive, CalendarRange, ChevronLeft, ChevronRight, Plus, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHabits } from '../context/HabitsContext.jsx';
import useApi from '../hooks/useApi.js';
import { habitsApi, statsApi } from '../api/habits.js';
import { toErrorMessage } from '../api/client.js';
import { shiftWeeks, todayKey, weekLabel, weekStartKey } from '../utils/date.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import IconButton from '../components/ui/IconButton.jsx';
import { LoadingScreen } from '../components/ui/Spinner.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import HabitRow from '../components/habits/HabitRow.jsx';

export default function Habits() {
  const {
    habits,
    days,
    anchorDate,
    setAnchorDate,
    loadingHabits,
    error,
    revision,
    isCompleted,
    toggleDay,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Streaks come from the stats endpoint so the badge on each row stays honest.
  const { data: stats } = useApi(() => statsApi.overview(todayKey()), [revision]);

  const streaks = useMemo(() => {
    const map = new Map();
    for (const habit of stats?.habits ?? []) map.set(habit.id, habit.streak);
    return map;
  }, [stats]);

  const { data: archived, loading: archivedLoading, reload: reloadArchived } = useApi(
    () => habitsApi.list({ includeArchived: true }).then((all) => all.filter((h) => h.archived)),
    [revision, showArchived],
    { enabled: showArchived }
  );

  const isThisWeek = weekStartKey(anchorDate) === weekStartKey(todayKey());

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (habit) => {
    setEditing(habit);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateHabit(editing.id, payload);
      toast.success('Habit updated');
    } else {
      await createHabit(payload);
    }
  };

  const handleArchive = async (habit) => {
    try {
      await updateHabit(habit.id, { archived: !habit.archived });
      toast.success(habit.archived ? `"${habit.name}" restored` : `"${habit.name}" archived`);
      if (showArchived) reloadArchived();
    } catch (err) {
      toast.error(toErrorMessage(err, 'Could not update this habit'));
    }
  };

  if (loadingHabits && habits.length === 0) return <LoadingScreen message="Loading your habits…" />;

  return (
    <div className="stack">
      <header className="page__head">
        <div>
          <h1 className="page__title">Weekly Habits</h1>
          <p className="page__subtitle">Tick off each day as you go. Future days stay locked.</p>
        </div>

        <div className="page__actions">
          <div className="week-nav">
            <IconButton
              icon={ChevronLeft}
              label="Previous week"
              onClick={() => setAnchorDate(shiftWeeks(anchorDate, -1))}
            />
            <span className="week-nav__range tabular">{weekLabel(anchorDate)}</span>
            <IconButton
              icon={ChevronRight}
              label="Next week"
              onClick={() => setAnchorDate(shiftWeeks(anchorDate, 1))}
            />
          </div>

          {!isThisWeek && (
            <Button size="sm" icon={CalendarRange} onClick={() => setAnchorDate(todayKey())}>
              Today
            </Button>
          )}

          <Button variant="primary" icon={Plus} onClick={openCreate}>
            New habit
          </Button>
        </div>
      </header>

      {error && (
        <Card>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </Card>
      )}

      {habits.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sprout}
            title="No habits yet"
            message="Start with one small thing you can do most days — you can always add more later."
            action={
              <Button variant="primary" icon={Plus} onClick={openCreate}>
                Create a habit
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="habit-grid">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              days={days}
              streak={streaks.get(habit.id)}
              isCompleted={(date) => isCompleted(habit.id, date)}
              onToggle={(date) => toggleDay(habit.id, date)}
              onEdit={() => openEdit(habit)}
              onArchive={() => handleArchive(habit)}
              onDelete={() => setDeleting(habit)}
            />
          ))}
        </div>
      )}

      <Card
        title="Archived habits"
        icon={Archive}
        action={
          <Button size="sm" variant="ghost" onClick={() => setShowArchived((value) => !value)}>
            {showArchived ? 'Hide' : 'Show'}
          </Button>
        }
      >
        {!showArchived ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            Habits you archive are kept here with their history intact.
          </p>
        ) : archivedLoading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : archived?.length ? (
          <div className="habit-grid">
            {archived.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                days={days}
                isCompleted={(date) => isCompleted(habit.id, date)}
                onToggle={() => toast('Restore this habit to track it again')}
                onEdit={() => openEdit(habit)}
                onArchive={() => handleArchive(habit)}
                onDelete={() => setDeleting(habit)}
              />
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            Nothing archived yet.
          </p>
        )}
      </Card>

      <HabitFormModal
        open={formOpen}
        habit={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete "${deleting?.name ?? ''}"?`}
        message="This also removes every check-in recorded for it. Archiving keeps the history instead."
        confirmLabel="Delete habit"
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await deleteHabit(deleting.id);
            if (showArchived) reloadArchived();
          } catch (err) {
            toast.error(toErrorMessage(err, 'Could not delete this habit'));
          }
        }}
      />
    </div>
  );
}
