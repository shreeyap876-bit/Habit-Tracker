import mongoose from 'mongoose';
import env from './env.js';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  mongoose.connection.on('connected', () => console.log('[db] MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('[db] MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
