import ChatMessage from '../models/ChatMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateCoachReply, generateDailyTip } from '../services/geminiService.js';
import { getCoachContext } from '../services/statsService.js';
import { todayKey } from '../utils/date.js';

/** Number of past turns handed to the model as conversation memory. */
const HISTORY_TURNS = 12;

/** GET /api/coach/history */
export const getHistory = asyncHandler(async (req, res) => {
  // `_id` breaks ties: a question and its answer are saved in the same
  // millisecond and must not flip order.
  const messages = await ChatMessage.find({ user: req.user._id })
    .sort({ createdAt: 1, _id: 1 })
    .limit(200);

  res.json({ success: true, data: { messages } });
});

/**
 * POST /api/coach/chat
 * Sends a message to the coach, grounded in the user's live habit stats, and
 * stores both sides of the exchange.
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, date } = req.valid.body;

  const [context, recent] = await Promise.all([
    getCoachContext(req.user._id, date || todayKey()),
    ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(HISTORY_TURNS),
  ]);

  const history = recent
    .reverse()
    .map((entry) => ({ role: entry.role, content: entry.content }));

  // Gemini rejects histories that do not start with a user turn.
  while (history.length && history[0].role !== 'user') history.shift();

  const reply = await generateCoachReply({
    user: req.user,
    context,
    history,
    message,
  });

  // Only persist once the model has actually answered, so a failed call does
  // not leave a dangling user message in the transcript.
  const [userMessage, coachMessage] = await ChatMessage.create([
    { user: req.user._id, role: 'user', content: message },
    { user: req.user._id, role: 'model', content: reply },
  ]);

  res.status(201).json({ success: true, data: { messages: [userMessage, coachMessage] } });
});

/** GET /api/coach/tip — a short personalised nudge for the dashboard. */
export const getTip = asyncHandler(async (req, res) => {
  const context = await getCoachContext(req.user._id, req.valid.query.date || todayKey());
  const tip = await generateDailyTip({ user: req.user, context });

  res.json({ success: true, data: { tip } });
});

/** DELETE /api/coach/history */
export const clearHistory = asyncHandler(async (req, res) => {
  await ChatMessage.deleteMany({ user: req.user._id });
  res.json({ success: true, message: 'Conversation cleared' });
});
