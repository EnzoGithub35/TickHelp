// backend/src/services/ticketService.js
import { Ticket } from '../models/Ticket.js';
import { pool } from '../database/connection.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export const ticketService = {
  /**
   * Find all tickets with filtering, pagination, and sorting
   */
  async findAll(options = {}) {
    const tickets = await Ticket.findAll(options);
    
    return {
      data: tickets.rows,
      pagination: {
        page: options.page || 1,
        limit: options.limit || 10,
        total: tickets.count,
        totalPages: Math.ceil(tickets.count / (options.limit || 10))
      }
    };
  },

  /**
   * Find ticket by ID
   */
  async findById(id) {
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      throw new NotFoundError('Ticket not found', 'TICKET_NOT_FOUND');
    }
    
    return ticket;
  },

  /**
   * Create a new ticket
   */
  async create(ticketData, reporterId) {
    // Validate the data
    if (!ticketData.title) {
      throw new ValidationError('Title is required', 'TITLE_REQUIRED');
    }
    
    // Create the ticket
    const ticket = await Ticket.create(ticketData, reporterId);
    
    return ticket;
  },

  /**
   * Update a ticket
   */
  async update(id, ticketData, userId) {
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      throw new NotFoundError('Ticket not found', 'TICKET_NOT_FOUND');
    }
    
    // Update the ticket
    const updatedTicket = await Ticket.update(id, ticketData, userId);
    
    return updatedTicket;
  },

  /**
   * Delete a ticket
   */
  async delete(id, userId) {
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      throw new NotFoundError('Ticket not found', 'TICKET_NOT_FOUND');
    }
    
    // Delete the ticket
    await Ticket.delete(id, userId);
    
    return true;
  },

  /**
   * Get ticket statistics
   */
  async getStats() {
    // Get total tickets count
    const totalResult = await pool.query('SELECT COUNT(*) FROM tickets');
    const total = parseInt(totalResult.rows[0].count);
    
    // Get count by status
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) 
      FROM tickets 
      GROUP BY status
      ORDER BY COUNT(*) DESC
    `);
    
    // Get count by priority
    const priorityResult = await pool.query(`
      SELECT priority, COUNT(*) 
      FROM tickets 
      GROUP BY priority
      ORDER BY COUNT(*) DESC
    `);
    
    // Get count by type
    const typeResult = await pool.query(`
      SELECT type, COUNT(*) 
      FROM tickets 
      GROUP BY type
      ORDER BY COUNT(*) DESC
    `);
    
    // Get new tickets in last 30 days
    const newTicketsResult = await pool.query(`
      SELECT COUNT(*) 
      FROM tickets 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    
    // Get average resolution time for resolved tickets
    const avgResolutionResult = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_seconds
      FROM tickets
      WHERE status IN ('resolved', 'closed')
    `);
    
    // Transform the counts into a more usable format
    const statusStats = {};
    statusResult.rows.forEach(row => {
      statusStats[row.status] = parseInt(row.count);
    });
    
    const priorityStats = {};
    priorityResult.rows.forEach(row => {
      priorityStats[row.priority] = parseInt(row.count);
    });
    
    const typeStats = {};
    typeResult.rows.forEach(row => {
      typeStats[row.type] = parseInt(row.count);
    });
    
    // Calculate average resolution time in hours
    const avgResolutionHours = avgResolutionResult.rows[0].avg_seconds
      ? Math.round(avgResolutionResult.rows[0].avg_seconds / 3600 * 10) / 10
      : 0;
    
    return {
      total,
      byStatus: statusStats,
      byPriority: priorityStats,
      byType: typeStats,
      newLast30Days: parseInt(newTicketsResult.rows[0].count),
      avgResolutionTimeHours: avgResolutionHours
    };
  }
};
