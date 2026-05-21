import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

/** Загруженный файл — информация об изображении */
export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export async function upload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ error: { message: 'No files provided', code: 'NO_FILES' } });
      return;
    }

    const results: UploadResult[] = files.map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
    }));

    res.status(201).json({ data: results });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filename = req.params.filename as string;

    // Безопасность: не даём выйти за пределы uploads через ..
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: { message: 'File not found', code: 'FILE_NOT_FOUND' } });
      return;
    }

    fs.unlinkSync(filePath);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
