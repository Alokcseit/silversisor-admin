// admin-service/src/controllers/subscriptionController.js

import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SystemLog from '../models/SystemLog.js';

// @desc   Get all subscriptions
// @route  GET /api/admin/subscriptions
// @access Private (admin)
const getAllSubscriptions = async (req, res, next) => {
  try {
    const { plan, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (plan) filter.plan = plan;
    if (status) filter['billing.status'] = status;

    const total = await SubscriptionPlan.countDocuments(filter);
    const subscriptions = await SubscriptionPlan.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Revenue summary
    const revenue = await SubscriptionPlan.aggregate([
      { $match: { 'billing.status': 'active' } },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$billing.amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      revenue,
      data: subscriptions
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Update salon plan (manual by admin)
// @route  PUT /api/admin/subscriptions/:salonId/plan
// @access Private (superadmin)
const updateSalonPlan = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { plan, reason, tokensToAdd } = req.body;

    const subscription = await SubscriptionPlan.findOneAndUpdate(
      { salonId },
      {
        plan,
        $inc: { tokenBalance: tokensToAdd || 0 },
        $push: {
          planHistory: {
            plan,
            startDate: new Date(),
            reason: reason || `Changed by admin ${req.admin.username}`
          }
        }
      },
      { new: true, upsert: true }
    );

    await SystemLog.create({
      level: 'info',
      service: 'admin',
      action: 'PLAN_UPDATED',
      message: `Salon ${salonId} plan changed to ${plan} by ${req.admin.username}`,
      metadata: { salonId, adminId: req.admin._id.toString(), plan, reason }
    });

    res.status(200).json({
      success: true,
      message: `Plan updated to ${plan}`,
      data: subscription
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Add tokens to salon
// @route  POST /api/admin/subscriptions/:salonId/tokens
// @access Private (admin)
const addTokensToSalon = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { tokens, reason } = req.body;

    const subscription = await SubscriptionPlan.findOneAndUpdate(
      { salonId },
      { $inc: { tokenBalance: tokens } },
      { new: true, upsert: true }
    );

    await SystemLog.create({
      level: 'info',
      service: 'admin',
      action: 'TOKENS_ADDED',
      message: `${tokens} tokens added to salon ${salonId} by ${req.admin.username}`,
      metadata: { salonId, tokens, reason }
    });

    res.status(200).json({
      success: true,
      message: `${tokens} tokens added`,
      data: subscription
    });

  } catch (error) {
    next(error);
  }
};

export { getAllSubscriptions, updateSalonPlan, addTokensToSalon };