import { Request, Response, NextFunction } from 'express';
import * as notifService from './notification.service';

/** SSE endpoint — держать соединение открытым */
export function sse(req: Request, res: Response): void {
  const userId = (req as any).user?.sub;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('data: {"type":"connected"}\n\n');
  notifService.addSseClient(userId, res);
}

export const getUnread = (req: Request, res: Response, next: NextFunction) =>
  notifService.getUnread((req as any).user.sub).then(data => res.json({ data })).catch(next);

export const getAll = (req: Request, res: Response, next: NextFunction) =>
  notifService.getAll((req as any).user.sub).then(data => res.json({ data })).catch(next);

export const markRead = (req: Request, res: Response, next: NextFunction) =>
  notifService.markRead(req.params.id).then(() => res.json({ ok: true })).catch(next);

export const markAllRead = (req: Request, res: Response, next: NextFunction) =>
  notifService.markAllRead((req as any).user.sub).then(() => res.json({ ok: true })).catch(next);
