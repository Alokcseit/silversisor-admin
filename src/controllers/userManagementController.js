// admin-service/src/controllers/userManagementController.js

import axios from 'axios';
import SystemLog from '../models/SystemLog.js';
import env from '../config/env.js';

// @desc   Get all users
// @route  GET /api/admin/users
// @access Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { userType, page = 1, limit = 20, search } = req.query;

    // Auth service se users fetch karo
    const response = await axios.get(`${env.AUTH_SERVICE_URL}/api/auth/users`, {
      params: { userType, page, limit, search },
      headers: { Authorization: req.headers.authorization }
    });

    res.status(200).json(response.data);

  } catch (error) {
    // Auth service not available
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Auth service temporarily unavailable'
      });
    }
    next(error);
  }
};

// @desc   Block user
// @route  PUT /api/admin/users/:userId/block
// @access Private (admin)
const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    await axios.put(
      `${env.AUTH_SERVICE_URL}/api/auth/users/${userId}/block`,
      { reason },
      { headers: { Authorization: req.headers.authorization } }
    );

    await SystemLog.create({
      level: 'warn',
      service: 'admin',
      action: 'USER_BLOCKED',
      message: `User ${userId} blocked by ${req.admin.username}. Reason: ${reason}`,
      metadata: { userId, adminId: req.admin._id.toString(), reason }
    });

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Unblock user
// @route  PUT /api/admin/users/:userId/unblock
// @access Private (admin)
const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await axios.put(
      `${env.AUTH_SERVICE_URL}/api/auth/users/${userId}/unblock`,
      {},
      { headers: { Authorization: req.headers.authorization } }
    );

    await SystemLog.create({
      level: 'info',
      service: 'admin',
      action: 'USER_UNBLOCKED',
      message: `User ${userId} unblocked by ${req.admin.username}`,
      metadata: { userId, adminId: req.admin._id.toString() }
    });

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    next(error);
  }
};

export { getAllUsers, blockUser, unblockUser };
