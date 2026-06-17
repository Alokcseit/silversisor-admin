import express from 'express';
import multer from 'multer';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { uploadImage } from '../controllers/uploadController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const router = express.Router();

router.post('/upload', protectAdmin, upload.single('image'), uploadImage);

export default router;
