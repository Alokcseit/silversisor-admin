// admin-service/src/routes/salonManagementRoutes.js

import { Router } from 'express';
import {
  getAllSalons,
  approveSalon,
  blockSalon,
  getPendingApplications
} from '../controllers/salonManagementController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protectAdmin);

router.get('/', requirePermission('manageSalons'), getAllSalons);
router.get('/applications', requirePermission('manageSalons'), getPendingApplications);
router.put('/:salonId/approve', requirePermission('manageSalons'), approveSalon);
router.put('/:salonId/block', requirePermission('manageSalons'), blockSalon);

export default router;