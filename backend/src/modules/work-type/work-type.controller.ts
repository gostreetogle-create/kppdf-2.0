import { Request, Response, NextFunction } from 'express';
import * as workTypeService from './work-type.service';

export const getAll = (_req: Request, res: Response, next: NextFunction) =>
  workTypeService.getAll().then(data => res.json({ data })).catch(next);

export const create = (req: Request, res: Response, next: NextFunction) =>
  workTypeService.create(req.body).then(d => res.status(201).json({ data: d })).catch(next);

export const update = (req: Request, res: Response, next: NextFunction) =>
  workTypeService.update(req.params.name as string, req.body).then(d => res.json({ data: d })).catch(next);

export const remove = (req: Request, res: Response, next: NextFunction) =>
  workTypeService.remove(req.params.name as string).then(() => res.status(204).send()).catch(next);
