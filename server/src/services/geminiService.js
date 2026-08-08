import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 25_000;

/** How the coach should sound, driven by the user's `coachTone` preference. */
const TONE_GUIDES = {
  gentle:
    'Be warm, patient and reassuring. Never shame the user for a missed day — normalise it and ' +
    'offer the smallest possible next step.',
  balanced:
    'Be encouraging but practical. Celebrate wins briefly, then give one concrete suggestion.',
  direct:
    'Be concise and candid, like a no-nonsense coach. Lead with the honest observation, then the fix.',
};

const SYSTEM_PROMPT = `You are the AI Habit Coach inside a habit tracking app called Habit Tracker.

Your job is to help the user build and keep daily habits. You can see a snapshot of their real
habit data and should ground every reply in it — reference actual habit names, streaks and
completion rates rather than speaking in generalities.

Rules:
- Keep replies under 120 words unless the user explicitly asks for detail.
- Use plain, friendly language. Light markdown (bold, short lists) is fine; no headings.
- Give at most one actionable suggestion per reply, and make it small and specific.
- Never invent habits, numbers or history that are not in the snapshot.
- If the snapshot is empty, encourage the user to add their first habit and suggest one or two ideas.
- Stay on the topic of habits, routines, motivation and wellbeing. If asked about something else,
  briefly redirect to how it connects to their habits.
- Never give medical, clinical or crisis advice; suggest speaking to a professional instead.`;

function isConfigured() {
  return Boolean(env.geminiApiKey) && !String(env.geminiApiKey).startsWith('<');
}

/** Renders the user's habit snapshot as compact context the model can read. */
function buildContextBlock(user, context) {
  const lines = [
    `User: ${user.name}`,
    `Today: ${context.date}`,
    `Active habits: ${context.activeHabits}`,
    `Today's progress: ${context.todayProgress}`,
    `This week's completion rate: ${context.weekRate}`,
  ];

  if (context.habits.length) {
    lines.push('Habits:');
    for (const habit of context.habits) {
      lines.push(
        `- ${habit.name} (${habit.frequency}) — streak ${habit.streak}, ` +
          `this week ${habit.thisWeek}, done today: ${habit.doneToday}`
      );
    }
  } else {
    lines.push('The user has not created any habits yet.');
  }

  return lines.join('\n');
}

/**
 * Current Gemini models reason before answering, and those thinking tokens are
 * charged against `maxOutputTokens` — a coaching reply of ~150 tokens can easily
 * follow 700 tokens of reasoning. The budget is therefore set well above the
 * visible answer length, otherwise the response is truncated to nothing and
 * comes back with `finishReason: MAX_TOKENS`.
 *
 * Thinking cannot simply be switched off here: the v1beta endpoint rejects both
 * `thinkingConfig` and `thinkingLevel` on the 3.x models.
 */
function generationConfig(maxOutputTokens) {
  return { temperature: 0.8, topP: 0.95, maxOutputTokens };
}

async function callGemini({ contents, systemInstruction, maxOutputTokens = 2048 }) {
  if (!isConfigured()) {
    throw ApiError.serviceUnavailable(
      'The AI coach is not configured yet — add GEMINI_API_KEY to server/.env'
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_ROOT}/${env.geminiModel}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: generationConfig(maxOutputTokens),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw ApiError.serviceUnavailable('Your coach took too long to answer — please try again');
    }
    throw ApiError.serviceUnavailable('Could not reach the AI coach right now');
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = data?.error?.message || `Gemini responded with ${response.status}`;
    console.error('[gemini]', reason);

    if (response.status === 429) {
      throw ApiError.serviceUnavailable('The coach is busy right now — try again shortly');
    }
    if (response.status === 404) {
      // Almost always a GEMINI_MODEL that this API key cannot use.
      throw ApiError.serviceUnavailable(
        `The model "${env.geminiModel}" is not available to your API key — check GEMINI_MODEL in server/.env`
      );
    }
    throw ApiError.serviceUnavailable('The AI coach is unavailable right now');
  }

  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('')
    .trim();

  if (!text) {
    if (candidate?.finishReason === 'SAFETY') {
      throw ApiError.badRequest('Your coach could not answer that one. Try rephrasing it.');
    }
    if (candidate?.finishReason === 'MAX_TOKENS') {
      // The model spent the whole budget thinking. Raising maxOutputTokens fixes it.
      console.error('[gemini] hit MAX_TOKENS before producing any text', data?.usageMetadata);
      throw ApiError.serviceUnavailable('Your coach ran out of room to answer — please try again');
    }
    throw ApiError.serviceUnavailable('The coach returned an empty reply — please try again');
  }

  return text;
}

/**
 * Answers a chat message from the user, grounded in their habit snapshot and
 * the recent conversation.
 *
 * @param {object}   params.user     Mongoose user document.
 * @param {object}   params.context  Snapshot from `statsService.getCoachContext`.
 * @param {object[]} params.history  Prior turns as `{ role, content }`, oldest first.
 * @param {string}   params.message  The new user message.
 */
export async function generateCoachReply({ user, context, history, message }) {
  const systemInstruction = [
    SYSTEM_PROMPT,
    `Tone: ${TONE_GUIDES[user.coachTone] || TONE_GUIDES.balanced}`,
    '',
    "Here is the user's current habit snapshot:",
    buildContextBlock(user, context),
  ].join('\n');

  const contents = [
    ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.content }] })),
    { role: 'user', parts: [{ text: message }] },
  ];

  return callGemini({ contents, systemInstruction });
}

/** One short, personalised nudge for the dashboard. */
export async function generateDailyTip({ user, context }) {
  const systemInstruction = [
    SYSTEM_PROMPT,
    `Tone: ${TONE_GUIDES[user.coachTone] || TONE_GUIDES.balanced}`,
    '',
    'Write a single motivational nudge of at most 40 words for the dashboard. No greeting, no ' +
      'sign-off, no markdown, no questions back to the user. Reference one specific habit when ' +
      'the snapshot has one.',
    '',
    "Here is the user's current habit snapshot:",
    buildContextBlock(user, context),
  ].join('\n');

  const contents = [{ role: 'user', parts: [{ text: "Give me today's nudge." }] }];

  return callGemini({ contents, systemInstruction, maxOutputTokens: 1536 });
}

export const coachIsConfigured = isConfigured;
