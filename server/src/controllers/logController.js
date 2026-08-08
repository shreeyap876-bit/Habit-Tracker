import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/logs?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Every completion in a date range, which is all the weekly grid needs.
 */
export const listLogs = asyncHandler(async (req, res) => {
  const { start, end } = req.valid.query;

  if (start > end) throw ApiError.badRequest('The start date must come before the end date');

  const logs = await HabitLog.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
  }).select('habit date completedAt');

  res.json({
    success: true,
    data: {
      range: { start, end },
      logs: logs.map((log) => ({
        id: log._id.toString(),
        habit: log.habit.toString(),
        date: log.date,
      })),
    },
  });
});

/**
 * POST /api/logs/toggle
 * Checks a habit off for a day, or unchecks it if it was already done.
 */
export const toggleLog = asyncHandler(async (req, res) => {
  const { habitId, date } = req.valid.body;

  const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
  if (!habit) throw ApiError.notFound('That habit could not be found');
  if (habit.archived) throw ApiError.badRequest('Restore this habit before tracking it again');

  const existing = await HabitLog.findOneAndDelete({ habit: habit._id, date });

  if (existing) {
    return res.json({ success: true, data: { habitId, date, completed: false } });
  }

  await HabitLog.create({ user: req.user._id, habit: habit._id, date });

  return res.status(201).json({ success: true, data: { habitId, date, completed: true } });
});
