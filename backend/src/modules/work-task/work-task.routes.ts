import { Router } from 'express';
import * as wtCtrl from './work-task.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();
router.get('/by-order-item/:orderItemId', authenticate, wtCtrl.getByOrderItem);
router.post('/by-order', authenticate, wtCtrl.getByOrder);
router.post('/',  authenticate, authorize('owner', 'admin', 'manager'), wtCtrl.create);
router.put('/:id', authenticate, authorize('owner', 'admin', 'manager'), wtCtrl.update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), wtCtrl.remove);
export default router;
