import mongoose from 'mongoose';
import { config } from './config';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log(`[DB] Connected to MongoDB: ${config.mongo.uri}`);
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Runtime error:', err);
  });
}
