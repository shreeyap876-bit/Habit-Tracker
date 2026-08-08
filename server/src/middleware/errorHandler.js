import mongoose from 'mongoose';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/** Catch-all for unmatched routes. */
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

/** Translates known error shapes into a consistent JSON envelope. */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = details[0]?.message || 'Validation failed';
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'That record already exists';
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}
