import { Router } from 'express';
import * as wtCtrl from './work-type.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();
router.get('/',     authenticate, wtCtrl.getAll);
router.post('/',    authenticate, authorize('owner', 'admin'), wtCtrl.create);
router.put('/:name', authenticate, authorize('owner', 'admin'), wtCtrl.update);
router.delete('/:name', authenticate, authorize('owner', 'admin'), wtCtrl.remove);
export default router;
