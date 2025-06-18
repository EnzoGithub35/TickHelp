// backend/src/services/userService.js
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { pool } from '../database/connection.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export const userService = {
  /**
   * Find all users with pagination and filtering
   */
  async findAll(options = {}) {
    const users = await User.findAll(options);
    
    return {
      data: users.rows.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      })),
      pagination: {
        page: options.page || 1,
        limit: options.limit || 10,
        total: users.count,
        totalPages: Math.ceil(users.count / (options.limit || 10))
      }
    };
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const user = await User.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  },

  /**
   * Update a user
   */
  async update(id, userData) {
    const user = await User.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    
    // Handle password update separately if provided
    if (userData.password) {
      userData.password_hash = await bcrypt.hash(userData.password, 12);
      delete userData.password;
    }
    
    // Transform camelCase to snake_case for database fields
    const dbFields = {};
    if (userData.firstName) dbFields.first_name = userData.firstName;
    if (userData.lastName) dbFields.last_name = userData.lastName;
    if (userData.email) dbFields.email = userData.email;
    if (userData.role) dbFields.role = userData.role;
    if (userData.isActive !== undefined) dbFields.is_active = userData.isActive;
    if (userData.avatarUrl) dbFields.avatar_url = userData.avatarUrl;
    if (userData.password_hash) dbFields.password_hash = userData.password_hash;
    
    const updatedUser = await User.update(id, dbFields);
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      isActive: updatedUser.is_active,
      avatarUrl: updatedUser.avatar_url,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
  },

  /**
   * Delete a user (soft delete)
   */
  async delete(id) {
    const user = await User.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    
    // Soft delete by setting is_active to false
    await User.update(id, { is_active: false });
    
    return true;
  },

  /**
   * Get user statistics
   */
  async getStats() {
    // Get total users count
    const totalResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(totalResult.rows[0].count);
    
    // Get count by role
    const roleResult = await pool.query(`
      SELECT role, COUNT(*) 
      FROM users 
      GROUP BY role
      ORDER BY COUNT(*) DESC
    `);
    
    // Get count of active/inactive users
    const activeResult = await pool.query(`
      SELECT is_active, COUNT(*) 
      FROM users 
      GROUP BY is_active
    `);
    
    // Get new users in last 30 days
    const newUsersResult = await pool.query(`
      SELECT COUNT(*) 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    
    // Transform the role counts into a more usable format
    const roleStats = {};
    roleResult.rows.forEach(row => {
      roleStats[row.role] = parseInt(row.count);
    });
    
    // Transform active/inactive counts
    const activeStats = {};
    activeResult.rows.forEach(row => {
      activeStats[row.is_active ? 'active' : 'inactive'] = parseInt(row.count);
    });
    
    return {
      total,
      byRole: roleStats,
      active: activeStats.active || 0,
      inactive: activeStats.inactive || 0,
      newLast30Days: parseInt(newUsersResult.rows[0].count)
    };
  }
};
