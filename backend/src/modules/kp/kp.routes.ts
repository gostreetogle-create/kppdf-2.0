import { Router } from 'express';
import * as kpController from './kp.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// GET — публичные
router.get('/', kpController.getAll);
router.get('/:id', kpController.getById);
router.get('/:id/calculate', kpController.recalculate);

// POST/PUT/PATCH/DELETE — под токеном
router.post('/', authenticate, authorize('owner', 'admin', 'manager'), kpController.create);
router.put('/:id', authenticate, authorize('owner', 'admin', 'manager'), kpController.update);
router.patch('/:id/status', authenticate, authorize('owner', 'admin', 'manager'), kpController.changeStatus);
router.delete('/:id', authenticate, authorize('owner', 'admin'), kpController.remove);

export default router;
