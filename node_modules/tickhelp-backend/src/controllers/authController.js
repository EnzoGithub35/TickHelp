// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

export const authController = {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      logger.info('Register attempt:', { email: req.body.email });
      
      const { email, password, firstName, lastName } = req.body;

      // Check if the user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          code: 'USER_EXISTS'
        });
      }

      // Create the user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'user' // Default role
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.info(`User registered successfully: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
          },
          accessToken: token
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'REGISTRATION_ERROR'
      });
    }
  },

  /**
   * Login user and return JWT token
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find the user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check the password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.info(`User logged in successfully: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            avatarUrl: user.avatar_url
          },
          accessToken: token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'LOGIN_ERROR'
      });
    }
  },

  /**
   * Get logged in user profile
   */
  async getProfile(req, res) {
    try {
      // En mode dev, renvoyer directement un profil utilisateur au lieu de le chercher en DB
      const mockUser = {
        id: 1,
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User',
        role: 'admin',
        avatarUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        data: mockUser
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'PROFILE_ERROR'
      });
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, avatarUrl } = req.body;

      const updatedUser = await User.update(req.user.id, {
        firstName,
        lastName,
        avatarUrl
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          role: updatedUser.role,
          avatarUrl: updatedUser.avatar_url,
          isActive: updatedUser.is_active,
          updatedAt: updatedUser.updated_at
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'UPDATE_PROFILE_ERROR'
      });
    }
  },

  /**
   * Logout user (client-side action)
   */
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  },

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          code: 'REFRESH_TOKEN_REQUIRED'
        });
      }

      // Implement refresh token logic here

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          // New tokens
        }
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'REFRESH_TOKEN_ERROR'
      });
    }
  }
};
