import { Request, Response, NextFunction } from 'express';
import * as wtService from './work-task.service';

export const getByOrderItem = (req: Request, res: Response, next: NextFunction) =>
  wtService.getByOrderItem(req.params.orderItemId).then(data => res.json({ data })).catch(next);

export const getByOrder = (req: Request, res: Response, next: NextFunction) =>
  wtService.getByOrder(req.body.orderItemIds || []).then(data => res.json({ data })).catch(next);

export const create = (req: Request, res: Response, next: NextFunction) =>
  wtService.create(req.body).then(d => res.status(201).json({ data: d })).catch(next);

export const update = (req: Request, res: Response, next: NextFunction) =>
  wtService.update(req.params.id, req.body).then(d => res.json({ data: d })).catch(next);

export const remove = (req: Request, res: Response, next: NextFunction) =>
  wtService.remove(req.params.id).then(() => res.status(204).send()).catch(next);
