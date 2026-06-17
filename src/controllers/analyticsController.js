// admin-service/src/controllers/analyticsController.js

import axios from 'axios';
import PlatformAnalytics from '../models/PlatformAnalytics.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import env from '../config/env.js';

// @desc   Get platform overview
// @route  GET /api/admin/analytics/overview
// @access Private (admin)
const getPlatformOverview = async (req, res, next) => {
  try {
    // Subscription stats from our DB
    const subscriptionStats = await SubscriptionPlan.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    const planCounts = { free: 0, silver: 0, gold: 0, platinum: 0 };
    subscriptionStats.forEach(s => {
      if (planCounts.hasOwnProperty(s._id)) {
        planCounts[s._id] = s.count;
      }
    });

    const totalSalons = Object.values(planCounts).reduce((a, b) => a + b, 0);

    // Revenue calculation
    const PLAN_PRICES = { silver: 499, gold: 999, platinum: 1999 };
    const monthlyRevenue = (planCounts.silver * PLAN_PRICES.silver) +
      (planCounts.gold * PLAN_PRICES.gold) +
      (planCounts.platinum * PLAN_PRICES.platinum);

    // Last 7 days analytics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAnalytics = await PlatformAnalytics.find({
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: {
        subscriptions: {
          breakdown: planCounts,
          totalPaidSalons: planCounts.silver + planCounts.gold + planCounts.platinum,
          totalSalons,
          monthlyRevenue
        },
        recentAnalytics
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Get revenue analytics
// @route  GET /api/admin/analytics/revenue
// @access Private (admin)
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const analytics = await PlatformAnalytics.find({
      date: { $gte: daysAgo }
    }).sort({ date: 1 });

    const totalRevenue = analytics.reduce(
      (sum, a) => sum + (a.subscriptions?.monthlyRevenue || 0) + (a.tokens?.revenue || 0),
      0
    );

    // Revenue by plan
    const revenueByPlan = await SubscriptionPlan.aggregate([
      { $match: { 'billing.status': 'active' } },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: { $sum: '$billing.amount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenueByPlan,
        dailyRevenue: analytics.map(a => ({
          date: a.date,
          revenue: (a.subscriptions?.monthlyRevenue || 0) + (a.tokens?.revenue || 0)
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Get user stats
// @route  GET /api/admin/analytics/users
// @access Private (admin)
const getUserStats = async (req, res, next) => {
  try {
    // Auth service se stats
    try {
      const response = await axios.get(
        `${env.AUTH_SERVICE_URL}/api/auth/stats`,
        { headers: { Authorization: req.headers.authorization } }
      );

      return res.status(200).json(response.data);

    } catch (err) {
      // Fallback to local analytics
      const analytics = await PlatformAnalytics.find()
        .sort({ date: -1 })
        .limit(30);

      return res.status(200).json({
        success: true,
        data: analytics.map(a => ({
          date: a.date,
          customers: a.users.totalCustomers,
          salonOwners: a.users.totalSalonOwners,
          newUsers: a.users.newCustomers + a.users.newSalonOwners
        }))
      });
    }

  } catch (error) {
    next(error);
  }
};

export { getPlatformOverview, getRevenueAnalytics, getUserStats };