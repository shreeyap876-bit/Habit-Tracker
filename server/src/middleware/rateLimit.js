import rateLimit from 'express-rate-limit';

const options = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down' },
};

/** Baseline protection for the whole API. */
export const apiLimiter = rateLimit({
  ...options,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});

/** Sign-in attempts are cheap to spam and expensive to verify. */
export const authLimiter = rateLimit({
  ...options,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

/** Every coach message costs a Gemini call, so it gets a tighter budget. */
export const coachLimiter = rateLimit({
  ...options,
  windowMs: 60 * 1000,
  limit: 15,
  message: { success: false, message: 'Give your coach a moment — try again in a minute' },
});
