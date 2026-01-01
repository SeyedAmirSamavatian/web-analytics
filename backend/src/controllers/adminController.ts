import { Response } from 'express';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Site } from '../models/Site';

const ADMIN_EMAIL = 'mr.smvtn@gmail.com';

export const getAdminOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.userId ? await User.findByPk(req.userId) : null;
    if (!user || user.email !== ADMIN_EMAIL) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const [totalUsers, totalSites] = await Promise.all([
      User.count(),
      Site.count(),
    ]);

    const latestUsers = await User.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'isPro', 'proExpiryDate', 'createdAt'],
    });

    const latestSites = await Site.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      }],
    });

    const sanitizedSites = (latestSites as (Site & { user?: User })[]).map((site) => ({
      id: site.id,
      url: site.url,
      trackingKey: site.trackingKey,
      createdAt: site.createdAt,
      user: site.user
        ? { id: site.user.id, name: site.user.name, email: site.user.email }
        : null,
    }));

    res.json({
      totalUsers,
      totalSites,
      latestUsers,
      latestSites: sanitizedSites,
    });
  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Failed to load admin data' });
  }
};

