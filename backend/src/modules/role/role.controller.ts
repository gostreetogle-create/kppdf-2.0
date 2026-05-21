import { Request, Response, NextFunction } from 'express';
import * as roleService from './role.service';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await roleService.getAll();
    res.json({ data: roles });
  } catch (err) { next(err); }
}

export async function getByName(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.getByName(req.params.name as string);
    res.json({ data: role });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.create(req.body);
    res.status(201).json({ data: role });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.update(req.params.name as string, req.body);
    res.json({ data: role });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await roleService.remove(req.params.name as string);
    res.status(204).send();
  } catch (err) { next(err); }
}
