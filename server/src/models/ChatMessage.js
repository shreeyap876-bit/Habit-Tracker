import mongoose from 'mongoose';

/**
 * Conversation history with the AI habit coach. `model` is Gemini's own name
 * for the assistant role, kept as-is so history maps straight onto the API.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
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

chatMessageSchema.index({ user: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
