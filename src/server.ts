import errorHandler from 'errorhandler';
import { Request, Response } from 'express';
import app from './app';

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'dev') {
  // only use in dev environment
  app.use(errorHandler());
} else {
  app.use((err: Error, req: Request, res: Response) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(process.env.PORT || 3000, () => {
  console.log('  App is running at http://localhost:%d in %s mode', process.env.PORT, process.env.NODE_ENV);
  console.log('  Press CTRL-C to stop\n');
});
