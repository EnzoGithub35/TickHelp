// backend/src/routes/comments.js
import express from 'express';
import { commentController } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateComment } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route PUT /api/comments/:id
 * @desc Update a comment
 * @access Private (owner, admin, or manager)
 */
router.put('/:id', authenticateToken, validateComment, commentController.updateComment);

/**
 * @route DELETE /api/comments/:id
 * @desc Delete a comment
 * @access Private (owner, admin, or manager)
 */
router.delete('/:id', authenticateToken, commentController.deleteComment);

export { router as commentRoutes };
