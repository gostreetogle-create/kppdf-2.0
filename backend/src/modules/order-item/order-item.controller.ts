import { Request, Response, NextFunction } from 'express';
import * as orderItemService from './order-item.service';

export async function getByOrderId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await orderItemService.getByOrderId(req.params.orderId as string);
    res.json({ data: items });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await orderItemService.create(req.body);
    res.status(201).json({ data: item });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await orderItemService.update(req.params.id as string, req.body);
    res.json({ data: item });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await orderItemService.remove(req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await orderItemService.reorder(req.params.orderId as string, req.body.itemIds);
    res.status(200).json({ ok: true });
  } catch (err) { next(err); }
}
