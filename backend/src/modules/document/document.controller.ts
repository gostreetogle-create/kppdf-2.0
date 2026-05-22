import { Request, Response, NextFunction } from 'express';
import * as documentService from './document.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entityType = req.query.type as string | undefined;
    const documents = await documentService.getAll(entityType);
    res.json({ data: documents });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await documentService.getById(req.params.id as string);
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await documentService.create(req.body);
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function updateData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await documentService.updateData(req.params.id as string, req.body);
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function finalize(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await documentService.finalize(req.params.id as string);
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await documentService.remove(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
