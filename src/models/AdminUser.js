// admin-service/src/models/AdminUser.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },

  role: {
    type: String,
    enum: ['superadmin', 'moderator', 'support'],
    default: 'moderator'
  },

  permissions: {
    manageSalons: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false },
    manageServices: { type: Boolean, default: true },
    manageSubscriptions: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: true },
    sendNotifications: { type: Boolean, default: false }
  },

  isActive: { type: Boolean, default: true },
  lastLogin: Date,

  refreshToken: {
    type: String,
    select: false
  }

}, { timestamps: true });

adminUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('AdminUser', adminUserSchema);