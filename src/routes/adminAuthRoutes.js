// admin-service/src/routes/adminAuthRoutes.js

import { Router } from 'express';
import { adminLogin, getMe } from '../controllers/adminAuthController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', adminLogin);
router.get('/me', protectAdmin, getMe);

export default router;