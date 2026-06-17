import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AdminUser from './src/models/AdminUser.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const adminData = {
      username: 'superadmin',
      email: 'admin@silverscisor.com',
      password: 'admin@123',
      role: 'superadmin',
      permissions: {
        manageSalons: true,
        manageUsers: true,
        manageServices: true,
        manageSubscriptions: true,
        viewAnalytics: true,
        sendNotifications: true
      }
    };

    const existing = await AdminUser.findOne({ email: adminData.email });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await AdminUser.create(adminData);
    console.log('Admin created successfully:');
    console.log('  Email:    ', admin.email);
    console.log('  Password: admin@123');
    console.log('  Role:     ', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
