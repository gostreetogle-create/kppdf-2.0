import { Request, Response, NextFunction } from 'express';
import * as documentTemplateService from './document-template.service';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const templates = await documentTemplateService.getAll();
    res.json({ data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getByType(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const documentType = req.params.type as string;
    const templates = await documentTemplateService.getByType(documentType);
    res.json({ data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const template = await documentTemplateService.getById(id);
    res.json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await documentTemplateService.create(req.body);
    res.status(201).json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const template = await documentTemplateService.update(id, req.body);
    res.json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await documentTemplateService.remove(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
