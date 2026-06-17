// admin-service/server.js

import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { startAnalyticsJob } from './src/jobs/analyticsJob.js';

const PORT = process.env.PORT || 5003;
let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════╗
║   Silverscisor Admin Service      ║
║   Port: ${PORT}                      ║
║   Status: Running ✅               ║
╚═══════════════════════════════════╝
      `);
    });

    // Background jobs
    startAnalyticsJob();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  server?.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  server?.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Graceful shutdown...');
  server?.close(() => {
    console.log('Admin server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received...');
  server?.close(() => process.exit(0));
});