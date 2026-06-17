// admin-service/src/routes/systemRoutes.js

import { Router } from 'express';
import { getSystemHealth, getSystemLogs, createLog } from '../controllers/systemController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/health', getSystemHealth);
router.use(protectAdmin);
router.get('/logs', getSystemLogs);
router.post('/logs', createLog);

export default router;