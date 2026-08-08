import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AUTH_COOKIE } from '../config/constants.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Reads the session JWT from the httpOnly cookie (falling back to an
 * `Authorization: Bearer` header) and attaches the matching user to the request.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token =
    req.cookies?.[AUTH_COOKIE] ||
    (header?.startsWith('Bearer ') ? header.slice(7) : null);

  if (!token) throw ApiError.unauthorized('Sign in to continue');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized('Your session has expired, please sign in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('This account no longer exists');

  req.user = user;
  next();
});

export default requireAuth;
