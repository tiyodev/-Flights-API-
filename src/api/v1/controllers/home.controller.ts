import { Request, Response } from 'express';

/**
 * Send a welcome message
 * @param {Request} req
 * @param {Response} res
 */
export function pingApi(req: Request, res: Response): void {
  res.json({
    message: 'Welcome to the Flight API v1',
  });
}
