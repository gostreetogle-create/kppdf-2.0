import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      statusId: req.query.statusId as string | undefined,
      priority: req.query.priority as string | undefined,
      search: req.query.search as string | undefined,
    };
    const orders = await orderService.getAll(filters);
    res.json({ data: orders });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.getById(req.params.id as string);
    res.json({ data: order });
  } catch (err) { next(err); }
}

export async function getWithItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await orderService.getWithItems(req.params.id as string);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await orderService.create(req.body);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.update(req.params.id as string, req.body);
    res.json({ data: order });
  } catch (err) { next(err); }
}

export async function recalcTotal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.recalcTotal(req.params.id as string);
    res.json({ data: order });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await orderService.remove(req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
}
