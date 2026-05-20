import { Router } from 'express';
import * as productController from './product.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// GET — публичные (чтение каталога без авторизации)
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// POST/PUT/DELETE — под токеном
router.post('/', authenticate, authorize('owner', 'admin', 'manager'), productController.create);
router.put('/:id', authenticate, authorize('owner', 'admin', 'manager'), productController.update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), productController.remove);

export default router;
