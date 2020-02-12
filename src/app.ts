import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import dotenv from 'dotenv';

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Import all routes
 */
import homeRoutes from './api/v1/routes/home.route';
import flightsRoutes from './api/v1/routes/flights.route';

// Create Express server
const app = express();

// Express configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

/**
 * API routes.
 */
app.use('/api/v1/', homeRoutes);
app.use('/api/v1/flights/', flightsRoutes);

// catch 404 HTTP error
app.get('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found', code: 404 });
});

export default app;
