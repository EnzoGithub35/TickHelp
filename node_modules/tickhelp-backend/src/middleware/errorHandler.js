import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.details || err.message,
    });
  }

  // Erreur de base de données
  if (err.code && err.code.startsWith('23')) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        constraint: err.constraint,
      });
    }
    
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Referenced resource not found',
        code: 'FOREIGN_KEY_VIOLATION',
        constraint: err.constraint,
      });
    }
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Erreur de fichier trop volumineux
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      code: 'FILE_TOO_LARGE',
      maxSize: config.upload.maxFileSize,
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && config.env === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

// Middleware pour gérer les routes non trouvées
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};