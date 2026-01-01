import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAdminOverview } from '../controllers/adminController';

const router = Router();

router.get('/overview', authenticate, getAdminOverview);

export default router;

