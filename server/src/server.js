import app from './app.js';
import env, { validateEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

async function start() {
  try {
    validateEnv();
    await connectDatabase();
  } catch (err) {
    console.error('[startup]', err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] Habit Tracker API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Do not let a hung connection block the exit indefinitely.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
  });
}

start();
