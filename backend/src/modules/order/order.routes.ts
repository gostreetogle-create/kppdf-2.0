import { Router } from 'express';
import * as orderCtrl from './order.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/',           authenticate, orderCtrl.getAll);
router.get('/:id',        authenticate, orderCtrl.getById);
router.get('/:id/items',  authenticate, orderCtrl.getWithItems);
router.post('/',          authenticate, authorize('owner', 'admin', 'manager'), orderCtrl.create);
router.put('/:id',        authenticate, authorize('owner', 'admin', 'manager'), orderCtrl.update);
router.patch('/:id/recalc', authenticate, authorize('owner', 'admin', 'manager'), orderCtrl.recalcTotal);
router.delete('/:id',     authenticate, authorize('owner', 'admin'), orderCtrl.remove);

export default router;
