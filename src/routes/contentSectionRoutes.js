import express from 'express';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/contentSectionController.js';

const router = express.Router();

router.get('/content', ctrl.getAll);
router.get('/content/:key', ctrl.getByKey);
router.post('/content', protectAdmin, requirePermission('manageServices'), ctrl.create);
router.put('/content/:key', protectAdmin, requirePermission('manageServices'), ctrl.update);
router.delete('/content/:key', protectAdmin, requirePermission('manageServices'), ctrl.remove);

export default router;
