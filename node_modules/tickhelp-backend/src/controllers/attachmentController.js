// backend/src/controllers/attachmentController.js
import { attachmentService } from '../services/attachmentService.js';
import { ticketService } from '../services/ticketService.js';
import { logger } from '../utils/logger.js';

export const attachmentController = {
  /**
   * Get (download) an attachment
   */
  async getAttachment(req, res, next) {
    try {
      const attachmentId = parseInt(req.params.id);
      
      const attachment = await attachmentService.findById(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check if user has access to the related ticket
      const ticket = await ticketService.findById(attachment.ticketId);
      
      // Check permissions for normal users
      if (req.user.role === 'user' && 
          ticket.reporterId !== req.user.id && 
          ticket.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this attachment',
          code: 'FORBIDDEN'
        });
      }
      
      // Send the file
      res.download(attachment.filePath, attachment.originalFilename);
    } catch (error) {
      logger.error('Get attachment error:', error);
      next(error);
    }
  },

  /**
   * Delete an attachment
   */
  async deleteAttachment(req, res, next) {
    try {
      const attachmentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const attachment = await attachmentService.findById(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check if user is admin/manager or the uploader
      const canDelete = attachment.userId === userId || 
                         ['admin', 'manager'].includes(req.user.role);
                         
      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this attachment',
          code: 'FORBIDDEN'
        });
      }
      
      await attachmentService.deleteAttachment(attachmentId);
      
      res.json({
        success: true,
        message: 'Attachment deleted successfully'
      });
    } catch (error) {
      logger.error('Delete attachment error:', error);
      next(error);
    }
  }
};
