import { Request, Response, NextFunction } from 'express';
import * as counterpartyService from './counterparty.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      role: req.query.role as any,
      isOurCompany: req.query.isOurCompany !== undefined ? req.query.isOurCompany === 'true' : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string | undefined,
    };
    const items = await counterpartyService.getAll(filters);
    res.json({ data: items, total: items.length });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await counterpartyService.getById(id);
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await counterpartyService.create(req.body);
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await counterpartyService.update(id, req.body);
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await counterpartyService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getOurCompanies(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await counterpartyService.getOurCompanies();
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
}

export async function getDefaultInitiator(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await counterpartyService.getDefaultInitiator();
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}
