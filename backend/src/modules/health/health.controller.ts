import { Request, Response } from 'express';
import mongoose from 'mongoose';

export function getHealth(_req: Request, res: Response): void {
  const dbState = mongoose.connection.readyState;
  const dbStatus: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: dbStatus[dbState] || 'unknown',
    memory: process.memoryUsage(),
  });
}
