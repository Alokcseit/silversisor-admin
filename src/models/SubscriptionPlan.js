// admin-service/src/models/SubscriptionPlan.js

import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  salonId: {
    type: String,
    required: true,
    unique: true
  },

  ownerId: String,
  salonName: String,

  plan: {
    type: String,
    enum: ['free', 'silver', 'gold', 'platinum'],
    default: 'free'
  },

  tokenBalance: { type: Number, default: 0 },

  billing: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['monthly', 'yearly'] },
    nextBillingDate: Date,
    razorpaySubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing'],
      default: 'active'
    }
  },

  payments: [{
    amount: Number,
    paidAt: Date,
    transactionId: String,
    status: { type: String, enum: ['success', 'failed', 'refunded'] }
  }],

  planHistory: [{
    plan: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }]

}, { timestamps: true });

subscriptionPlanSchema.index({ plan: 1, 'billing.status': 1 });

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);