// admin-service/src/controllers/systemController.js

import SystemLog from '../models/SystemLog.js';
import { checkConnection } from '../config/db.js';
import axios from 'axios';
import env from '../config/env.js';

// @desc   Get system health
// @route  GET /api/admin/system/health
// @access Private (admin)
const getSystemHealth = async (req, res, next) => {
  try {
    // Check all services
    const services = await Promise.allSettled([
      axios.get(`${env.AUTH_SERVICE_URL}/health`, { timeout: 3000 }),
      axios.get(`${env.SALON_SERVICE_URL}/health`, { timeout: 3000 })
    ]);

    const authStatus = services[0].status === 'fulfilled' ? 'healthy' : 'down';
    const salonStatus = services[1].status === 'fulfilled' ? 'healthy' : 'down';

    const health = {
      overall: authStatus === 'healthy' && salonStatus === 'healthy' ? 'healthy' : 'degraded',
      services: {
        admin: {
          status: 'healthy',
          db: checkConnection() ? 'connected' : 'disconnected',
          uptime: `${Math.floor(process.uptime())} seconds`
        },
        auth: { status: authStatus },
        salon: { status: salonStatus }
      },
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      },
      timestamp: new Date().toISOString()
    };

    const statusCode = health.overall === 'healthy' ? 200 : 207;
    res.status(statusCode).json({ success: true, data: health });

  } catch (error) {
    next(error);
  }
};

// @desc   Get system logs
// @route  GET /api/admin/system/logs
// @access Private (superadmin)
const getSystemLogs = async (req, res, next) => {
  try {
    const { level, service, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (level) filter.level = level;
    if (service) filter.service = service;

    const total = await SystemLog.countDocuments(filter);
    const logs = await SystemLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: logs
    });

  } catch (error) {
    next(error);
  }
};

// @desc   Create system log
// @route  POST /api/admin/system/logs
// @access Private
const createLog = async (req, res, next) => {
  try {
    const { level, service, action, message, metadata } = req.body;

    const log = await SystemLog.create({
      level, service, action, message, metadata
    });

    res.status(201).json({ success: true, data: log });

  } catch (error) {
    next(error);
  }
};

export { getSystemHealth, getSystemLogs, createLog };