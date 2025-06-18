// backend/src/services/attachmentService.js
import { pool } from '../database/connection.js';
import { config } from '../config/config.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../utils/errors.js';

export const attachmentService = {
  /**
   * Find attachment by ID
   */
  async findById(attachmentId) {
    const result = await pool.query(`
      SELECT * FROM attachments WHERE id = $1
    `, [attachmentId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const attachment = result.rows[0];
    
    return {
      id: attachment.id,
      ticketId: attachment.ticket_id,
      userId: attachment.user_id,
      filename: attachment.filename,
      originalFilename: attachment.original_filename,
      fileSize: attachment.file_size,
      mimeType: attachment.mime_type,
      filePath: attachment.file_path,
      createdAt: attachment.created_at
    };
  },

  /**
   * Create a new attachment for a ticket
   */
  async createAttachment(ticketId, userId, file) {
    // Ensure uploads directory exists
    const uploadDir = config.upload.path;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}_${path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Move the file from temp location to our uploads directory
      fs.copyFileSync(file.path, filePath);
      
      // Remove the temporary file
      fs.unlinkSync(file.path);
      
      // Save attachment info in database
      const result = await client.query(`
        INSERT INTO attachments (
          ticket_id, user_id, filename, original_filename, file_size, mime_type, file_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        ticketId,
        userId,
        uniqueFilename,
        file.originalname,
        file.size,
        file.mimetype,
        filePath
      ]);
      
      // Add entry in ticket history
      await client.query(`
        INSERT INTO ticket_history (ticket_id, user_id, action, comment)
        VALUES ($1, $2, 'attachment_added', $3)
      `, [ticketId, userId, `File "${file.originalname}" was attached to the ticket`]);
      
      await client.query('COMMIT');
      
      const attachment = result.rows[0];
      
      return {
        id: attachment.id,
        ticketId: attachment.ticket_id,
        userId: attachment.user_id,
        filename: attachment.filename,
        originalFilename: attachment.original_filename,
        fileSize: attachment.file_size,
        mimeType: attachment.mime_type,
        createdAt: attachment.created_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      
      // If an error occurs, make sure to clean up any created file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachmentId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the attachment before deletion
      const attachmentResult = await client.query(`
        SELECT * FROM attachments WHERE id = $1
      `, [attachmentId]);
      
      if (attachmentResult.rows.length === 0) {
        throw new NotFoundError('Attachment not found', 'ATTACHMENT_NOT_FOUND');
      }
      
      const attachment = attachmentResult.rows[0];
      
      // Delete the file
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }
      
      // Delete from database
      await client.query(`
        DELETE FROM attachments WHERE id = $1
      `, [attachmentId]);
      
      // Add entry in ticket history
      await client.query(`
        INSERT INTO ticket_history (ticket_id, user_id, action, comment)
        VALUES ($1, $2, 'attachment_removed', $3)
      `, [attachment.ticket_id, attachment.user_id, `File "${attachment.original_filename}" was removed from the ticket`]);
      
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
