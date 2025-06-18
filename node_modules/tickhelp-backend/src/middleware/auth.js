import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { pool } from '../database/connection.js';
import { logger } from '../utils/logger.js';

// Version extrêmement simplifiée qui bypass complètement l'authentification
export const authenticateToken = async (req, res, next) => {
  // Inject a default admin user - NEVER DO THIS IN PRODUCTION!
  req.user = {
    id: 1,
    email: 'dev@example.com',
    role: 'admin',
    is_active: true,
    first_name: 'Dev',
    last_name: 'User'
  };
  
  logger.warn('⚠️ DEV MODE: Authentication completely bypassed, using default admin user');
  return next();
};

// Tous les rôles sont automatiquement autorisés
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    logger.warn(`⚠️ DEV MODE: Role authorization bypassed (required: ${roles.join(', ')})`);
    return next();
  };
};

// Alias pour la rétrocompatibilité
export const requireRole = authorizeRoles;