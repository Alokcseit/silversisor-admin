// admin-service/src/config/env.js

import dotenv from 'dotenv';
dotenv.config();

export default {
  PORT: process.env.PORT || 5003,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  SALON_SERVICE_URL: process.env.SALON_SERVICE_URL || 'http://localhost:5002',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL
};