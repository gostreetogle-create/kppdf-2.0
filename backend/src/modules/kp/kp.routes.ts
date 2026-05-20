import { Router } from 'express';
import * as kpController from './kp.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', kpController.getAll);
router.get('/:id', kpController.getById);
router.get('/:id/calculate', kpController.recalculate);
router.post('/', authorize('owner', 'admin', 'manager'), kpController.create);
router.put('/:id', authorize('owner', 'admin', 'manager'), kpController.update);
router.patch('/:id/status', authorize('owner', 'admin', 'manager'), kpController.changeStatus);
router.delete('/:id', authorize('owner', 'admin'), kpController.remove);

export default router;
