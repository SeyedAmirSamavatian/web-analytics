import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { trackEvent, getDashboardStats } from '../controllers/analyticsController';

const router = Router();

// CORS middleware for track endpoint (public endpoint - allows all origins)
const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  // For track endpoint, allow all origins since it's a public tracking script
  // that can be embedded on any website
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // If no origin (like from same origin), allow it
    res.header('Access-Control-Allow-Origin', '*');
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

