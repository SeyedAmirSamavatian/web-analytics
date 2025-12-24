import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { addSite, getUserSites, deleteSite } from '../controllers/siteController';

const router = Router();

router.use(authenticate);

router.post('/add', addSite);
router.get('/list', getUserSites);
router.delete('/:siteId', deleteSite);

export default router;

