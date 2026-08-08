import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/** Work factor for password hashing. Higher is slower to brute force. */
const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    /**
     * Present only for accounts that have signed in with Google. `sparse` lets
     * many password-only accounts coexist without tripping the unique index.
     */
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    /**
     * bcrypt hash, never the plaintext. Excluded from queries by default, so it
     * has to be asked for explicitly with `.select('+password')`.
     */
    password: {
      type: String,
      select: false,
      default: undefined,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    avatar: {
      type: String,
      default: '',
    },
    /** Tone the AI coach should use when replying. */
    coachTone: {
      type: String,
      enum: ['gentle', 'balanced', 'direct'],
      default: 'balanced',
    },
    lastLoginAt: {
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
        delete ret.googleId;
        delete ret.password;
        return ret;
      },
    },
  }
);

/** Which sign-in methods this account can use, for the UI to explain itself. */
userSchema.virtual('authProviders').get(function authProviders() {
  const providers = [];
  if (this.googleId) providers.push('google');
  if (this.password) providers.push('password');
  return providers;
});

// Hash on the way in, so no caller can accidentally store plaintext.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  return next();
});

/**
 * Constant-time comparison against the stored hash. Returns false when the
 * account has no password (a Google-only user).
 */
userSchema.methods.verifyPassword = async function verifyPassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
