import { Router } from 'express';
import { signIn } from '../controllers/auth.controller';

const router = Router();

/**
 * GET /api/v1/user/signin/
 * User signin
 */
router.post('/signin', signIn);

export default router;
