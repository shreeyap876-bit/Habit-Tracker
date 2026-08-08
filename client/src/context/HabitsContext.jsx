import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { habitsApi, logsApi } from '../api/habits.js';
import { toErrorMessage } from '../api/client.js';
import { todayKey, weekKeys } from '../utils/date.js';

const HabitsContext = createContext(null);

/** Key used to index the completion set. */
const logKey = (habitId, date) => `${habitId}|${date}`;

/**
 * Owns the habit list and the completions for the week currently on screen.
 * Toggling a day updates local state first and rolls back if the API rejects
 * it, so the tracker grid always feels instant.
 */
export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState(() => new Set());
  const [anchorDate, setAnchorDate] = useState(todayKey);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState(null);

  /** Bumped after every mutation so dependent views (stats) can refetch. */
  const [revision, setRevision] = useState(0);
  const bumpRevision = useCallback(() => setRevision((value) => value + 1), []);

  const days = useMemo(() => weekKeys(anchorDate), [anchorDate]);

  /** Guards against a slow week request overwriting a newer one. */
  const requestRef = useRef(0);

  const loadHabits = useCallback(async () => {
    setLoadingHabits(true);
    try {
      const list = await habitsApi.list();
      setHabits(list);
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err, 'Could not load your habits'));
    } finally {
      setLoadingHabits(false);
    }
  }, []);

  const loadLogs = useCallback(async (range) => {
    const requestId = ++requestRef.current;
    setLoadingLogs(true);
    try {
      const logs = await logsApi.range(range[0], range[6]);
      if (requestId !== requestRef.current) return;
      setCompletions(new Set(logs.map((log) => logKey(log.habit, log.date))));
    } catch (err) {
      if (requestId === requestRef.current) {
        setError(toErrorMessage(err, 'Could not load this week'));
      }
    } finally {
      if (requestId === requestRef.current) setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    loadLogs(days);
  }, [days, loadLogs]);

  const isCompleted = useCallback(
    (habitId, date) => completions.has(logKey(habitId, date)),
    [completions]
  );

  const toggleDay = useCallback(
    async (habitId, date) => {
      const key = logKey(habitId, date);
      const wasCompleted = completions.has(key);

      // Optimistic flip.
      setCompletions((previous) => {
        const next = new Set(previous);
        if (wasCompleted) next.delete(key);
        else next.add(key);
        return next;
      });

      try {
        const result = await logsApi.toggle(habitId, date);

        // Reconcile with the server's answer in case the two disagree.
        setCompletions((previous) => {
          const next = new Set(previous);
          if (result.completed) next.add(key);
          else next.delete(key);
          return next;
        });
        bumpRevision();
      } catch (err) {
        setCompletions((previous) => {
          const next = new Set(previous);
          if (wasCompleted) next.add(key);
          else next.delete(key);
          return next;
        });
        toast.error(toErrorMessage(err, 'Could not save that'));
      }
    },
    [completions, bumpRevision]
  );

  const createHabit = useCallback(
    async (payload) => {
      const habit = await habitsApi.create(payload);
      setHabits((previous) => [...previous, habit]);
      bumpRevision();
      toast.success(`"${habit.name}" added`);
      return habit;
    },
    [bumpRevision]
  );

  const updateHabit = useCallback(
    async (id, payload) => {
      const habit = await habitsApi.update(id, payload);
      setHabits((previous) =>
        payload.archived
          ? previous.filter((item) => item.id !== id)
          : previous.map((item) => (item.id === id ? habit : item))
      );
      bumpRevision();
      return habit;
    },
    [bumpRevision]
  );

  const deleteHabit = useCallback(
    async (id) => {
      await habitsApi.remove(id);
      setHabits((previous) => previous.filter((item) => item.id !== id));
      setCompletions((previous) => {
        const next = new Set();
        for (const key of previous) {
          if (!key.startsWith(`${id}|`)) next.add(key);
        }
        return next;
      });
      bumpRevision();
      toast.success('Habit deleted');
    },
    [bumpRevision]
  );

  const value = useMemo(
    () => ({
      habits,
      days,
      anchorDate,
      setAnchorDate,
      loading: loadingHabits || loadingLogs,
      loadingHabits,
      error,
      revision,
      isCompleted,
      toggleDay,
      createHabit,
      updateHabit,
      deleteHabit,
      refresh: () => {
        loadHabits();
        loadLogs(days);
      },
    }),
    [
      habits,
      days,
      anchorDate,
      loadingHabits,
      loadingLogs,
      error,
      revision,
      isCompleted,
      toggleDay,
      createHabit,
      updateHabit,
      deleteHabit,
      loadHabits,
      loadLogs,
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabits must be used inside a <HabitsProvider>');
  return context;
}

export default HabitsContext;
