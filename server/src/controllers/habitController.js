import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { computeStreak } from '../services/statsService.js';
import { todayKey } from '../utils/date.js';

/** Loads a habit and proves it belongs to the caller. */
async function findOwnedHabit(habitId, userId) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) throw ApiError.notFound('That habit could not be found');
  return habit;
}

/**
 * Normalises the frequency object so the stored shape always matches the type:
 * a `daily` habit keeps every weekday, a `weekly` one keeps its target.
 */
function normaliseFrequency(frequency) {
  if (!frequency) return undefined;

  if (frequency.type === 'daily') {
    return { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6], timesPerWeek: 7 };
  }
  if (frequency.type === 'weekly') {
    return {
      type: 'weekly',
      days: [0, 1, 2, 3, 4, 5, 6],
      timesPerWeek: frequency.timesPerWeek ?? 3,
    };
  }
  const days = [...new Set(frequency.days ?? [])].sort();
  return { type: 'specific', days, timesPerWeek: days.length || 1 };
}

/** GET /api/habits */
export const listHabits = asyncHandler(async (req, res) => {
  const { includeArchived } = req.valid?.query ?? {};

  const habits = await Habit.find({
    user: req.user._id,
    ...(includeArchived ? {} : { archived: false }),
  }).sort({ archived: 1, createdAt: 1 });

  res.json({ success: true, data: { habits } });
});

/** GET /api/habits/:id */
export const getHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  const logs = await HabitLog.find({ habit: habit._id }).select('date').sort({ date: 1 });

  res.json({
    success: true,
    data: {
      habit,
      streak: computeStreak(habit, logs, todayKey()),
      completions: logs.map((log) => log.date),
    },
  });
});

/** POST /api/habits */
export const createHabit = asyncHandler(async (req, res) => {
  const payload = req.valid.body;

  const habit = await Habit.create({
    ...payload,
    frequency: normaliseFrequency(payload.frequency),
    user: req.user._id,
  });

  res.status(201).json({ success: true, data: { habit } });
});

/** PATCH /api/habits/:id */
export const updateHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  const payload = req.valid.body;

  Object.assign(habit, payload);
  if (payload.frequency) habit.frequency = normaliseFrequency(payload.frequency);

  await habit.save();

  res.json({ success: true, data: { habit } });
});

/** DELETE /api/habits/:id — removes the habit and its history. */
export const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);

  await HabitLog.deleteMany({ habit: habit._id });
  await habit.deleteOne();

  res.json({ success: true, message: 'Habit deleted' });
});
