// admin-service/src/controllers/salonManagementController.js

import axios from 'axios';
import SalonApplication from '../models/SalonApplication.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SystemLog from '../models/SystemLog.js';
import env from '../config/env.js';

// @desc   Get all salons
// @route  GET /api/admin/salons
// @access Private (admin)
const getAllSalons = async (req, res, next) => {
  try {
    const { status, plan, city, page = 1, limit = 20 } = req.query;

    // Salon service se data fetch karo
    const response = await axios.get(`${env.SALON_SERVICE_URL}/api/salon`, {
      params: { city },
      headers: { Authorization: req.headers.authorization }
    });

    let salons = response.data.data || [];

    // Subscription info merge karo
    const subscriptions = await SubscriptionPlan.find();
    const subMap = {};
    subscriptions.forEach(s => { subMap[s.salonId] = s; });

    salons = salons.map(salon => ({
      ...salon,
      subscription: subMap[salon._id] || { plan: 'free' }
    }));

    // Filter by plan
    if (plan) {
      salons = salons.filter(s => s.subscription?.plan === plan);
    }

    // Pagination
    const total = salons.length;
    const startIndex = (page - 1) * limit;
    const paginated = salons.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: paginated
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Approve salon
// @route  PUT /api/admin/salons/:salonId/approve
// @access Private (admin)
const approveSalon = async (req, res, next) => {
  try {
    const { salonId } = req.params;

    await SalonApplication.findOneAndUpdate(
      { salonId },
      {
        status: 'approved',
        reviewedBy: req.admin.username,
        reviewNote: req.body.note || 'Approved',
        reviewedAt: new Date()
      },
      { upsert: true }
    );

    // Log karo
    await SystemLog.create({
      level: 'info',
      service: 'admin',
      action: 'SALON_APPROVED',
      message: `Salon ${salonId} approved by ${req.admin.username}`,
      metadata: { salonId, adminId: req.admin._id.toString() }
    });

    res.status(200).json({
      success: true,
      message: 'Salon approved successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Block salon
// @route  PUT /api/admin/salons/:salonId/block
// @access Private (admin)
const blockSalon = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { reason } = req.body;

    // Salon service ko notify karo
    try {
      await axios.put(
        `${env.SALON_SERVICE_URL}/api/salon/${salonId}/block`,
        { reason },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.warn('Could not notify salon service:', err.message);
    }

    await SystemLog.create({
      level: 'warn',
      service: 'admin',
      action: 'SALON_BLOCKED',
      message: `Salon ${salonId} blocked. Reason: ${reason}`,
      metadata: { salonId, adminId: req.admin._id.toString(), reason }
    });

    res.status(200).json({
      success: true,
      message: 'Salon blocked successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Get pending applications
// @route  GET /api/admin/salons/applications
// @access Private (admin)
const getPendingApplications = async (req, res, next) => {
  try {
    const applications = await SalonApplication.find({ status: 'pending' })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    next(error);
  }
};

export { getAllSalons, approveSalon, blockSalon, getPendingApplications };