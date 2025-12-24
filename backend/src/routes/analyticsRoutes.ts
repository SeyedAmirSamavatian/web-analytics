import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { trackEvent, getDashboardStats } from '../controllers/analyticsController';

const router = Router();

// CORS middleware for track endpoint (public endpoint)
const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// Track endpoint doesn't need auth (public tracking)
router.post('/track', corsMiddleware, trackEvent);

// Dashboard endpoint requires authentication
router.get('/dashboard/:siteId', authenticate, getDashboardStats);

export default router;

