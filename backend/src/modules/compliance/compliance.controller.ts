import { Request, Response } from 'express';
import { complianceService } from './compliance.service';

/** POST /compliance/check */
export async function checkCompliance(req: Request, res: Response): Promise<void> {
  const { dealId, specId } = req.body;
  const id = await complianceService.checkCompliance(dealId, specId);
  res.status(201).json({ data: { id } });
}

/** POST /compliance/check-requirements — ручная проверка требований */
export async function checkRequirements(req: Request, res: Response): Promise<void> {
  const { specId, requirements } = req.body;
  const results = await complianceService.checkRequirements(specId, requirements);
  res.json({ data: { results } });
}

/** GET /compliance/check/:id */
export async function getCheckById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const data = await complianceService.getCheckById(id);
  if (!data) { res.status(404).json({ error: { message: 'Проверка не найдена' } }); return; }
  res.json({ data });
}
