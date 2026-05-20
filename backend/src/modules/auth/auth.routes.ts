import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from './auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);

export default router;
