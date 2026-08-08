import mongoose from 'mongoose';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import { addDays, eachDay, dayOfWeek, startOfWeek, toDateKey, weekRange } from '../utils/date.js';

/** Streaks are never computed further back than this, however old the habit is. */
const MAX_LOOKBACK_DAYS = 730;

/** Normalises log documents or bare date keys into a `Set` for O(1) lookups. */
function toDateSet(logs) {
  return new Set(logs.map((log) => (typeof log === 'string' ? log : log.date)));
}

/**
 * The earliest day worth scanning for a habit: normally its creation date, but
 * earlier if the user backfilled check-ins on previous weeks — those days count
 * towards the streak too. Never further back than the lookback cap.
 */
function habitStartKey(habit, done, today) {
  const created = toDateKey(new Date(habit.createdAt));
  const earliestLog = done.size ? [...done].reduce((min, d) => (d < min ? d : min)) : created;

  const start = earliestLog < created ? earliestLog : created;
  const floor = addDays(today, -MAX_LOOKBACK_DAYS);

  return start > floor ? start : floor;
}

/**
 * Day-based streak used by `daily` and `specific` habits: consecutive scheduled
 * days that were checked off. Today is never what breaks a streak — the day is
 * not over yet.
 */
function dayStreaks(habit, done, today) {
  const start = habitStartKey(habit, done, today);
  let current = 0;
  let longest = 0;
  let running = 0;

  // Walk backwards from today for the current streak.
  for (let cursor = today; cursor >= start; cursor = addDays(cursor, -1)) {
    if (!habit.isScheduledOn(dayOfWeek(cursor))) continue;
    if (done.has(cursor)) {
      current += 1;
    } else if (cursor !== today) {
      break;
    }
  }

  // Walk forwards from the habit's creation for the all-time best.
  for (const day of eachDay(start, today)) {
    if (!habit.isScheduledOn(dayOfWeek(day))) continue;
    if (done.has(day)) {
      running += 1;
      longest = Math.max(longest, running);
    } else if (day !== today) {
      running = 0;
    }
  }

  return { current, longest: Math.max(longest, current), unit: 'day' };
}

/**
 * Week-based streak used by `weekly` habits ("5 times a week"): consecutive
 * weeks that hit the target. The current week counts only once it is met, but
 * failing it so far does not break the run.
 */
function weekStreaks(habit, done, today) {
  const target = habit.frequency.timesPerWeek || 1;
  const start = startOfWeek(habitStartKey(habit, done, today));
  const thisWeek = startOfWeek(today);

  const weeks = [];
  for (let monday = start; monday <= thisWeek; monday = addDays(monday, 7)) {
    const hits = weekRange(monday).filter((day) => done.has(day)).length;
    weeks.push({ monday, met: hits >= target });
  }

  let current = 0;
  for (let i = weeks.length - 1; i >= 0; i -= 1) {
    if (weeks[i].met) current += 1;
    else if (weeks[i].monday !== thisWeek) break;
  }

  let longest = 0;
  let running = 0;
  for (const week of weeks) {
    if (week.met) {
      running += 1;
      longest = Math.max(longest, running);
    } else if (week.monday !== thisWeek) {
      running = 0;
    }
  }

  return { current, longest: Math.max(longest, current), unit: 'week' };
}

export function computeStreak(habit, logs, today) {
  const done = logs instanceof Set ? logs : toDateSet(logs);
  return habit.frequency.type === 'weekly'
    ? weekStreaks(habit, done, today)
    : dayStreaks(habit, done, today);
}

/** How many completions a habit should have by `today` within its current week. */
function weekTargetSoFar(habit, today) {
  const days = weekRange(today).filter((day) => day <= today);
  if (habit.frequency.type === 'weekly') {
    return Math.min(habit.frequency.timesPerWeek, days.length);
  }
  return days.filter((day) => habit.isScheduledOn(dayOfWeek(day))).length;
}

/**
 * Everything the dashboard needs in one round trip: today's progress, this
 * week's completion rate, the last fortnight of activity, and per-habit streaks.
 */
export async function getOverview(userId, today) {
  const habits = await Habit.find({ user: userId, archived: false }).sort({ createdAt: 1 });

  if (!habits.length) {
    return {
      today: { date: today, completed: 0, scheduled: 0, rate: 0 },
      week: { start: startOfWeek(today), completed: 0, target: 0, rate: 0 },
      activeHabits: 0,
      bestStreak: { current: 0, longest: 0, unit: 'day', habit: null },
      totalCompletions: 0,
      trend: eachDay(addDays(today, -13), today).map((date) => ({ date, completed: 0, scheduled: 0 })),
      habits: [],
    };
  }

  const habitIds = habits.map((h) => h._id);
  const historyStart = addDays(today, -MAX_LOOKBACK_DAYS);
  const logs = await HabitLog.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $gte: historyStart, $lte: today },
  }).select('habit date');

  // Group completions per habit for streak maths.
  const byHabit = new Map(habitIds.map((id) => [id.toString(), new Set()]));
  for (const log of logs) {
    byHabit.get(log.habit.toString())?.add(log.date);
  }

  const perHabit = habits.map((habit) => {
    const done = byHabit.get(habit._id.toString()) ?? new Set();
    const streak = computeStreak(habit, done, today);
    const target = weekTargetSoFar(habit, today);
    const completedThisWeek = weekRange(today).filter((d) => d <= today && done.has(d)).length;

    return {
      id: habit._id.toString(),
      name: habit.name,
      emoji: habit.emoji,
      color: habit.color,
      frequency: habit.frequency,
      streak,
      completions: done.size,
      week: {
        completed: completedThisWeek,
        target,
        rate: target ? Math.round((completedThisWeek / target) * 100) : 0,
      },
      doneToday: done.has(today),
      scheduledToday: habit.isScheduledOn(dayOfWeek(today)),
    };
  });

  const scheduledToday = perHabit.filter((h) => h.scheduledToday);
  const completedToday = scheduledToday.filter((h) => h.doneToday).length;

  const weekCompleted = perHabit.reduce((sum, h) => sum + h.week.completed, 0);
  const weekTarget = perHabit.reduce((sum, h) => sum + h.week.target, 0);

  // Fourteen-day activity trend for the dashboard chart.
  const trendDays = eachDay(addDays(today, -13), today);
  const dayIndex = new Map(trendDays.map((date) => [date, { date, completed: 0, scheduled: 0 }]));
  for (const habit of habits) {
    for (const date of trendDays) {
      const entry = dayIndex.get(date);
      if (habit.isScheduledOn(dayOfWeek(date))) entry.scheduled += 1;
    }
  }
  for (const log of logs) {
    const entry = dayIndex.get(log.date);
    if (entry) entry.completed += 1;
  }

  const best = perHabit.reduce(
    (top, h) => (h.streak.current > top.streak.current ? h : top),
    perHabit[0]
  );

  return {
    today: {
      date: today,
      completed: completedToday,
      scheduled: scheduledToday.length,
      rate: scheduledToday.length ? Math.round((completedToday / scheduledToday.length) * 100) : 0,
    },
    week: {
      start: startOfWeek(today),
      completed: weekCompleted,
      target: weekTarget,
      rate: weekTarget ? Math.round((weekCompleted / weekTarget) * 100) : 0,
    },
    activeHabits: habits.length,
    bestStreak: { ...best.streak, habit: { name: best.name, emoji: best.emoji } },
    totalCompletions: logs.length,
    trend: trendDays.map((date) => dayIndex.get(date)),
    habits: perHabit,
  };
}

/**
 * Per-day completion counts over a window, for the calendar heatmap on the
 * Insights page.
 */
export async function getHeatmap(userId, startKey, endKey) {
  const rows = await HabitLog.aggregate([
    {
      // `$match` does not cast, so the id has to be an ObjectId already.
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startKey, $lte: endKey },
      },
    },
    { $group: { _id: '$date', count: { $sum: 1 } } },
  ]);

  const counts = new Map(rows.map((row) => [row._id, row.count]));
  return eachDay(startKey, endKey).map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

/** Compact snapshot handed to the AI coach as grounding context. */
export async function getCoachContext(userId, today) {
  const overview = await getOverview(userId, today);

  return {
    date: today,
    activeHabits: overview.activeHabits,
    todayProgress: `${overview.today.completed}/${overview.today.scheduled} completed`,
    weekRate: `${overview.week.rate}%`,
    habits: overview.habits.map((h) => ({
      name: h.name,
      frequency:
        h.frequency.type === 'weekly'
          ? `${h.frequency.timesPerWeek}x per week`
          : h.frequency.type === 'specific'
            ? 'set weekdays'
            : 'daily',
      streak: `${h.streak.current} ${h.streak.unit}${h.streak.current === 1 ? '' : 's'}`,
      thisWeek: `${h.week.completed}/${h.week.target}`,
      doneToday: h.scheduledToday ? h.doneToday : 'not scheduled today',
    })),
  };
}
