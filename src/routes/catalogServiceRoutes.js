import express from 'express';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/catalogServiceController.js';

const router = express.Router();

// Public — get active catalog services (no auth needed for customer frontend)
router.get('/catalog', ctrl.getAll);

// Admin CRUD
router.get('/catalog/admin', protectAdmin, ctrl.getAll);
router.get('/catalog/:id', protectAdmin, ctrl.getById);
router.post('/catalog', protectAdmin, requirePermission('manageServices'), ctrl.create);
router.put('/catalog/:id', protectAdmin, requirePermission('manageServices'), ctrl.update);
router.delete('/catalog/:id', protectAdmin, requirePermission('manageServices'), ctrl.remove);

export default router;
