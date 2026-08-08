import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AUTH_COOKIE } from '../config/constants.js';
import ApiError from '../utils/ApiError.js';

const client = new OAuth2Client(env.googleClientId);

/**
 * Verifies a Google ID token (the `credential` returned by Google Sign-In on
 * the client) and returns the trusted profile claims.
 */
export async function verifyGoogleCredential(credential) {
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
  } catch {
    throw ApiError.unauthorized('Google sign-in could not be verified');
  }

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw ApiError.unauthorized('Google did not return a usable profile');
  }
  if (payload.email_verified === false) {
    throw ApiError.unauthorized('Please verify your Google email address first');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || '',
  };
}

export function signSessionToken(user) {
  return jwt.sign({ sub: user.id ?? user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * In development the Vite proxy makes the API same-origin, so `lax` is both
 * safe and simple. In production the client is usually on a different domain
 * from the API, which requires `none` — and `none` is only honoured over HTTPS.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax',
  secure: env.isProduction,
  path: '/',
};

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, COOKIE_OPTIONS);
}
