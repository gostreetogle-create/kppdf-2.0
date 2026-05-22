import { Request, Response } from 'express';
import { specService } from './spec.service';

/** GET /categories */
export async function getAllCategories(_req: Request, res: Response): Promise<void> {
  const data = await specService.getAllCategories();
  res.json({ data });
}

/** GET /categories/:id */
export async function getCategoryById(req: Request, res: Response): Promise<void> {
  const data = await specService.getCategory(req.params.id as string);
  if (!data) { res.status(404).json({ error: { message: 'Категория не найдена' } }); return; }
  res.json({ data });
}

/** POST /categories */
export async function createCategory(req: Request, res: Response): Promise<void> {
  const id = await specService.createCategory(req.body);
  res.status(201).json({ data: { id } });
}

/** PUT /categories/:id */
export async function updateCategory(req: Request, res: Response): Promise<void> {
  await specService.updateCategory(req.params.id as string, req.body);
  res.status(204).send();
}

/** DELETE /categories/:id */
export async function deleteCategory(req: Request, res: Response): Promise<void> {
  await specService.deleteCategory(req.params.id as string);
  res.status(204).send();
}

/** POST /specs */
export async function createSpec(req: Request, res: Response): Promise<void> {
  const { productId, categoryId } = req.body;
  const id = await specService.createSpec(productId, categoryId);
  res.status(201).json({ data: { id } });
}

/** GET /specs/:id */
export async function getSpec(req: Request, res: Response): Promise<void> {
  const data = await specService.getSpec(req.params.id as string);
  if (!data) { res.status(404).json({ error: { message: 'Спецификация не найдена' } }); return; }
  res.json({ data });
}

/**
 * POST /specs/:id/advance
 * Продвинуть спецификацию на следующую стадию жизненного цикла.
 * Возвращает полный результат: успех/неудача, violations, warnings, compliance, созданные задачи.
 */
export async function advanceLifecycle(req: Request, res: Response): Promise<void> {
  try {
    const result = await specService.advanceLifecycle(req.params.id as string);
    if (result.success) {
      res.json({ data: result });
    } else {
      // Бизнес-логика отклонила advance (незаполненные поля, compliance violations)
      res.status(422).json({ data: result });
    }
  } catch (err: any) {
    res.status(400).json({ error: { message: err.message ?? 'Advance failed' } });
  }
}

/** POST /specs/:id/bom — сохранить BOM-дерево */
export async function saveBom(req: Request, res: Response): Promise<void> {
  await specService.saveBom(req.params.id as string, req.body.bom);
  res.status(200).json({ data: { status: 'saved' } });
}

/** POST /specs/:id/bom/remove-node — удалить узел BOM с reparenting */
export async function removeBomNode(req: Request, res: Response): Promise<void> {
  try {
    const { nodeId } = req.body;
    const bom = await specService.removeBomNode(req.params.id as string, nodeId);
    res.json({ data: { bom } });
  } catch (err: any) {
    res.status(400).json({ error: { message: err.message ?? 'Remove failed' } });
  }
}
