import { Router } from 'express';
import { getFlightsByPrice } from '../controllers/flights.controller';

const router = Router();

/**
 * GET /api/v1/flights/
 * Get flights by price API
 */
router.get('/', getFlightsByPrice);

export default router;
