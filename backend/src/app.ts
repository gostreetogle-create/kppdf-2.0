import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './core/config';
import { connectDatabase } from './core/database';
import { errorHandler } from './shared/middleware/error-handler';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import counterpartyRoutes from './modules/counterparty/counterparty.routes';
import kpRoutes from './modules/kp/kp.routes';
import settingsRoutes from './modules/settings/settings.routes';
import entityStatusRoutes from './modules/entity-status/entity-status.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import roleRoutes from './modules/role/role.routes';
import orderRoutes from './modules/order/order.routes';
import orderItemRoutes from './modules/order-item/order-item.routes';
import workTypeRoutes from './modules/work-type/work-type.routes';
import workTaskRoutes from './modules/work-task/work-task.routes';
import materialRequestRoutes from './modules/material-request/material-request.routes';
import attachmentRoutes from './modules/attachment/attachment.routes';
import notificationRoutes from './modules/notification/notification.routes';
import specRoutes from './modules/spec/spec.routes';
import productionRoutes from './modules/production/production.routes';
import complianceRoutes from './modules/compliance/compliance.routes';

async function main(): Promise<void> {
  await connectDatabase();

  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json({ limit: '10mb' }));

  // Static files (загруженные изображения)
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

  // Routes
  app.use('/health', healthRoutes);
  app.use('/auth', authRoutes);
  app.use('/products', productRoutes);
  app.use('/counterparties', counterpartyRoutes);
  app.use('/kp', kpRoutes);
  app.use('/settings', settingsRoutes);
  app.use('/entity-statuses', entityStatusRoutes);
  app.use('/uploads', uploadsRoutes);
  app.use('/roles', roleRoutes);
  app.use('/orders', orderRoutes);
  app.use('/order-items', orderItemRoutes);
  app.use('/work-types', workTypeRoutes);
  app.use('/work-tasks', workTaskRoutes);
  app.use('/material-requests', materialRequestRoutes);
  app.use('/attachments', attachmentRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/spec', specRoutes);
  app.use('/production', productionRoutes);
  app.use('/compliance', complianceRoutes);

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
