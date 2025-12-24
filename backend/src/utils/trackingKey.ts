import { randomBytes } from 'crypto';

export const generateTrackingKey = (): string => {
  return randomBytes(32).toString('hex');
};

