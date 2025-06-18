// backend/src/routes/attachments.js
import express from 'express';
import { attachmentController } from '../controllers/attachmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/attachments/:id
 * @desc Download an attachment
 * @access Private
 */
router.get('/:id', authenticateToken, attachmentController.getAttachment);

/**
 * @route DELETE /api/attachments/:id
 * @desc Delete an attachment
 * @access Private (admin, manager, or ticket owner)
 */
router.delete('/:id', authenticateToken, attachmentController.deleteAttachment);

export { router as attachmentRoutes };
