import { Router } from 'express';
import * as oiCtrl from './order-item.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/by-order/:orderId',  authenticate, oiCtrl.getByOrderId);
router.post('/',                  authenticate, authorize('owner', 'admin', 'manager'), oiCtrl.create);
router.put('/:id',                authenticate, authorize('owner', 'admin', 'manager'), oiCtrl.update);
router.delete('/:id',             authenticate, authorize('owner', 'admin'), oiCtrl.remove);
router.patch('/reorder/:orderId', authenticate, authorize('owner', 'admin', 'manager'), oiCtrl.reorder);

export default router;
