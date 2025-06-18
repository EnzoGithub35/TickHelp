// backend/src/services/authService.js
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { ValidationError, AuthenticationError } from '../utils/errors.js';

export const authService = {
  /**
   * Register a new user
   */
  async register(userData) {
    // Check if email already exists
    const existingUser = await User.findByEmail(userData.email);
    
    if (existingUser) {
      throw new ValidationError('Email is already registered', 'EMAIL_IN_USE');
    }
    
    // Create the user
    const user = await User.create(userData);
    
    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Login user and return JWT tokens
   */
  async login(email, password) {
    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ValidationError('User not found', 'USER_NOT_FOUND');
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, userData) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ValidationError('User not found', 'USER_NOT_FOUND');
    }
    
    // Handle password update separately if provided
    if (userData.password) {
      userData.password_hash = await bcrypt.hash(userData.password, 12);
      delete userData.password;
    }
    
    // Update the user
    const updatedUser = await User.update(userId, userData);
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatar_url,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required', 'TOKEN_MISSING');
    }
    
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      
      // Get user
      const user = await User.findById(decoded.sub);
      
      if (!user || !user.is_active) {
        throw new AuthenticationError('Invalid refresh token', 'INVALID_TOKEN');
      }
      
      // Generate new tokens
      const tokens = this.generateTokens(user);
      
      return tokens;
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new AuthenticationError('Invalid refresh token', 'INVALID_TOKEN');
    }
  },

  /**
   * Generate JWT tokens for a user
   */
  generateTokens(user) {
    // Create payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    
    // Generate access token
    const accessToken = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    // Generate refresh token (longer expiry)
    const refreshToken = jwt.sign(
      payload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
    
    return {
      accessToken,
      refreshToken
    };
  }
};
