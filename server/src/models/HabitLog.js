import mongoose from 'mongoose';
import { isValidDateKey } from '../utils/date.js';

/**
 * One document per completed habit-day. The absence of a document means the
 * habit was not done, so checking a day off is a create and unchecking is a
 * delete — no tri-state to reconcile.
 */
const habitLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    /** Calendar day in the user's own timezone, as `YYYY-MM-DD`. */
    date: {
      type: String,
      required: true,
      validate: {
        validator: isValidDateKey,
        message: 'Date must be a calendar date formatted as YYYY-MM-DD',
      },
    },
    completedAt: {
      type: Date,
      default: Date.now,
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

// A habit can only be completed once per day.
habitLogSchema.index({ habit: 1, date: 1 }, { unique: true });
habitLogSchema.index({ user: 1, date: 1 });

export default mongoose.model('HabitLog', habitLogSchema);
