import { Request, Response, NextFunction } from 'express';
import * as entityStatusService from './entity-status.service';

export async function getByEntityType(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entityType = req.params.entityType as string;
    const statuses = await entityStatusService.getByEntityType(entityType);
    res.json({ data: statuses });
  } catch (err) {
    next(err);
  }
}

export async function getInitial(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entityType = req.params.entityType as string;
    const status = await entityStatusService.getInitial(entityType);
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = req.body;
    const status = await entityStatusService.create(data);
    res.status(201).json({ data: status });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entityType = req.params.entityType as string;
    const statusId = req.params.statusId as string;
    const data = req.body;
    const status = await entityStatusService.update(entityType, statusId, data);
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entityType = req.params.entityType as string;
    const statusId = req.params.statusId as string;
    await entityStatusService.remove(entityType, statusId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
