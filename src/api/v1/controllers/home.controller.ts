import { Request, Response } from 'express';

/**
 * Send a welcome message
 * @param {Request} req
 * @param {Response} res
 */
export const pingApi = (req: Request, res: Response): void => {
  res.json({
    message: 'Welcome to the API v1',
  });
};
