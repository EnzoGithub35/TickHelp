// backend/src/controllers/commentController.js
import { commentService } from '../services/commentService.js';
import { logger } from '../utils/logger.js';

export const commentController = {
  /**
   * Update a comment
   */
  async updateComment(req, res, next) {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.user.id;
      
      // Get the comment to check permissions
      const comment = await commentService.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check if user is the author or has admin/manager role
      const canEdit = comment.userId === userId || 
                      ['admin', 'manager'].includes(req.user.role);
                      
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this comment',
          code: 'FORBIDDEN'
        });
      }
      
      const updatedComment = await commentService.updateComment(commentId, content);
      
      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment
      });
    } catch (error) {
      logger.error('Update comment error:', error);
      next(error);
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(req, res, next) {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the comment to check permissions
      const comment = await commentService.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check if user is the author or has admin/manager role
      const canDelete = comment.userId === userId || 
                      ['admin', 'manager'].includes(req.user.role);
                      
      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this comment',
          code: 'FORBIDDEN'
        });
      }
      
      await commentService.deleteComment(commentId);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      logger.error('Delete comment error:', error);
      next(error);
    }
  }
};
