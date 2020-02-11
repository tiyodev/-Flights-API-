import { Router } from 'express';
import { getFlights } from '../controllers/flights.controller';

const router = Router();

/**
 * GET /api/v1/
 * Ping API version
 */
router.get('/', getFlights);

export default router;
