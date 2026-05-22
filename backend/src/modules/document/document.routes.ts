import { Router } from 'express';
import * as documentController from './document.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Публичные
router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);

// Под токеном
router.post('/', authenticate, authorize('owner', 'admin', 'manager'), documentController.create);
router.patch('/:id/data', authenticate, authorize('owner', 'admin', 'manager'), documentController.updateData);
router.post('/:id/finalize', authenticate, authorize('owner', 'admin', 'manager'), documentController.finalize);
router.delete('/:id', authenticate, authorize('owner', 'admin'), documentController.remove);

export default router;
