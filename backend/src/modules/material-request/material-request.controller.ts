import { Request, Response, NextFunction } from 'express';
import * as mrService from './material-request.service';

export const getByOrder = (req: Request, res: Response, next: NextFunction) =>
  mrService.getByOrder(req.params.orderId).then(data => res.json({ data })).catch(next);

export const getByOrderItem = (req: Request, res: Response, next: NextFunction) =>
  mrService.getByOrderItem(req.params.orderItemId).then(data => res.json({ data })).catch(next);

export const create = (req: Request, res: Response, next: NextFunction) =>
  mrService.create(req.body).then(d => res.status(201).json({ data: d })).catch(next);

export const update = (req: Request, res: Response, next: NextFunction) =>
  mrService.update(req.params.id, req.body).then(d => res.json({ data: d })).catch(next);

export const approve = (req: Request, res: Response, next: NextFunction) =>
  mrService.approve(req.params.id, req.body.approvedQuantity, req.body.approvedBy)
    .then(d => res.json({ data: d })).catch(next);

export const remove = (req: Request, res: Response, next: NextFunction) =>
  mrService.remove(req.params.id).then(() => res.status(204).send()).catch(next);
