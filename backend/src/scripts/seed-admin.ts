import '../core/config';
import mongoose from 'mongoose';
import { config } from '../core/config';
import { UserModel } from '../modules/auth/auth.model';
import bcrypt from 'bcryptjs';

async function seed(): Promise<void> {
  await mongoose.connect(config.mongo.uri);
  console.log('[Seed] Connected to MongoDB');

  const existing = await UserModel.findOne({ username: 'admin' });
  if (existing) {
    console.log('[Seed] Admin user already exists, skipping');
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 12);

  await UserModel.create({
    username: 'admin',
    email: 'admin@kppdf.local',
    displayName: 'Главный администратор',
    passwordHash,
    role: 'owner',
    isActive: true,
  });

  console.log('[Seed] Admin user created: admin / admin123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
