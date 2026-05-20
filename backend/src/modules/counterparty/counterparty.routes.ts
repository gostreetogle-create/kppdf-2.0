import { Router } from 'express';
import * as counterpartyController from './counterparty.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/our-companies', counterpartyController.getOurCompanies);
router.get('/default-initiator', counterpartyController.getDefaultInitiator);
router.get('/', counterpartyController.getAll);
router.get('/:id', counterpartyController.getById);
router.post('/', authorize('owner', 'admin', 'manager'), counterpartyController.create);
router.put('/:id', authorize('owner', 'admin', 'manager'), counterpartyController.update);
router.delete('/:id', authorize('owner', 'admin'), counterpartyController.remove);

export default router;
