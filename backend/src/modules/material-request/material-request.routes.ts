import { Router } from 'express';
import * as mrCtrl from './material-request.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();
router.get('/by-order/:orderId',         authenticate, mrCtrl.getByOrder);
router.get('/by-order-item/:orderItemId', authenticate, mrCtrl.getByOrderItem);
router.post('/',                          authenticate, authorize('owner', 'admin', 'manager'), mrCtrl.create);
router.put('/:id',                        authenticate, authorize('owner', 'admin', 'manager'), mrCtrl.update);
router.patch('/:id/approve',             authenticate, authorize('owner', 'admin'), mrCtrl.approve);
router.delete('/:id',                     authenticate, authorize('owner', 'admin'), mrCtrl.remove);
export default router;
