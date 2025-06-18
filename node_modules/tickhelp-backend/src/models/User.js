import { pool } from '../database/connection.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

export class User {
  static async create(userData) {
    const { email, password, firstName, lastName, role = 'user' } = userData;
    
    try {
      // Hash le mot de passe avant de le stocker
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Insérer l'utilisateur dans la base de données
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, first_name, last_name, role, created_at`,
        [email, passwordHash, firstName, lastName, role]
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    const { firstName, lastName, avatarUrl } = userData;
    
    try {
      const result = await pool.query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             avatar_url = COALESCE($3, avatar_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, email, first_name, last_name, role, avatar_url, is_active, updated_at`,
        [firstName, lastName, avatarUrl, id]
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  static async verifyPassword(password, passwordHash) {
    try {
      return await bcrypt.compare(password, passwordHash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw error;
    }
  }
}