// admin-service/src/routes/subscriptionRoutes.js

import { Router } from 'express';
import {
  getAllSubscriptions,
  updateSalonPlan,
  addTokensToSalon
} from '../controllers/subscriptionController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protectAdmin);
router.use(requirePermission('manageSubscriptions'));

router.get('/', getAllSubscriptions);
router.put('/:salonId/plan', updateSalonPlan);
router.post('/:salonId/tokens', addTokensToSalon);

export default router;