// admin-service/src/models/SalonApplication.js

import mongoose from 'mongoose';

const salonApplicationSchema = new mongoose.Schema({
  // Salon service se reference
  salonId: {
    type: String,
    required: true
  },

  ownerId: {
    type: String,
    required: true
  },

  salonName: {
    type: String,
    required: true
  },

  ownerName: String,
  ownerEmail: String,
  ownerPhone: String,

  address: {
    city: String,
    state: String,
    pincode: String
  },

  documents: {
    businessLicense: String,
    gstNumber: String,
    aadhar: String
  },

  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },

  reviewedBy: String,
  reviewNote: String,
  reviewedAt: Date

}, { timestamps: true });

salonApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('SalonApplication', salonApplicationSchema);
