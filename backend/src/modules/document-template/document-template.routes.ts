import { Router } from 'express';
import * as documentTemplateController from './document-template.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Публичные
router.get('/', documentTemplateController.getAll);
router.get('/type/:type', documentTemplateController.getByType);
router.get('/:id', documentTemplateController.getById);

// Под токеном
router.post('/', authenticate, authorize('owner', 'admin', 'manager'), documentTemplateController.create);
router.put('/:id', authenticate, authorize('owner', 'admin', 'manager'), documentTemplateController.update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), documentTemplateController.remove);

export default router;
