import { Router } from 'express';
import * as entityStatusController from './entity-status.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Доступно всем авторизованным — только чтение
router.get('/:entityType', authenticate, entityStatusController.getByEntityType);
router.get('/:entityType/initial', authenticate, entityStatusController.getInitial);

// Изменение статусов — только admin/director
router.post('/', authenticate, authorize('owner', 'admin'), entityStatusController.create);
router.put(
  '/:entityType/:statusId',
  authenticate,
  authorize('owner', 'admin'),
  entityStatusController.update,
);
router.delete(
  '/:entityType/:statusId',
  authenticate,
  authorize('owner', 'admin'),
  entityStatusController.remove,
);

export default router;
