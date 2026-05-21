import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
router.get('/by-entity/:entityType/:entityId', authenticate, (req, res) => {
  // TODO: query attachments
  res.json({ data: [] });
});
export default router;
