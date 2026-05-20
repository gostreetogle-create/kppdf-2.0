import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './core/config';
import { connectDatabase } from './core/database';
import { errorHandler } from './shared/middleware/error-handler';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import counterpartyRoutes from './modules/counterparty/counterparty.routes';
import kpRoutes from './modules/kp/kp.routes';
import settingsRoutes from './modules/settings/settings.routes';

async function main(): Promise<void> {
  await connectDatabase();

  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json({ limit: '10mb' }));

  // Routes
  app.use('/health', healthRoutes);
  app.use('/auth', authRoutes);
  app.use('/products', productRoutes);
  app.use('/counterparties', counterpartyRoutes);
  app.use('/kp', kpRoutes);
  app.use('/settings', settingsRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log(`[Server] Health: http://localhost:${config.port}/health`);
  });
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
