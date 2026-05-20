import { Router } from 'express';
import * as productController from './product.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authorize('owner', 'admin', 'manager'), productController.create);
router.put('/:id', authorize('owner', 'admin', 'manager'), productController.update);
router.delete('/:id', authorize('owner', 'admin'), productController.remove);

export default router;
