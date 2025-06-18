// backend/src/routes/users.js
import express from 'express';
import { userController } from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateUserUpdate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users (with pagination, filtering)
 * @access Private (admin, manager)
 */
router.get('/', authenticateToken, authorizeRoles(['admin', 'manager']), userController.getUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (admin, manager, or self)
 */
router.get('/:id', authenticateToken, userController.getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private (admin, or manager for their team)
 */
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'manager']), validateUserUpdate, userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user (soft delete by setting is_active to false)
 * @access Private (admin only)
 */
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), userController.deleteUser);

/**
 * @route GET /api/users/stats
 * @desc Get user statistics
 * @access Private (admin, manager)
 */
router.get('/stats', authenticateToken, authorizeRoles(['admin', 'manager']), userController.getUserStats);

export { router as userRoutes };
