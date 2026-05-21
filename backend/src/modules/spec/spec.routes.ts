import { Router } from 'express';
import * as specController from './spec.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// ─── Categories ─────────────────────────────────────────────
router.get('/categories', specController.getAllCategories);
router.get('/categories/:id', specController.getCategoryById);
router.post('/categories', authenticate, authorize('owner', 'admin', 'manager'), specController.createCategory);
router.put('/categories/:id', authenticate, authorize('owner', 'admin'), specController.updateCategory);
router.delete('/categories/:id', authenticate, authorize('owner', 'admin'), specController.deleteCategory);

// ─── Specs (Digital Twin) ───────────────────────────────────
router.post('/specs', authenticate, authorize('owner', 'admin', 'manager'), specController.createSpec);
router.get('/specs/:id', authenticate, specController.getSpec);

// P0: Жизненный цикл — advance, BOM save, BOM node removal
router.post('/specs/:id/advance', authenticate, authorize('owner', 'admin', 'manager'), specController.advanceLifecycle);
router.post('/specs/:id/bom', authenticate, authorize('owner', 'admin', 'engineer'), specController.saveBom);
router.post('/specs/:id/bom/remove-node', authenticate, authorize('owner', 'admin', 'engineer'), specController.removeBomNode);

export default router;
