// admin-service/src/controllers/adminAuthController.js

import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import env from '../config/env.js';

const generateToken = (id, userType = 'admin') => {
  return jwt.sign({ id, userType }, env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc   Admin Login
// @route  POST /api/admin/auth/login
// @access Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const admin = await AdminUser.findOne({ email }).select('+password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Get current admin
// @route  GET /api/admin/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

export { adminLogin, getMe };