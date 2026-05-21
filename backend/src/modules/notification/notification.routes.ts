import { Router } from 'express';
import * as notifCtrl from './notification.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
router.get('/sse', authenticate, notifCtrl.sse);
router.get('/unread', authenticate, notifCtrl.getUnread);
router.get('/', authenticate, notifCtrl.getAll);
router.patch('/:id/read', authenticate, notifCtrl.markRead);
router.patch('/read-all', authenticate, notifCtrl.markAllRead);
export default router;
