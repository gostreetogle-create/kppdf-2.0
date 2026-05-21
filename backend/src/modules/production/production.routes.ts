import { Router } from 'express';
import * as productionController from './production.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/plan/:orderId', authenticate, productionController.getPlanByOrder);
router.post('/calculate', authenticate, authorize('owner', 'admin', 'manager'), productionController.calculatePlan);
router.post('/plan/:orderId/approve', authenticate, authorize('owner', 'admin'), productionController.approvePlan);

export default router;
