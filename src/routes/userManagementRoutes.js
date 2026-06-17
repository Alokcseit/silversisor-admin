// admin-service/src/routes/userManagementRoutes.js

import { Router } from 'express';
import { getAllUsers, blockUser, unblockUser } from '../controllers/userManagementController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protectAdmin);
router.use(requirePermission('manageUsers'));

router.get('/', getAllUsers);
router.put('/:userId/block', blockUser);
router.put('/:userId/unblock', unblockUser);

export default router;