// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config.js';
import { testConnection } from './database/connection.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes (à créer)
import { authRoutes } from './routes/auth.js';
import { dashboardRoutes } from './routes/dashboard.js';
// import { userRoutes } from './routes/users.js';
// import { ticketRoutes } from './routes/tickets.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
}));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    res.json({
      status: 'OK',
      message: 'Tick\'Help API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.env,
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes (à décommenter quand les routes seront créées)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/tickets', ticketRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Tick\'Help API',
    version: '1.0.0',
    description: 'Backend API for Tick\'Help ticket management system',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      tickets: '/api/tickets',
      health: '/api/health',
    },
  });
});

// Handle 404 for API routes
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(config.port, async () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`🌍 Environment: ${config.env}`);
  logger.info(`📊 Health check: http://localhost:${config.port}/api/health`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database on startup');
    process.exit(1);
  }
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;