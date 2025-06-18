// backend/src/services/commentService.js
import { pool } from '../database/connection.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export const commentService = {
  /**
   * Get all comments for a ticket
   */
  async getTicketComments(ticketId) {
    const result = await pool.query(`
      SELECT c.*, 
             u.id as user_id, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name,
             u.avatar_url as user_avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = $1
      ORDER BY c.created_at ASC
    `, [ticketId]);
    
    return result.rows.map(comment => ({
      id: comment.id,
      ticketId: comment.ticket_id,
      userId: comment.user_id,
      content: comment.content,
      isInternal: comment.is_internal,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: {
        id: comment.user_id,
        firstName: comment.user_first_name,
        lastName: comment.user_last_name,
        avatarUrl: comment.user_avatar_url
      }
    }));
  },

  /**
   * Find a comment by ID
   */
  async findById(commentId) {
    const result = await pool.query(`
      SELECT c.*, 
             u.id as user_id, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name,
             u.avatar_url as user_avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [commentId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const comment = result.rows[0];
    
    return {
      id: comment.id,
      ticketId: comment.ticket_id,
      userId: comment.user_id,
      content: comment.content,
      isInternal: comment.is_internal,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: {
        id: comment.user_id,
        firstName: comment.user_first_name,
        lastName: comment.user_last_name,
        avatarUrl: comment.user_avatar_url
      }
    };
  },

  /**
   * Add a comment to a ticket
   */
  async addComment(ticketId, userId, content, isInternal = false) {
    if (!content || content.trim() === '') {
      throw new ValidationError('Comment content is required', 'CONTENT_REQUIRED');
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Add the comment
      const commentResult = await client.query(`
        INSERT INTO comments (ticket_id, user_id, content, is_internal)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [ticketId, userId, content, isInternal]);
      
      const comment = commentResult.rows[0];
      
      // Add entry in ticket history
      await client.query(`
        INSERT INTO ticket_history (ticket_id, user_id, action, comment)
        VALUES ($1, $2, 'commented', $3)
      `, [ticketId, userId, isInternal ? 'Added an internal note' : 'Added a comment']);
      
      await client.query('COMMIT');
      
      // Get user details for the response
      const userResult = await pool.query(`
        SELECT id, first_name, last_name, avatar_url
        FROM users
        WHERE id = $1
      `, [userId]);
      
      const user = userResult.rows[0];
      
      return {
        id: comment.id,
        ticketId: comment.ticket_id,
        userId: comment.user_id,
        content: comment.content,
        isInternal: comment.is_internal,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Update a comment
   */
  async updateComment(commentId, content) {
    if (!content || content.trim() === '') {
      throw new ValidationError('Comment content is required', 'CONTENT_REQUIRED');
    }
    
    const commentResult = await pool.query(`
      UPDATE comments
      SET content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [content, commentId]);
    
    if (commentResult.rows.length === 0) {
      throw new NotFoundError('Comment not found', 'COMMENT_NOT_FOUND');
    }
    
    const comment = commentResult.rows[0];
    
    // Get user details
    const userResult = await pool.query(`
      SELECT id, first_name, last_name, avatar_url
      FROM users
      WHERE id = $1
    `, [comment.user_id]);
    
    const user = userResult.rows[0];
    
    return {
      id: comment.id,
      ticketId: comment.ticket_id,
      userId: comment.user_id,
      content: comment.content,
      isInternal: comment.is_internal,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url
      }
    };
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the comment before deletion to record in history
      const commentResult = await client.query(`
        SELECT * FROM comments WHERE id = $1
      `, [commentId]);
      
      if (commentResult.rows.length === 0) {
        throw new NotFoundError('Comment not found', 'COMMENT_NOT_FOUND');
      }
      
      const comment = commentResult.rows[0];
      
      // Delete the comment
      await client.query(`
        DELETE FROM comments WHERE id = $1
      `, [commentId]);
      
      // Record in ticket history
      await client.query(`
        INSERT INTO ticket_history (ticket_id, user_id, action, comment)
        VALUES ($1, $2, 'deleted_comment', $3)
      `, [comment.ticket_id, comment.user_id, 'Comment was deleted']);
      
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
