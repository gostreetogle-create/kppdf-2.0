import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      kind: req.query.kind as any,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string | undefined,
    };
    const products = await productService.getAll(filters);
    res.json({ data: products, total: products.length });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const product = await productService.getById(id);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.create(req.body);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const product = await productService.update(id, req.body);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await productService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
