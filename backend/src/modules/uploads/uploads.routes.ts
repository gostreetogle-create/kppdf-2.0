import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import * as uploadsController from './uploads.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomUUID() + ext;
    cb(null, name);
  },
});

/** Разрешённые MIME-типы изображений */
const imageFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Недопустимый формат изображения: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = Router();

// POST /uploads — загрузить одно или несколько изображений
router.post(
  '/',
  authenticate,
  authorize('owner', 'admin', 'manager'),
  upload.array('images', 10),
  uploadsController.upload,
);

// DELETE /uploads/:filename — удалить изображение
router.delete(
  '/:filename',
  authenticate,
  authorize('owner', 'admin', 'manager'),
  uploadsController.remove,
);

export default router;
