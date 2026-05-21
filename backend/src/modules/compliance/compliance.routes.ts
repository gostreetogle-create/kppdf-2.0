import { Router } from 'express';
import * as complianceController from './compliance.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.post('/check', authenticate, authorize('owner', 'admin', 'manager'), complianceController.checkCompliance);
router.post('/check-requirements', authenticate, authorize('owner', 'admin', 'manager'), complianceController.checkRequirements);
router.get('/check/:id', authenticate, complianceController.getCheckById);

export default router;
