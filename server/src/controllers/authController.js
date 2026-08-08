import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  clearAuthCookie,
  setAuthCookie,
  signSessionToken,
  verifyGoogleCredential,
} from '../services/googleAuthService.js';

/** Signs the user in: issues the session cookie and returns the profile. */
function grantSession(res, user, status = 200) {
  setAuthCookie(res, signSessionToken(user));
  return res.status(status).json({ success: true, data: { user } });
}

/**
 * POST /api/auth/register
 * Creates an account from an email and password.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.valid.body;

  // `password` is `select: false`, so it must be requested — without it every
  // existing account would look like a Google-only one.
  const existing = await User.findOne({ email }).select('+password');

  if (existing) {
    // The email is already taken. If it came from Google, say so plainly rather
    // than leaving the user guessing why their password is "wrong".
    if (!existing.password) {
      throw ApiError.conflict(
        'This email is already registered with Google. Use "Continue with Google" instead.'
      );
    }
    throw ApiError.conflict('An account with this email already exists. Sign in instead.');
  }

  const user = await User.create({ name, email, password });

  return grantSession(res, user, 201);
});

/**
 * POST /api/auth/login
 * Exchanges an email and password for a session.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;

  // `password` is `select: false`, so it has to be requested explicitly.
  const user = await User.findOne({ email }).select('+password');

  // A Google-only account has no password to check against — worth saying, since
  // the account genuinely exists and the user is not mistyping anything.
  if (user && !user.password) {
    throw ApiError.unauthorized(
      'This account uses Google sign-in. Use "Continue with Google" instead.'
    );
  }

  // Otherwise stay vague, so the response cannot be used to discover which
  // email addresses have accounts.
  if (!user || !(await user.verifyPassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return grantSession(res, user);
});

/**
 * POST /api/auth/google
 * Exchanges a Google ID token for a session, creating the account on first
 * sign-in. When the email already has a password account, the two are linked —
 * Google has verified ownership of the address.
 */
export const googleSignIn = asyncHandler(async (req, res) => {
  const { credential } = req.valid.body;
  const profile = await verifyGoogleCredential(credential);

  let user = await User.findOne({ $or: [{ googleId: profile.googleId }, { email: profile.email }] });

  if (user) {
    user.googleId = profile.googleId;
    user.avatar = profile.avatar || user.avatar;
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    user = await User.create({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
    });
  }

  return grantSession(res, user);
});

/** GET /api/auth/me — the signed-in user, used to restore sessions on reload. */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

/** PATCH /api/auth/me — updates the handful of editable profile settings. */
export const updateMe = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.valid.body);
  await req.user.save();
  res.json({ success: true, data: { user: req.user } });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Signed out' });
});
