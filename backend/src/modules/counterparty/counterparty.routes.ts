import { Router } from 'express';
import * as counterpartyController from './counterparty.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// GET — публичные
router.get('/our-companies', counterpartyController.getOurCompanies);
router.get('/default-initiator', counterpartyController.getDefaultInitiator);
router.get('/', counterpartyController.getAll);
router.get('/:id', counterpartyController.getById);

// POST/PUT/DELETE — под токеном
router.post('/', authenticate, authorize('owner', 'admin', 'manager'), counterpartyController.create);
router.put('/:id', authenticate, authorize('owner', 'admin', 'manager'), counterpartyController.update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), counterpartyController.remove);

export default router;
