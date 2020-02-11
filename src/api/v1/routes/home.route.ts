import { Router } from 'express';
import * as homeController from '../controllers/home.controller';

const router = Router();

/**
 * GET /api/v1/
 * Ping API version
 */
router.get('/', homeController.pingApi);

export default router;
