// admin-service/src/app.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import adminAuthRoutes from './routes/adminAuthRoutes.js';
import salonManagementRoutes from './routes/salonManagementRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import catalogServiceRoutes from './routes/catalogServiceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import { checkConnection } from './config/db.js';

const app = express();

app.use(helmet());

// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'http://localhost:3000',
//     process.env.CLIENT_URL
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
// }));



// admin-service/src/app.js mein same karo

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL,
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
    'null',
    'https://silverscisor.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter - admin routes ke liye strict
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Try again in 15 minutes.'
  }
});
app.use(adminLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Silverscisor Admin Service',
    status: 'Running',
    database: checkConnection() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/salons', salonManagementRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/subscriptions', subscriptionRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/system', systemRoutes);
app.use('/api/admin/services', catalogServiceRoutes);
app.use('/api/admin', uploadRoutes);

// 404
app.use('/api/admin', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

export default app;