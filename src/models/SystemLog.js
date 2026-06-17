// admin-service/src/models/SystemLog.js

import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'critical'],
    required: true
  },

  service: {
    type: String,
    enum: ['auth', 'salon', 'admin', 'system'],
    required: true
  },

  action: { type: String, required: true },
  message: { type: String, required: true },

  metadata: {
    userId: String,
    salonId: String,
    ip: String,
    userAgent: String,
    extra: mongoose.Schema.Types.Mixed
  },

  resolvedAt: Date,
  resolvedBy: String

}, { timestamps: true });

// 90 din baad auto delete
systemLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);
systemLogSchema.index({ level: 1, service: 1, createdAt: -1 });

export default mongoose.model('SystemLog', systemLogSchema);