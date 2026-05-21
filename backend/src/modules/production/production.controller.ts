import { Request, Response } from 'express';
import { productionService } from './production.service';

/** GET /production/plan/:orderId */
export async function getPlanByOrder(req: Request, res: Response): Promise<void> {
  const data = await productionService.getPlanByOrder(req.params.orderId as string);
  if (!data) { res.status(404).json({ error: { message: 'Plan not found' } }); return; }
  res.json({ data });
}

/** POST /production/calculate */
export async function calculatePlan(req: Request, res: Response): Promise<void> {
  const { orderId, specId } = req.body;
  const id = await productionService.calculatePlan(orderId, specId);
  res.status(201).json({ data: { id } });
}

/** POST /production/plan/:orderId/approve */
export async function approvePlan(req: Request, res: Response): Promise<void> {
  await productionService.approvePlan(req.params.orderId as string);
  res.status(200).json({ data: { status: 'approved' } });
}
