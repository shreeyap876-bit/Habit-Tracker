import mongoose from 'mongoose';
import { FREQUENCY_TYPES, HABIT_COLORS } from '../config/constants.js';

const frequencySchema = new mongoose.Schema(
  {
    /**
     * `daily`    — every day of the week.
     * `specific` — only the weekdays listed in `days`.
     * `weekly`   — any `timesPerWeek` days of the week.
     */
    type: {
      type: String,
      enum: FREQUENCY_TYPES,
      default: 'daily',
    },
    /** Weekday numbers, `0` (Sunday) through `6` (Saturday). Used by `specific`. */
    days: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (days) => days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: 'Weekdays must be integers between 0 (Sunday) and 6 (Saturday)',
      },
    },
    /** Target completions per week. Used by `weekly`. */
    timesPerWeek: {
      type: Number,
      min: 1,
      max: 7,
      default: 7,
    },
  },
  { _id: false }
);

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'A habit needs a name'],
      trim: true,
      maxlength: [60, 'Habit names are limited to 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Descriptions are limited to 200 characters'],
      default: '',
    },
    emoji: {
      type: String,
      default: '🌱',
      maxlength: 8,
    },
    color: {
      type: String,
      enum: HABIT_COLORS,
      default: 'sage',
    },
    frequency: {
      type: frequencySchema,
      default: () => ({}),
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

habitSchema.index({ user: 1, archived: 1, createdAt: 1 });

/** Whether this habit is meant to be done on the given weekday (`0`–`6`). */
habitSchema.methods.isScheduledOn = function isScheduledOn(weekday) {
  if (this.frequency.type === 'specific') return this.frequency.days.includes(weekday);
  return true; // `daily` and `weekly` habits can be checked off any day
};

/** How many completions a full week of this habit is worth. */
habitSchema.methods.weeklyTarget = function weeklyTarget() {
  if (this.frequency.type === 'specific') return this.frequency.days.length;
  if (this.frequency.type === 'weekly') return this.frequency.timesPerWeek;
  return 7;
};

export default mongoose.model('Habit', habitSchema);
