import { Router } from 'express';
import * as settingsController from './settings.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// GET — публичные
router.get('/map', settingsController.getMap);
router.get('/group/:group', settingsController.getByGroup);
router.get('/:key', settingsController.getByKey);
router.get('/', settingsController.getAll);

// POST/PUT/DELETE — под токеном
router.put('/:key', authenticate, authorize('owner', 'admin'), settingsController.upsert);
router.post('/', authenticate, authorize('owner', 'admin'), settingsController.upsert);
router.delete('/:key', authenticate, authorize('owner', 'admin'), settingsController.remove);

export default router;
