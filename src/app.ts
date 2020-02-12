import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import dotenv from 'dotenv';
import authJwt from './api/v1/middleware/auth.middleware';
import RateLimit from 'express-rate-limit';

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Import all routes
 */
import homeRoutes from './api/v1/routes/home.route';
import flightsRoutes from './api/v1/routes/flights.route';
import userRoutes from './api/v1/routes/user.route';

// Create Express server
const app = express();

// Express configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// Define a rate limit to 5 request per 5 minutes
const limiter = RateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMs
});

/**
 * API routes.
 */
app.use('/api/v1/', homeRoutes);
// This route is protected by rate limit
app.use('/api/v1/user/', limiter, userRoutes);
// This route is protected by rate limit and authJwt middleware
app.use('/api/v1/flights/', limiter, authJwt, flightsRoutes);

// catch 404 HTTP error
app.get('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found', code: 404 });
});

export default app;
