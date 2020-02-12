import errorHandler from 'errorhandler';
import { Request, Response } from 'express';
import app from './app';
import Logger from './api/v1/logger/logger';

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'dev') {
  // only use in dev environment
  app.use(errorHandler());
} else {
  app.use((err: Error, req: Request, res: Response) => {
    Logger.logError(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(process.env.PORT || 3000, () => {
  Logger.log(`%s App is running at %s in %s mode`, [
    {
      data: '✓',
      color: 'green',
    },
    {
      data: `http://localhost:${process.env.PORT || 3000}`,
      color: 'blue',
    },
    {
      data: process.env.NODE_ENV,
      color: 'blue',
    },
  ]);
  Logger.log(`Press CTRL-C to stop`);
});
