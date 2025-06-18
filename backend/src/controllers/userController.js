// backend/src/controllers/userController.js
import { userService } from '../services/userService.js';
import { logger } from '../utils/logger.js';

export const userController = {
  /**
   * Get all users with pagination and filtering
   */
  async getUsers(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        role: req.query.role,
        search: req.query.search
      };
      
      const users = await userService.findAll(options);
      
      res.json({
        success: true,
        data: users.data,
        pagination: users.pagination
      });
    } catch (error) {
      logger.error('Get users error:', error);
      next(error);
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is requesting their own data or has admin/manager role
      if (userId !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this user data',
          code: 'FORBIDDEN'
        });
      }
      
      const user = await userService.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      next(error);
    }
  },

  /**
   * Update user
   */
  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Only admin can update roles
      if (userData.role && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to change user role',
          code: 'FORBIDDEN'
        });
      }
      
      const updatedUser = await userService.update(userId, userData);
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      logger.error('Update user error:', error);
      next(error);
    }
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check for self-deletion
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account',
          code: 'INVALID_OPERATION'
        });
      }
      
      await userService.delete(userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      next(error);
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      next(error);
    }
  }
};
