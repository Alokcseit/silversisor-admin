// admin-service/src/models/PlatformAnalytics.js

import mongoose from 'mongoose';

const platformAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },

  users: {
    totalCustomers: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    totalSalonOwners: { type: Number, default: 0 },
    newSalonOwners: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 }
  },

  bookings: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },

  subscriptions: {
    free: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    platinum: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 }
  },

  tokens: {
    sold: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },

  salons: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    pending_approval: { type: Number, default: 0 }
  }

}, { timestamps: true });

export default mongoose.model('PlatformAnalytics', platformAnalyticsSchema);