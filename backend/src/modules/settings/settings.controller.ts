import { Request, Response, NextFunction } from 'express';
import * as settingsService from './settings.service';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await settingsService.getAll();
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
}

export async function getByGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = req.params.group as string;
    const settings = await settingsService.getByGroup(group);
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
}

export async function getByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.params.key as string;
    const setting = await settingsService.getByKey(key);
    res.json({ data: setting });
  } catch (err) {
    next(err);
  }
}

export async function getMap(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const map = await settingsService.getMap();
    res.json({ data: map });
  } catch (err) {
    next(err);
  }
}

export async function upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await settingsService.upsert(req.body);
    res.json({ data: setting });
  } catch (err) {
    next(err);
  }
}

export async function patchByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.params.key as string;
    const { value } = req.body as { value: unknown };
    const setting = await settingsService.upsert({ key, value });
    res.json({ data: setting });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.params.key as string;
    await settingsService.remove(key);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
