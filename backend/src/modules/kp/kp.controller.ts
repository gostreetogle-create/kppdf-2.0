import { Request, Response, NextFunction } from 'express';
import * as kpService from './kp.service';
import type { KpStatus } from '@shared/types/kp.interface';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      status: req.query.status as KpStatus | undefined,
      counterpartyId: req.query.counterpartyId as string | undefined,
      search: req.query.search as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };
    const result = await kpService.getAll(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const kp = await kpService.getById(id);
    res.json({ data: kp });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kp = await kpService.create({
      ...req.body,
      createdBy: (req as any).user.sub,
    });
    res.status(201).json({ data: kp });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const kp = await kpService.update(id, req.body);
    res.json({ data: kp });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await kpService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const id = req.params.id as string;
    const kp = await kpService.changeStatus(id, status, (req as any).user.sub);
    res.json({ data: kp });
  } catch (err) {
    next(err);
  }
}

export async function getNextNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kpType = (req.query.kpType as string | undefined) ?? 'standard' as any;
    const number = await kpService.generateNextNumber(kpType as any);
    res.json({ data: number });
  } catch (err) {
    next(err);
  }
}

export async function recalculate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await kpService.recalculate(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
