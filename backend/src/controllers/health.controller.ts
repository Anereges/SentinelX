import { Request, Response } from 'express';

export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      service: 'sentinelx-api',
      timestamp: new Date().toISOString(),
      version: '0.1.0'
    });
  }
}