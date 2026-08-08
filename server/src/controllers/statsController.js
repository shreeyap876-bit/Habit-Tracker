import asyncHandler from '../utils/asyncHandler.js';
import { getHeatmap, getOverview } from '../services/statsService.js';
import { addDays, todayKey } from '../utils/date.js';

/**
 * GET /api/stats/overview?date=YYYY-MM-DD
 * The client passes its own local date so streaks line up with the user's day,
 * not the server's.
 */
export const overview = asyncHandler(async (req, res) => {
  const today = req.valid.query.date || todayKey();
  const data = await getOverview(req.user._id, today);

  res.json({ success: true, data });
});

/** GET /api/stats/heatmap?date=YYYY-MM-DD&days=90 */
export const heatmap = asyncHandler(async (req, res) => {
  const { date, days } = req.valid.query;
  const end = date || todayKey();
  const start = addDays(end, -(days - 1));

  const cells = await getHeatmap(req.user._id, start, end);

  res.json({ success: true, data: { start, end, cells } });
});
