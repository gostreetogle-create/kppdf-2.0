import { Router } from 'express';
import * as roleCtrl from './role.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/',    authenticate, roleCtrl.getAll);
router.get('/:name', authenticate, roleCtrl.getByName);
router.post('/',   authenticate, authorize('owner', 'admin'), roleCtrl.create);
router.put('/:name', authenticate, authorize('owner', 'admin'), roleCtrl.update);
router.delete('/:name', authenticate, authorize('owner', 'admin'), roleCtrl.remove);

export default router;
