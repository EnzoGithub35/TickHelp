import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

// Génère un JWT pour l'utilisateur
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn || '24h',
    }
  );
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    // Vérifier unicité email
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: 'Email already in use',
        code: 'EMAIL_EXISTS',
      });
    }
    const user = await User.create({ email, password, firstName, lastName, role });
    // Générer le token
    const token = generateToken(user);
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    logger.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed', code: 'REGISTER_ERROR' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }
    const valid = await User.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' });
    }
    const token = generateToken(user);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed', code: 'LOGIN_ERROR' });
  }
};
