// admin-service/src/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import env from '../config/env.js';

const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const admin = await AdminUser.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or deactivated'
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired'
    });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.admin.role === 'superadmin') return next();

    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }
    next();
  };
};

export { protectAdmin, requirePermission };