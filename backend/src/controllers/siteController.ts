import { Response, NextFunction } from 'express';
import Joi from 'joi';
import { Site } from '../models/Site';
import { generateTrackingKey } from '../utils/trackingKey';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const addSiteSchema = Joi.object({
  url: Joi.string().uri().required(),
});

export const addSite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = addSiteSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message);
    }
    
    const { url } = value;
    const userId = req.userId!;
    
    // Generate unique tracking key
    let trackingKey = generateTrackingKey();
    let exists = await Site.findOne({ where: { trackingKey } });
    
    // Ensure uniqueness
    while (exists) {
      trackingKey = generateTrackingKey();
      exists = await Site.findOne({ where: { trackingKey } });
    }
    
    const site = await Site.create({
      userId,
      url,
      trackingKey,
    });
    
    res.status(201).json({
      message: 'Site added successfully',
      site: {
        id: site.id,
        url: site.url,
        trackingKey: site.trackingKey,
        createdAt: site.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserSites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    
    const sites = await Site.findAll({
      where: { userId },
      attributes: ['id', 'url', 'trackingKey', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    
    res.json({ sites });
  } catch (err) {
    next(err);
  }
};

export const deleteSite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { siteId } = req.params;
    const userId = req.userId!;
    
    const site = await Site.findOne({
      where: { id: parseInt(siteId), userId },
    });
    
    if (!site) {
      throw new AppError('Site not found or you do not have permission to delete it');
    }
    
    await site.destroy();
    
    res.json({ message: 'Site deleted successfully' });
  } catch (err) {
    next(err);
  }
};

