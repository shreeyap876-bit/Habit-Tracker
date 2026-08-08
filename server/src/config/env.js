import dotenv from 'dotenv';

dotenv.config();

/**
 * Central place where every environment variable is read.
 * Nothing else in the codebase should touch `process.env` directly.
 */
const env = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGODB_URI,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
};

env.isProduction = env.nodeEnv === 'production';

/** Variables the server genuinely cannot boot without. */
const REQUIRED = ['mongoUri', 'jwtSecret', 'googleClientId'];

/** Variables that only disable a single feature when missing. */
const OPTIONAL = [{ key: 'geminiApiKey', feature: 'AI Habit Coach' }];

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !env[key] || String(env[key]).startsWith('<'));

  if (missing.length) {
    const names = {
      mongoUri: 'MONGODB_URI',
      jwtSecret: 'JWT_SECRET',
      googleClientId: 'GOOGLE_CLIENT_ID',
    };
    throw new Error(
      `Missing required environment variables: ${missing.map((k) => names[k]).join(', ')}. ` +
        'Copy server/.env.example to server/.env and fill in the values.'
    );
  }

  for (const { key, feature } of OPTIONAL) {
    if (!env[key] || String(env[key]).startsWith('<')) {
      console.warn(`[env] ${feature} is disabled — set the matching key in server/.env to enable it.`);
    }
  }
}

export default env;
