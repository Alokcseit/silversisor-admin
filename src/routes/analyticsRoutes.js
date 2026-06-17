// admin-service/src/routes/analyticsRoutes.js

import { Router } from 'express';
import {
  getPlatformOverview,
  getRevenueAnalytics,
  getUserStats
} from '../controllers/analyticsController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protectAdmin);
router.use(requirePermission('viewAnalytics'));

router.get('/overview', getPlatformOverview);
router.get('/revenue', getRevenueAnalytics);
router.get('/users', getUserStats);

export default router;