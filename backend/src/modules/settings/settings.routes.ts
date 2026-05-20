import { Router } from 'express';
import * as settingsController from './settings.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/map', settingsController.getMap);
router.get('/group/:group', settingsController.getByGroup);
router.get('/:key', settingsController.getByKey);
router.get('/', settingsController.getAll);
router.put('/:key', authorize('owner', 'admin'), settingsController.upsert);
router.post('/', authorize('owner', 'admin'), settingsController.upsert);
router.delete('/:key', authorize('owner', 'admin'), settingsController.remove);

export default router;
