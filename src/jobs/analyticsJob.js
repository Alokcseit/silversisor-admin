// admin-service/src/jobs/analyticsJob.js

import cron from 'node-cron';
import axios from 'axios';
import PlatformAnalytics from '../models/PlatformAnalytics.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import env from '../config/env.js';

const startAnalyticsJob = () => {
  // Har raat 11:55 pe aaj ka data save karo
  cron.schedule('55 23 * * *', async () => {
    console.log('Running analytics collection job...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Subscription stats
      const subscriptionStats = await SubscriptionPlan.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } }
      ]);

      const planCounts = { free: 0, silver: 0, gold: 0, platinum: 0 };
      subscriptionStats.forEach(s => {
        if (planCounts.hasOwnProperty(s._id)) planCounts[s._id] = s.count;
      });

      const PLAN_PRICES = { silver: 499, gold: 999, platinum: 1999 };
      const monthlyRevenue = (planCounts.silver * PLAN_PRICES.silver) +
        (planCounts.gold * PLAN_PRICES.gold) +
        (planCounts.platinum * PLAN_PRICES.platinum);

      // User counts from auth service
      let userCounts = { totalCustomers: 0, totalSalonOwners: 0 };
      try {
        const userResponse = await axios.get(
          `${env.AUTH_SERVICE_URL}/api/auth/stats`,
          { timeout: 5000 }
        );
        userCounts = userResponse.data.data || userCounts;
      } catch (err) {
        console.warn('Could not fetch user stats:', err.message);
      }

      await PlatformAnalytics.findOneAndUpdate(
        { date: today },
        {
          date: today,
          users: userCounts,
          subscriptions: {
            ...planCounts,
            monthlyRevenue
          },
          salons: {
            total: Object.values(planCounts).reduce((a, b) => a + b, 0),
            active: planCounts.silver + planCounts.gold + planCounts.platinum
          }
        },
        { upsert: true, new: true }
      );

      console.log('✅ Analytics collected for', today.toDateString());

    } catch (error) {
      console.error('Analytics job failed:', error);
    }
  });

  console.log('✅ Analytics collection job started (daily 11:55 PM)');
};

export { startAnalyticsJob };