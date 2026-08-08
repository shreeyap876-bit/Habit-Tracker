import { z } from 'zod';
import { FREQUENCY_TYPES, HABIT_COLORS } from '../config/constants.js';
import { isValidDateKey } from '../utils/date.js';

const dateKey = z.string().refine(isValidDateKey, 'Dates must be formatted as YYYY-MM-DD');
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const boolish = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((value) => value === true || value === 'true' || value === '1');

const frequencySchema = z
  .object({
    type: z.enum(FREQUENCY_TYPES),
    days: z.array(z.number().int().min(0).max(6)).optional(),
    timesPerWeek: z.number().int().min(1).max(7).optional(),
  })
  .refine(
    (freq) => freq.type !== 'specific' || (freq.days?.length ?? 0) > 0,
    'Pick at least one day of the week'
  );

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const googleSignInSchema = z.object({
  credential: z.string().min(10, 'A Google credential is required'),
});

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address')
  .email('Enter a valid email address');

/** bcrypt only considers the first 72 bytes, so anything longer is misleading. */
const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Passwords are limited to 72 characters');

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your name').max(120),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((body) => body.password === body.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    coachTone: z.enum(['gentle', 'balanced', 'direct']).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update');

/* -------------------------------------------------------------------------- */
/* Habits                                                                     */
/* -------------------------------------------------------------------------- */

export const listHabitsSchema = z.object({
  includeArchived: boolish.optional(),
});

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, 'Give your habit a name').max(60),
  description: z.string().trim().max(200).optional(),
  emoji: z.string().trim().min(1).max(8).optional(),
  color: z.enum(HABIT_COLORS).optional(),
  frequency: frequencySchema.optional(),
});

export const updateHabitSchema = z
  .object({
    name: z.string().trim().min(1, 'Give your habit a name').max(60).optional(),
    description: z.string().trim().max(200).optional(),
    emoji: z.string().trim().min(1).max(8).optional(),
    color: z.enum(HABIT_COLORS).optional(),
    frequency: frequencySchema.optional(),
    archived: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update');

export const habitParamsSchema = z.object({ id: objectId });

/* -------------------------------------------------------------------------- */
/* Logs                                                                       */
/* -------------------------------------------------------------------------- */

export const listLogsSchema = z.object({
  start: dateKey,
  end: dateKey,
});

export const toggleLogSchema = z.object({
  habitId: objectId,
  date: dateKey,
});

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

export const overviewSchema = z.object({
  date: dateKey.optional(),
});

export const heatmapSchema = z.object({
  date: dateKey.optional(),
  days: z.coerce.number().int().min(7).max(365).default(112),
});

/* -------------------------------------------------------------------------- */
/* Coach                                                                      */
/* -------------------------------------------------------------------------- */

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Type a message first').max(1000),
  date: dateKey.optional(),
});

export const tipSchema = z.object({
  date: dateKey.optional(),
});
