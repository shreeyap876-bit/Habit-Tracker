
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import env from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Behind a proxy (Render, Railway, Nginx) so secure cookies
// and rate limiting see the real client IP.
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// CORS
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '100kb' }));

// Cookies
app.use(cookieParser());

// HTTP request logging
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// API routes
app.use('/api', apiLimiter, routes);

// API health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Habit Tracker API is running!',
  });
});

// Handle unknown routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;

