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

// Behind a proxy (Render, Railway, Nginx) so secure cookies and rate limiting
// see the real client IP.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
